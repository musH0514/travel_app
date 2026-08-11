# ============================================================
# 地图服务
# 国内使用高德地图 API，海外使用 Google Maps API
# ============================================================
import math
from typing import Optional, Dict, Any, List
import httpx
from config import settings
from utils.cache import cache

# TODO(Yili): 同日最大空间跨度（公里），也可通过 .env 的 MAX_DAY_SPAN_KM 覆盖
DEFAULT_MAX_DAY_SPAN_KM = settings.MAX_DAY_SPAN_KM


_MOCK_GEOCODE = {
    "lat": 39.9042,
    "lng": 116.4074,
    "formatted_address": "北京市东城区天安门广场",
    "is_mock": True
}

_MOCK_POI = {
    "pois": [
        {"name": "故宫博物院", "address": "北京市东城区景山前街4号",
         "location": {"lat": 39.9163, "lng": 116.3972}, "category": "人文历史"},
        {"name": "天坛公园", "address": "北京市东城区天坛内东里7号",
         "location": {"lat": 39.8822, "lng": 116.4066}, "category": "人文历史"},
        {"name": "颐和园", "address": "北京市海淀区新建宫门路19号",
         "location": {"lat": 39.9999, "lng": 116.2755}, "category": "自然风光"}
    ],
    "is_mock": True
}

_MOCK_ROUTE = {
    "distance_meters": 5000,
    "duration_minutes": 30,
    "polyline": [],
    "steps": [
        {"instruction": "从天安门广场出发", "distance": 0},
        {"instruction": "沿长安街向东步行500米", "distance": 500},
        {"instruction": "到达故宫博物院", "distance": 4500}
    ],
    "is_mock": True
}


