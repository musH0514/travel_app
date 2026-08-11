# ============================================================
# 行程规划编排器
# 天气 → LLM 候选 → 地图聚类 → 落库
# ============================================================
from datetime import date, time, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.destination import Destination
from models.itinerary import ItineraryItem
from models.trip import TripPlan
from services.ai_planner import AIPlanner
from services.map_service import MapService
from services.weather_service import WeatherService
from config import settings


# time_slot → (start, end)
_SLOT_TIMES = {
    "上午": (time(9, 0), time(12, 0)),
    "下午": (time(14, 0), time(17, 0)),
    "晚上": (time(19, 0), time(21, 0)),
}


class TripOrchestrator:
    """端到端智能规划编排"""

    def __init__(
        self,
        weather: Optional[WeatherService] = None,
        planner: Optional[AIPlanner] = None,
        maps: Optional[MapService] = None,
    ):
        self.weather = weather or WeatherService()
        self.planner = planner or AIPlanner()
        self.maps = maps or MapService()

    async def plan_and_persist(
        self,
        db: AsyncSession,
        user_id: str,
        city: str,
        start_date: date,
        end_date: date,
        styles: List[str],
        budget_level: str,
        special_requirements: str = "",
    ) -> Dict[str, Any]:
        if end_date < start_date:
            raise ValueError("结束日期不能早于开始日期")
        if not city.strip():
            raise ValueError("目的地城市不能为空")

        city = city.strip()
        styles = styles or ["休闲度假"]

        # 1) 天气
        weather_payload = await self.weather.get_forecast_for_range(city, start_date, end_date)
        day_infos = weather_payload.get("days", [])

        # 2) LLM 候选景点（已按天气室内外约束）
        llm_result = await self.planner.generate_weather_aware_candidates(
            city=city,
            day_infos=day_infos,
            styles=styles,
            budget_level=budget_level,
            special_requirements=special_requirements or "",
        )
        candidates = llm_result.get("candidates") or []

        # 3) 地图：补坐标 + 同日空间约束重排
        enriched = await self.maps.enrich_with_coordinates(city, candidates)
        ordered = self.maps.cluster_and_reorder_by_day(
            enriched,
            max_day_span_km=settings.MAX_DAY_SPAN_KM,
        )

        # 4) 落库
        title = llm_result.get("title") or f"{city}行程"
        budget = llm_result.get("total_budget") or {
            "transport": 0,
            "accommodation": 0,
            "food": 0,
            "tickets": 0,
            "other": 0,
            "total": 0,
        }
        if "total" not in budget:
            budget["total"] = sum(
                float(budget.get(k) or 0)
                for k in ("transport", "accommodation", "food", "tickets", "other")
            )

        preferences = {
            "style": styles[0],
            "styles": styles,
            "budgetLevel": budget_level,
            "specialRequirements": special_requirements or "",
        }

        trip = TripPlan(
            user_id=user_id,
            title=title,
            start_date=start_date,
            end_date=end_date,
            destinations=[],
            preferences=preferences,
            total_budget=budget,
            status="confirmed",
        )
        db.add(trip)
        await db.flush()  # 拿到 trip.id

        dest_summaries: List[Dict[str, Any]] = []
        dest_cache: Dict[str, Destination] = {}
        itinerary_response: List[Dict[str, Any]] = []

        for item in ordered:
            dest = await self._get_or_create_destination(db, city, item, dest_cache)
            summary = {
                "id": dest.id,
                "name": dest.name,
                "description": dest.description or "",
                "location": dest.location or {"lat": 0, "lng": 0},
                "images": dest.images or [],
                "category": dest.category,
                "rating": dest.rating or 0,
                "budget_per_person": dest.budget_per_person,
                "suggested_duration": dest.suggested_duration,
            }
            if not any(d["id"] == dest.id for d in dest_summaries):
                dest_summaries.append(summary)

            day_number = int(item.get("suggested_day") or 1)
            slot = item.get("time_slot") or "上午"
            start_t, end_t = _SLOT_TIMES.get(slot, _SLOT_TIMES["上午"])
            # 同一 time_slot 多个点时微调开始时间，避免完全重叠
            order_index = int(item.get("order_index") or 0)
            if order_index > 0 and slot == "上午":
                start_t = time(min(9 + order_index, 11), 0)
            elif order_index > 0 and slot == "下午":
                start_t = time(min(14 + order_index, 16), 0)

            activity_text = item.get("activity") or item.get("name") or "游览"
            notes_parts = [activity_text]
            if item.get("reason"):
                notes_parts.append(f"（{item['reason']}）")
            notes = "".join(notes_parts)

            itin = ItineraryItem(
                trip_id=trip.id,
                day_number=day_number,
                order_index=order_index,
                start_time=start_t,
                end_time=end_t,
                destination_id=dest.id,
                activity_type="景点",
                transport_mode="步行",
                transport_detail={"route": "", "duration": 15, "cost": 0},
                notes=notes,
                estimated_cost=float(item.get("estimated_cost") or 0),
            )
            db.add(itin)
            await db.flush()

            itinerary_response.append(self._serialize_itinerary_item(itin, dest, start_date))

        trip.destinations = dest_summaries
        await db.commit()
        await db.refresh(trip)

        return {
            "trip_id": trip.id,
            "title": trip.title,
            "start_date": trip.start_date.isoformat(),
            "end_date": trip.end_date.isoformat(),
            "total_budget": trip.total_budget,
            "preferences": trip.preferences,
            "weather": weather_payload,
            "tips": llm_result.get("tips") or [],
            "is_mock": bool(
                llm_result.get("is_mock")
                or weather_payload.get("is_mock")
                or any(c.get("geo_is_mock") for c in ordered)
            ),
            "itinerary": itinerary_response,
            "destinations": dest_summaries,
            "status": trip.status,
        }

    async def _get_or_create_destination(
        self,
        db: AsyncSession,
        city: str,
        item: Dict[str, Any],
        cache: Dict[str, Destination],
    ) -> Destination:
        name = str(item.get("name") or "未知景点")
        key = f"{city}::{name}"
        if key in cache:
            return cache[key]

        result = await db.execute(
            select(Destination).where(
                Destination.name == name,
                Destination.city == city,
            ).limit(1)
        )
        dest = result.scalar_one_or_none()
        if dest:
            cache[key] = dest
            return dest

        loc = item.get("location") or {"lat": 0, "lng": 0}
        category = str(item.get("category") or "城市地标")
        dest = Destination(
            name=name,
            description=str(item.get("activity") or ""),
            location={"lat": float(loc.get("lat") or 0), "lng": float(loc.get("lng") or 0)},
            country="中国",
            city=city,
            address=str(item.get("address") or f"{city}{name}"),
            category=category,
            images=[],
            rating=0,
            budget_per_person=int(item.get("estimated_cost") or 0),
            suggested_duration=float(item.get("duration_hours") or 2),
        )
        db.add(dest)
        await db.flush()
        cache[key] = dest
        return dest

    @staticmethod
    def _serialize_itinerary_item(
        item: ItineraryItem,
        dest: Destination,
        trip_start: date,
    ) -> Dict[str, Any]:
        item_date = (trip_start + timedelta(days=item.day_number - 1)).isoformat()
        return {
            "id": item.id,
            "trip_id": item.trip_id,
            "day_number": item.day_number,
            "date": item_date,
            "order_index": item.order_index,
            "start_time": item.start_time.isoformat() if item.start_time else None,
            "end_time": item.end_time.isoformat() if item.end_time else None,
            "destination_id": item.destination_id,
            "destination": {
                "id": dest.id,
                "name": dest.name,
                "description": dest.description or "",
                "location": dest.location or {"lat": 0, "lng": 0},
                "images": dest.images or [],
                "category": dest.category,
                "rating": dest.rating or 0,
                "budget_per_person": dest.budget_per_person,
                "suggested_duration": dest.suggested_duration,
                "address": dest.address,
                "city": dest.city,
            },
            "activity_type": item.activity_type,
            "transport_mode": item.transport_mode,
            "transport_detail": item.transport_detail,
            "notes": item.notes,
            "estimated_cost": item.estimated_cost,
        }
