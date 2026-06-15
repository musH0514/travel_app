# ============================================================
# 天气服务
# 国内使用和风天气，海外使用 OpenWeatherMap
# ============================================================
import json
from typing import Optional, Dict, Any, List
import httpx
from config import settings
from utils.cache import cache


_MOCK_FORECAST = {
    "location": "北京",
    "days": [
        {"date": "2026-06-16", "weather": "晴", "temperature": {"high": 32, "low": 22},
         "humidity": 45, "wind": "南风3级", "uv_index": 7, "suggestion": "适合户外活动"},
        {"date": "2026-06-17", "weather": "多云", "temperature": {"high": 30, "low": 21},
         "humidity": 50, "wind": "南风2级", "uv_index": 5, "suggestion": "适合出行"},
        {"date": "2026-06-18", "weather": "阵雨", "temperature": {"high": 28, "low": 20},
         "humidity": 65, "wind": "微风", "uv_index": 3, "suggestion": "建议带伞"}
    ],
    "is_mock": True
}


class WeatherService:
    """天气查询与备份计划生成服务"""

    async def get_forecast(self, location: str, days: int = 7) -> Dict[str, Any]:
        """获取天气预报，支持国内/海外切换"""
        # 先查缓存
        cache_key = cache.make_key("weather_forecast", location, str(days))
        cached = await cache.get(cache_key)
        if cached:
            return cached

        result = None
        if settings.DOMESTIC_MODE and settings.HEFENG_KEY:
            result = await self._fetch_hefeng(location, days)
        elif not settings.DOMESTIC_MODE and settings.OPENWEATHER_KEY:
            result = await self._fetch_openweather(location, days)

        if not result:
            result = _MOCK_FORECAST

        # 缓存 300 秒
        await cache.set(cache_key, result, ttl=300)
        return result

    async def _fetch_hefeng(self, location: str, days: int) -> Optional[Dict]:
        """调用和风天气 API 获取预报"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # 先获取城市 ID
                city_resp = await client.get(
                    "https://geoapi.qweather.com/v2/city/lookup",
                    params={"location": location, "key": settings.HEFENG_KEY}
                )
                city_data = city_resp.json()
                if city_data.get("code") != "200" or not city_data.get("location"):
                    return None
                location_id = city_data["location"][0]["id"]

                # 获取天气预报
                forecast_resp = await client.get(
                    "https://devapi.qweather.com/v7/weather/3d",
                    params={"location": location_id, "key": settings.HEFENG_KEY}
                )
                forecast_data = forecast_resp.json()
                if forecast_data.get("code") != "200":
                    return None

                days_forecast = forecast_data.get("daily", [])
                return {
                    "location": location,
                    "days": [
                        {
                            "date": d["fxDate"],
                            "weather": d["textDay"],
                            "temperature": {"high": float(d["tempMax"]), "low": float(d["tempMin"])},
                            "humidity": int(d.get("humidity", 0)),
                            "wind": d.get("windDirDay", ""),
                            "uv_index": int(d.get("uvIndex", 0)),
                            "suggestion": self._get_weather_suggestion(d["textDay"])
                        }
                        for d in days_forecast[:days]
                    ],
                    "source": "hefeng"
                }
        except Exception:
            return None

    async def _fetch_openweather(self, location: str, days: int) -> Optional[Dict]:
        """调用 OpenWeatherMap API 获取预报"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # 获取坐标
                geo_resp = await client.get(
                    "https://api.openweathermap.org/geo/1.0/direct",
                    params={"q": location, "limit": 1, "appid": settings.OPENWEATHER_KEY}
                )
                geo_data = geo_resp.json()
                if not geo_data:
                    return None
                lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

                # 获取天气
                weather_resp = await client.get(
                    "https://api.openweathermap.org/data/2.5/forecast",
                    params={
                        "lat": lat, "lon": lon,
                        "units": "metric",
                        "appid": settings.OPENWEATHER_KEY
                    }
                )
                weather_data = weather_resp.json()

                # 按天分组
                daily = {}
                for item in weather_data.get("list", []):
                    date_str = item["dt_txt"][:10]
                    if date_str not in daily:
                        daily[date_str] = {
                            "temps": [],
                            "weathers": set(),
                            "humidity": []
                        }
                    daily[date_str]["temps"].append(item["main"]["temp"])
                    daily[date_str]["weathers"].add(item["weather"][0]["main"])
                    daily[date_str]["humidity"].append(item["main"]["humidity"])

                days_forecast = []
                for date_str in sorted(daily.keys())[:days]:
                    d = daily[date_str]
                    weather_main = list(d["weathers"])[0] if d["weathers"] else "Unknown"
                    days_forecast.append({
                        "date": date_str,
                        "weather": weather_main,
                        "temperature": {
                            "high": round(max(d["temps"]), 1),
                            "low": round(min(d["temps"]), 1)
                        },
                        "humidity": round(sum(d["humidity"]) / len(d["humidity"])),
                        "wind": "",
                        "uv_index": 0,
                        "suggestion": self._get_weather_suggestion(weather_main)
                    })

                return {
                    "location": location,
                    "days": days_forecast,
                    "source": "openweather"
                }
        except Exception:
            return None

    def _get_weather_suggestion(self, weather: str) -> str:
        """根据天气给出出行建议"""
        suggestions = {
            "晴": "适合户外活动", "晴间多云": "适合出行",
            "多云": "适合出行", "阴": "建议带伞以防万一",
            "阵雨": "建议带伞", "雷阵雨": "注意防雷，减少户外活动",
            "小雨": "建议带伞", "中雨": "建议带伞，穿防水鞋",
            "大雨": "减少外出，注意安全", "暴雨": "尽量避免外出",
            "雪": "注意保暖，小心路滑", "雾": "开车注意安全",
            "Clear": "Good for outdoor activities",
            "Clouds": "Suitable for travel",
            "Rain": "Bring an umbrella",
            "Snow": "Keep warm, watch your step",
            "Thunderstorm": "Stay indoors if possible",
            "Drizzle": "Bring a light umbrella",
            "Fog": "Drive carefully"
        }
        return suggestions.get(weather, "出行请注意天气变化")

    async def get_weather_alert(self, location: str) -> Dict[str, Any]:
        """获取天气预警信息（国内用和风天气）"""
        if not settings.DOMESTIC_MODE or not settings.HEFENG_KEY:
            return {"alerts": [], "is_mock": True}

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                city_resp = await client.get(
                    "https://geoapi.qweather.com/v2/city/lookup",
                    params={"location": location, "key": settings.HEFENG_KEY}
                )
                city_data = city_resp.json()
                if city_data.get("code") != "200" or not city_data.get("location"):
                    return {"alerts": [], "is_mock": True}

                location_id = city_data["location"][0]["id"]
                alert_resp = await client.get(
                    "https://devapi.qweather.com/v7/warning/now",
                    params={"location": location_id, "key": settings.HEFENG_KEY}
                )
                alert_data = alert_resp.json()
                if alert_data.get("code") != "200":
                    return {"alerts": [], "is_mock": True}

                return {
                    "location": location,
                    "alerts": [
                        {
                            "title": a.get("title", ""),
                            "level": a.get("level", ""),
                            "type": a.get("type", ""),
                            "content": a.get("text", ""),
                            "start_time": a.get("startTime", ""),
                            "end_time": a.get("endTime", "")
                        }
                        for a in alert_data.get("warning", [])
                    ]
                }
        except Exception:
            return {"alerts": [], "is_mock": True}

    async def get_backup_plan(
        self,
        weather_condition: str,
        original_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """根据天气生成备用行程（转由 AI Planner 处理）"""
        from services.ai_planner import AIPlanner
        planner = AIPlanner()

        system_prompt = "你是旅行规划师，根据天气情况生成备用行程方案。"
        prompt = f"""
天气状况：{weather_condition}
原始行程：{json.dumps(original_plan, ensure_ascii=False)}

请根据当前天气情况调整行程，生成备用方案（室内活动为主），以JSON格式输出。
"""
        result_str = await planner._call_llm(prompt, system_prompt)
        try:
            return json.loads(result_str)
        except json.JSONDecodeError:
            return {"warning": "无法生成备用方案", "original_plan": original_plan, "is_mock": True}

    async def compare_weather_versions(self, trip_id: str) -> Dict[str, Any]:
        """比较同一行程的阳光版和雨天版"""
        from database import async_session
        from sqlalchemy import select

        async with async_session() as session:
            # 获取主版本行程
            result = await session.execute(
                select(TripPlan).where(TripPlan.id == trip_id)
            )
            trip = result.scalar_one_or_none()
            if not trip:
                return {"error": "行程不存在", "is_mock": True}

            # 获取该行程的所有行程项
            items_result = await session.execute(
                select(ItineraryItem)
                .where(ItineraryItem.trip_id == trip_id)
                .order_by(ItineraryItem.day_number, ItineraryItem.order_index)
            )
            items = items_result.scalars().all()

            sunny_items = [i for i in items if i.weather_version in ("sunny", "通用")]
            rainy_items = [i for i in items if i.weather_version in ("rainy", "通用")]

            return {
                "trip_id": trip_id,
                "title": trip.title,
                "sunny_version": [
                    {
                        "day": i.day_number,
                        "activity": i.activity,
                        "activity_type": i.activity_type,
                        "start_time": str(i.start_time) if i.start_time else "",
                        "end_time": str(i.end_time) if i.end_time else "",
                        "notes": i.notes
                    }
                    for i in sunny_items
                ],
                "rainy_version": [
                    {
                        "day": i.day_number,
                        "activity": i.activity,
                        "activity_type": i.activity_type,
                        "start_time": str(i.start_time) if i.start_time else "",
                        "end_time": str(i.end_time) if i.end_time else "",
                        "notes": i.notes
                    }
                    for i in rainy_items
                ],
                "has_sunny": len(sunny_items) > 0,
                "has_rainy": len(rainy_items) > 0
            }
