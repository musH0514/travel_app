# ============================================================
# TripWise API 主入口
# FastAPI 应用启动、中间件、路由注册
# ============================================================
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import init_db, async_session
from utils.cache import cache
from utils.status_updater import update_trip_statuses
from routers.auth import router as auth_router
from routers.destinations import router as destinations_router
from routers.trips import router as trips_router
from routers.weather import router as weather_router
from routers.ai_plan import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理：启动时初始化数据库和缓存"""
    # 启动时初始化
    print(f"[TripWise] {settings.APP_NAME} 正在启动...")
    await init_db()
    print("[TripWise] 数据库连接已建立")
    await cache.init()
    print("[TripWise] Redis 缓存已连接")

    # 根据北京时间自动更新行程状态
    try:
        async with async_session() as session:
            await update_trip_statuses(session)
        print("[TripWise] 行程状态已更新")
    except Exception as e:
        print(f"[TripWise] 行程状态更新失败: {e}")

    yield
    # 关闭时清理
    print("[TripWise] TripWise API 正在关闭...")


app = FastAPI(
    title="TripWise API",
    description="智能行程规划平台后端 API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 配置 —— 允许移动端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(destinations_router, prefix="/api/destinations", tags=["目的地"])
app.include_router(trips_router, prefix="/api/trips", tags=["行程"])
app.include_router(weather_router, prefix="/api/weather", tags=["天气"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI 规划"])


@app.get("/")
async def root():
    """根路径，返回 API 状态信息"""
    return {
        "message": "TripWise API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "debug": settings.DEBUG,
        "domestic_mode": settings.DOMESTIC_MODE,
        "apis_configured": {
            "amap": bool(settings.AMAP_KEY),
            "deepseek": bool(settings.DEEPSEEK_API_KEY),
            "gemini": bool(settings.GEMINI_API_KEY),
            "openai": bool(settings.OPENAI_API_KEY),
            "serpapi": bool(settings.SERPAPI_KEY),
            "hefeng": bool(settings.HEFENG_KEY),
            "openweather": bool(settings.OPENWEATHER_KEY),
            "bing": bool(settings.BING_SEARCH_KEY)
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
