# ============================================================
# 天气相关接口
# ============================================================
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from services.weather_service import WeatherService

router = APIRouter()
weather_service = WeatherService()


# ==================== Pydantic 模型 ====================

class BackupPlanRequest(BaseModel):
    """备用方案请求"""
    weather_condition: str
    original_plan: dict


class CompareRequest(BaseModel):
    """版本对比请求"""
    trip_id: str


# ==================== 路由 ====================

@router.get("/forecast")
async def get_forecast(
    location: str = Query(..., min_length=1, description="地点名称"),
    days: int = Query(7, ge=1, le=15, description="预报天数")
):
    """获取天气预报"""
    forecast = await weather_service.get_forecast(location, days)
    return forecast


@router.get("/alert")
async def get_alert(
    location: str = Query(..., min_length=1, description="地点名称")
):
    """获取天气预警"""
    alerts = await weather_service.get_weather_alert(location)
    return alerts


@router.post("/backup-plan")
async def backup_plan(data: BackupPlanRequest):
    """生成恶劣天气备用方案"""
    backup = await weather_service.get_backup_plan(
        weather_condition=data.weather_condition,
        original_plan=data.original_plan
    )
    return backup


@router.post("/compare")
async def compare_versions(data: CompareRequest):
    """对比行程的晴天版与下雨版"""
    comparison = await weather_service.compare_weather_versions(data.trip_id)
    return comparison
