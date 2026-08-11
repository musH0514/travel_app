# ============================================================
# AI 智能规划接口
# ============================================================
from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from services.ai_planner import AIPlanner
from services.search_service import SearchService
from services.trip_orchestrator import TripOrchestrator
from utils.deps import get_db, get_current_user

router = APIRouter()
ai_planner = AIPlanner()
search_service = SearchService()
orchestrator = TripOrchestrator()


# ==================== Pydantic 模型 ====================

class GeneratePlanRequest(BaseModel):
    """生成行程计划请求（旧接口，兼容保留）"""
    preferences: dict
    destinations: List[dict]
    weather: Optional[dict] = None


class PlanTripRequest(BaseModel):
    """创建行程页：一键规划请求"""
    # 兼容 city 或 destinations[0]
    city: Optional[str] = None
    destinations: Optional[List[str]] = None
    start_date: date
    end_date: date
    styles: List[str] = Field(default_factory=lambda: ["休闲度假"])
    budget_level: str = "舒适型"
    special_requirements: Optional[str] = ""


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

@router.post("/plan-trip")
async def plan_trip(
    data: PlanTripRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    端到端智能规划：天气 → LLM 选点 → 地图聚类 → 落库。
    前端「开始规划」应调用本接口。
    """
    city = (data.city or "").strip()
    if not city and data.destinations:
        city = str(data.destinations[0]).strip()
    if not city:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供目的地城市（city 或 destinations）",
        )

    try:
        result = await orchestrator.plan_and_persist(
            db=db,
            user_id=current_user.id,
            city=city,
            start_date=data.start_date,
            end_date=data.end_date,
            styles=data.styles or ["休闲度假"],
            budget_level=data.budget_level or "舒适型",
            special_requirements=data.special_requirements or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"规划失败: {e}",
        )

    return result


@router.post("/generate-plan")
async def generate_plan(
    data: GeneratePlanRequest,
    current_user=Depends(get_current_user)
):
    """AI 生成完整行程计划（旧接口，不落库）"""
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
