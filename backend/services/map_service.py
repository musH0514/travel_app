# ============================================================
# 地图服务
# 国内使用高德地图 API，海外使用 Google Maps API
# ============================================================
import json
from typing import Optional, Dict, Any, List
import httpx
from config import settings
from utils.cache import cache


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
