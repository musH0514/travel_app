# ============================================================
# TripWise 路由模块
# ============================================================
from routers.auth import router as auth_router
from routers.destinations import router as destinations_router
from routers.trips import router as trips_router
from routers.weather import router as weather_router
from routers.ai_plan import router as ai_router

__all__ = ["auth_router", "destinations_router", "trips_router", "weather_router", "ai_router"]
