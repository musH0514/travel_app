# ============================================================
# TripWise 业务服务模块
# ============================================================
from services.ai_planner import AIPlanner
from services.weather_service import WeatherService
from services.map_service import MapService
from services.search_service import SearchService
from services.recommendation import RecommendationEngine

ai_planner = AIPlanner()
weather_service = WeatherService()
map_service = MapService()
search_service = SearchService()
recommendation_engine = RecommendationEngine()

__all__ = [
    "ai_planner",
    "weather_service",
    "map_service",
    "search_service",
    "recommendation_engine",
]
