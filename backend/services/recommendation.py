# ============================================================
# 推荐引擎
# 基于用户偏好和 SQLAlchemy 查询的目的地/餐厅/住宿推荐
# ============================================================
import json
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.sql import func
from database import async_session
from models.destination import Destination
from models.trip import TripPlan
from models.itinerary import ItineraryItem
from utils.cache import cache


class RecommendationEngine:
    """行程推荐引擎"""

    async def recommend_destinations(
        self,
        user_preferences: Optional[Dict[str, Any]] = None,
        category: Optional[str] = None,
        price_level: Optional[str] = None,
        domestic: Optional[bool] = None,
        tags: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """根据用户偏好筛选并排序目的地"""
        cache_key = cache.make_key(
            "rec_dest",
            str(user_preferences or {}),
            str(category or ""),
            str(price_level or ""),
            str(domestic),
            str(tags or []),
            str(limit)
        )
        cached = await cache.get(cache_key)
        if cached:
            return cached

        async with async_session() as session:
            query = select(Destination)

            # 应用筛选条件
            conditions = []
            if category:
                conditions.append(Destination.category == category)
            if price_level:
                conditions.append(Destination.price_level == price_level)
            if domestic is not None:
                conditions.append(Destination.domestic == domestic)
            if tags:
                # PostgreSQL JSON 数组重叠查询
                tag_conditions = [
                    Destination.tags.contains([tag]) for tag in tags
                ]
                conditions.append(or_(*tag_conditions))

            if conditions:
                query = query.where(and_(*conditions))

            # 根据用户偏好排序
            if user_preferences:
                preferred_categories = user_preferences.get("preferred_categories", [])
                budget_level = user_preferences.get("budget_level", "")

                if preferred_categories:
                    category_conditions = [
                        Destination.category == cat for cat in preferred_categories
                    ]
                    query = query.where(or_(*category_conditions))

                if budget_level:
                    budget_map = {"经济": 1, "舒适": 2, "轻奢": 3, "豪华": 4}
                    preferred_level = budget_map.get(budget_level, 2)
                    query = query.order_by(
                        func.abs(
                            func.coalesce(
                                # 预算等级越接近越靠前
                                func.array_position(
                                    func.array_cat(
                                        func.array_agg(
                                            func.cast(Destination.price_level, func.text)
                                        )
                                    ),
                                    budget_level
                                ),
                                0
                            )
                        )
                    )

            # 按评分降序排列
            query = query.order_by(Destination.rating.desc()).limit(limit)

            result = await session.execute(query)
            destinations = result.scalars().all()

            results = [
                {
                    "id": d.id,
                    "name": d.name,
                    "name_en": d.name_en,
                    "description": d.description,
                    "location": d.location,
                    "country": d.country,
                    "city": d.city,
                    "address": d.address,
                    "category": d.category,
                    "images": d.images,
                    "rating": d.rating,
                    "price_level": d.price_level,
                    "tags": d.tags,
                    "suggested_duration": d.suggested_duration,
                    "domestic": d.domestic
                }
                for d in destinations
            ]

            await cache.set(cache_key, results, ttl=300)
            return results

    async def recommend_restaurants(
        self,
        trip_id: str,
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """沿途推荐餐厅"""
        from services.ai_planner import AIPlanner
        planner = AIPlanner()
        return await planner.get_food_recommendations(trip_id, constraints)

    async def recommend_accommodations(
        self,
        trip_id: str,
        budget: Optional[Dict[str, Any]] = None,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """推荐住宿方案"""
        from services.ai_planner import AIPlanner
        planner = AIPlanner()

        async with async_session() as session:
            result = await session.execute(
                select(TripPlan).where(TripPlan.id == trip_id)
            )
            trip = result.scalar_one_or_none()
            if not trip:
                return {"error": "行程不存在", "is_mock": True}

        system_prompt = "你是旅行住宿推荐专家，根据行程信息和预算推荐合适的住宿。"
        prompt = f"""
行程信息：
- 标题：{trip.title}
- 日期：{trip.start_date} 至 {trip.end_date}
- 目的地：{json.dumps(trip.destinations, ensure_ascii=False)}
- 总预算：{json.dumps(budget or trip.total_budget, ensure_ascii=False)}
- 用户偏好：{json.dumps(preferences, ensure_ascii=False) if preferences else '无'}

请推荐沿途住宿方案，以JSON格式输出，包含：
- hotels数组：name, address, price_level, price_per_night, rating, distance_to_center, amenities数组
- recommendations：住宿建议文本
"""
        result_str = await planner._call_llm(prompt, system_prompt)
        try:
            return json.loads(result_str)
        except json.JSONDecodeError:
            return {
                "hotels": [
                    {"name": "如家酒店（演示数据）", "address": "市中心",
                     "price_level": "经济", "price_per_night": 250, "rating": 4.0},
                    {"name": "全季酒店（演示数据）", "address": "商业区",
                     "price_level": "舒适", "price_per_night": 400, "rating": 4.3},
                    {"name": "亚朵酒店（演示数据）", "address": "景区附近",
                     "price_level": "舒适", "price_per_night": 550, "rating": 4.6}
                ],
                "recommendations": "建议选择位于市中心或景区附近的酒店，方便出行。（API Key 未配置，返回演示数据）",
                "is_mock": True
            }