class MapService:
    """地图 POI 搜索、地理编码与路线规划"""

    async def geocode(self, address: str) -> Dict[str, Any]:
        """将地址转换为经纬度坐标"""
        cache_key = cache.make_key("geocode", address)
        cached = await cache.get(cache_key)
        if cached:
            return cached

        result = None
        if settings.DOMESTIC_MODE and settings.AMAP_KEY:
            result = await self._amap_geocode(address)
        elif not settings.DOMESTIC_MODE and settings.GEMINI_API_KEY:
            result = await self._google_geocode(address)

        if not result:
            result = _MOCK_GEOCODE

        await cache.set(cache_key, result, ttl=86400)  # 缓存 24 小时
        return result

    async def _amap_geocode(self, address: str) -> Optional[Dict]:
        """调用高德地理编码 API"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://restapi.amap.com/v3/geocode/geo",
                    params={"key": settings.AMAP_KEY, "address": address, "output": "JSON"}
                )
                data = resp.json()
                if data.get("status") != "1" or not data.get("geocodes"):
                    return None
                geo = data["geocodes"][0]
                location = geo.get("location", "0,0").split(",")
                return {
                    "lat": float(location[1]),
                    "lng": float(location[0]),
                    "formatted_address": geo.get("formatted_address", ""),
                    "source": "amap"
                }
        except Exception:
            return None

    async def _google_geocode(self, address: str) -> Optional[Dict]:
        """调用 Google 地理编码 API"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    params={"address": address, "key": settings.GEMINI_API_KEY}
                )
                data = resp.json()
                if data.get("status") != "OK" or not data.get("results"):
                    return None
                loc = data["results"][0]["geometry"]["location"]
                return {
                    "lat": loc["lat"],
                    "lng": loc["lng"],
                    "formatted_address": data["results"][0]["formatted_address"],
                    "source": "google"
                }
        except Exception:
            return None

    async def search_poi(self, keyword: str, location: Optional[str] = None) -> Dict[str, Any]:
        """搜索兴趣点（POI）"""
        cache_key = cache.make_key("poi", keyword, location or "")
        cached = await cache.get(cache_key)
        if cached:
            return cached

        result = None
        if settings.DOMESTIC_MODE and settings.AMAP_KEY:
            result = await self._amap_search_poi(keyword, location)
        elif not settings.DOMESTIC_MODE and settings.GEMINI_API_KEY:
            result = await self._google_search_poi(keyword, location)

        if not result:
            result = _MOCK_POI

        await cache.set(cache_key, result, ttl=600)
        return result

    async def _amap_search_poi(self, keyword: str, location: Optional[str]) -> Optional[Dict]:
        """高德 POI 搜索"""
        try:
            params = {"key": settings.AMAP_KEY, "keywords": keyword, "output": "JSON"}
            if location:
                params["location"] = location
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://restapi.amap.com/v3/place/text",
                    params=params
                )
                data = resp.json()
                if data.get("status") != "1":
                    return None
                return {
                    "pois": [
                        {
                            "name": p["name"],
                            "address": p.get("address", ""),
                            "location": {
                                "lat": float(p["location"].split(",")[1]),
                                "lng": float(p["location"].split(",")[0])
                            },
                            "category": p.get("type", "").split(";")[0] if p.get("type") else "",
                            "distance": p.get("distance", 0)
                        }
                        for p in data.get("pois", [])
                    ],
                    "source": "amap",
                    "total": int(data.get("count", 0))
                }
        except Exception:
            return None

    async def _google_search_poi(self, keyword: str, location: Optional[str]) -> Optional[Dict]:
        """Google Places API 搜索"""
        try:
            params = {
                "query": keyword,
                "key": settings.GEMINI_API_KEY
            }
            if location:
                params["location"] = location
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://maps.googleapis.com/maps/api/place/textsearch/json",
                    params=params
                )
                data = resp.json()
                if data.get("status") != "OK":
                    return None
                return {
                    "pois": [
                        {
                            "name": p["name"],
                            "address": p.get("formatted_address", ""),
                            "location": {
                                "lat": p["geometry"]["location"]["lat"],
                                "lng": p["geometry"]["location"]["lng"]
                            },
                            "category": p.get("types", [""])[0] if p.get("types") else "",
                            "rating": p.get("rating", 0)
                        }
                        for p in data.get("results", [])
                    ],
                    "source": "google",
                    "total": len(data.get("results", []))
                }
        except Exception:
            return None

    async def get_route(
        self,
        origin: str,
        destination: str,
        mode: str = "transit"
    ) -> Dict[str, Any]:
        """路线规划（高德 / Google）"""
        cache_key = cache.make_key("route", origin, destination, mode)
        cached = await cache.get(cache_key)
        if cached:
            return cached

        result = None
        if settings.DOMESTIC_MODE and settings.AMAP_KEY:
            result = await self._amap_route(origin, destination, mode)

        if not result:
            result = _MOCK_ROUTE

        await cache.set(cache_key, result, ttl=600)
        return result

    async def _amap_route(self, origin: str, destination: str, mode: str) -> Optional[Dict]:
        """高德路线规划"""
        mode_map = {
            "driving": "0", "transit": "1", "walking": "2", "cycling": "3"
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://restapi.amap.com/v3/direction/transit/integrated",
                    params={
                        "key": settings.AMAP_KEY,
                        "origin": origin,
                        "destination": destination,
                        "city": "",
                        "strategy": mode_map.get(mode, "0"),
                        "output": "JSON"
                    }
                )
                data = resp.json()
                if data.get("status") != "1":
                    return None
                route = data.get("route", {})
                transit = route.get("transits", [{}])[0] if route.get("transits") else {}
                return {
                    "distance_meters": int(transit.get("distance", "0")),
                    "duration_minutes": int(transit.get("duration", "0")) // 60,
                    "steps": [
                        {"instruction": s.get("instruction", ""), "distance": int(s.get("distance", 0))}
                        for s in transit.get("segments", [{}])[0].get("walking", {}).get("steps", [])
                    ] if transit.get("segments") else [],
                    "source": "amap",
                    "mode": mode
                }
        except Exception:
            return None

    async def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """根据经纬度获取地址"""
        cache_key = cache.make_key("reverse_geocode", str(lat), str(lng))
        cached = await cache.get(cache_key)
        if cached:
            return cached

        result = None
        if settings.DOMESTIC_MODE and settings.AMAP_KEY:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    resp = await client.get(
                        "https://restapi.amap.com/v3/geocode/regeo",
                        params={
                            "key": settings.AMAP_KEY,
                            "location": f"{lng},{lat}",
                            "output": "JSON"
                        }
                    )
                    data = resp.json()
                    if data.get("status") == "1":
                        regeo = data.get("regeocode", {})
                        result = {
                            "formatted_address": regeo.get("formatted_address", ""),
                            "country": regeo.get("addressComponent", {}).get("country", ""),
                            "province": regeo.get("addressComponent", {}).get("province", ""),
                            "city": regeo.get("addressComponent", {}).get("city", ""),
                            "district": regeo.get("addressComponent", {}).get("district", ""),
                            "source": "amap"
                        }
            except Exception:
                pass

        if not result:
            result = {
                "formatted_address": f"{lat},{lng}",
                "is_mock": True
            }

        await cache.set(cache_key, result, ttl=86400)
        return result

    @staticmethod
    def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """两点球面距离（公里）"""
        r = 6371.0
        p1, p2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlmb = math.radians(lng2 - lng1)
        a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
        return 2 * r * math.asin(math.sqrt(a))

    async def enrich_with_coordinates(
        self,
        city: str,
        candidates: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        为候选景点补全经纬度。
        优先高德 POI 文本搜索（city + name），失败再地理编码，再不行用 mock 偏移坐标。
        """
        enriched: List[Dict[str, Any]] = []
        has_key = bool(settings.DOMESTIC_MODE and settings.AMAP_KEY)

        for idx, c in enumerate(candidates):
            item = dict(c)
            name = item.get("name") or "未知地点"
            query = f"{city}{name}"
            lat = lng = None
            address = ""
            is_mock = False

            if has_key:
                poi = await self.search_poi(query)
                pois = poi.get("pois") or []
                if pois and not poi.get("is_mock"):
                    loc = pois[0].get("location") or {}
                    lat = loc.get("lat")
                    lng = loc.get("lng")
                    address = pois[0].get("address") or ""
                if lat is None or lng is None:
                    geo = await self.geocode(query)
                    if not geo.get("is_mock"):
                        lat = geo.get("lat")
                        lng = geo.get("lng")
                        address = geo.get("formatted_address") or address

            if lat is None or lng is None:
                # 无 Key / 查不到：在城市中心附近做确定性小偏移，保证聚类逻辑可跑
                base = _MOCK_GEOCODE
                lat = base["lat"] + (idx % 5) * 0.012
                lng = base["lng"] + (idx % 7) * 0.015
                address = f"{city}{name}"
                is_mock = True

            item["location"] = {"lat": float(lat), "lng": float(lng)}
            item["address"] = address or item.get("address") or f"{city}{name}"
            item["geo_is_mock"] = is_mock
            enriched.append(item)

        return enriched

    def cluster_and_reorder_by_day(
        self,
        candidates: List[Dict[str, Any]],
        max_day_span_km: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        同日内按贪心最近邻排序；若相邻两点距离过大，尝试与邻近天交换。
        TODO(Yili): 调大/调小 max_day_span_km 以适配不同城市尺度
        """
        span = max_day_span_km if max_day_span_km is not None else DEFAULT_MAX_DAY_SPAN_KM
        if not candidates:
            return []

        # 有真实坐标才做严格距离约束；全 mock 时只做同日排序
        any_real = any(not c.get("geo_is_mock") for c in candidates)

        by_day: Dict[int, List[Dict[str, Any]]] = {}
        for c in candidates:
            day = int(c.get("suggested_day") or 1)
            by_day.setdefault(day, []).append(dict(c))

        def nearest_neighbor_order(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            if len(points) <= 1:
                return points
            remaining = points[:]
            ordered = [remaining.pop(0)]
            while remaining:
                last = ordered[-1]["location"]
                best_i = 0
                best_d = float("inf")
                for i, p in enumerate(remaining):
                    loc = p["location"]
                    d = self.haversine_km(last["lat"], last["lng"], loc["lat"], loc["lng"])
                    if d < best_d:
                        best_d = d
                        best_i = i
                ordered.append(remaining.pop(best_i))
            return ordered

        # 先按天最近邻排序
        for day in list(by_day.keys()):
            by_day[day] = nearest_neighbor_order(by_day[day])

        if any_real:
            # 若同日相邻点跨度过大，尝试与相邻天交换 outdoor/indoor 标签相近的点
            days_sorted = sorted(by_day.keys())
            for day in days_sorted:
                points = by_day[day]
                if len(points) < 2:
                    continue
                for i in range(len(points) - 1):
                    a, b = points[i], points[i + 1]
                    dist = self.haversine_km(
                        a["location"]["lat"], a["location"]["lng"],
                        b["location"]["lat"], b["location"]["lng"],
                    )
                    if dist <= span:
                        continue
                    # 尝试把 b 换到相邻天
                    swapped = False
                    for other_day in (day - 1, day + 1):
                        if other_day not in by_day or not by_day[other_day]:
                            continue
                        for j, other in enumerate(by_day[other_day]):
                            if other.get("indoor_outdoor") != b.get("indoor_outdoor"):
                                continue
                            # 交换
                            by_day[other_day][j] = {**b, "suggested_day": other_day}
                            points[i + 1] = {**other, "suggested_day": day}
                            swapped = True
                            break
                        if swapped:
                            break
                by_day[day] = nearest_neighbor_order(points)

        # 展平并写回 order / suggested_day
        result: List[Dict[str, Any]] = []
        for day in sorted(by_day.keys()):
            for order_idx, item in enumerate(by_day[day]):
                item["suggested_day"] = day
                item["order_index"] = order_idx
                result.append(item)
        return result
