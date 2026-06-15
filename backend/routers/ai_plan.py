# ============================================================
# AI 智能规划接口
# ============================================================
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from services.ai_planner import AIPlanner
from services.search_service import SearchService
from utils.deps import get_db, get_current_user

router = APIRouter()
ai_planner = AIPlanner()
search_service = SearchService()


# ==================== Pydantic 模型 ====================

class GeneratePlanRequest(BaseModel):
    """生成行程计划请求"""
    preferences: dict
    destinations: List[dict]
    weather: Optional[dict] = None


class OptimizeRequest(BaseModel):
    """优化行程请求"""
    trip_id: str
    constraints: Optional[dict] = None


class LuggageRequest(BaseModel):
    """行李建议请求"""
    destination: str
    weather_forecast: Optional[dict] = None
    duration: int = 3


class FoodRequest(BaseModel):
    """美食推荐请求"""
    trip_id: str
    preferences: Optional[dict] = None


class SearchRequest(BaseModel):
    """搜索增强请求"""
    query: str
    sources: Optional[List[str]] = None


# ==================== 路由 ====================

@router.post("/generate-plan")
async def generate_plan(
    data: GeneratePlanRequest,
    current_user=Depends(get_current_user)
):
    """AI 生成完整行程计划"""
    plan = await ai_planner.generate_trip_plan(
        preferences=data.preferences,
        destinations=data.destinations,
        weather=data.weather
    )
    return plan


@router.post("/optimize")
async def optimize_itinerary(
    data: OptimizeRequest,
    current_user=Depends(get_current_user)
):
    """AI 优化现有行程"""
    optimized = await ai_planner.optimize_itinerary(
        trip_id=data.trip_id,
        constraints=data.constraints
    )
    return optimized


@router.post("/luggage-suggestions")
async def luggage_suggestions(
    data: LuggageRequest,
    current_user=Depends(get_current_user)
):
    """AI 行李打包建议"""
    suggestions = await ai_planner.get_luggage_suggestions(
        destination=data.destination,
        weather_forecast=data.weather_forecast,
        duration=data.duration
    )
    return suggestions


@router.post("/food-recommendations")
async def food_recommendations(
    data: FoodRequest,
    current_user=Depends(get_current_user)
):
    """AI 美食推荐"""
    recommendations = await ai_planner.get_food_recommendations(
        trip_id=data.trip_id,
        preferences=data.preferences
    )
    return recommendations


@router.post("/search-enhance")
async def search_enhance(
    data: SearchRequest,
    current_user=Depends(get_current_user)
):
    """搜索增强：从互联网搜索旅行信息"""
    results = await search_service.search_online(
        query=data.query,
        sources=data.sources
    )
    return results
