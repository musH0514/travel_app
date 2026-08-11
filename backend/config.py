# ============================================================
# TripWise 全局配置
# 使用 pydantic-settings 从 .env 加载配置
# ============================================================
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 应用基础配置
    APP_NAME: str = "TripWise API"
    DEBUG: bool = True

    # 数据库连接
    # TODO(Yili): 按本机 PostgreSQL 账号修改 DATABASE_URL
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tripwise"

    # Redis 缓存（未启动 Redis 时缓存会自动降级为无缓存）
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT 认证配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24小时

    # === API Keys（请在 backend/.env 中填入你的 Key）===
    # TODO(Yili): 高德开放平台申请「Web服务」Key，用于地理编码 / POI
    AMAP_KEY: str = ""
    # TODO(Yili): DeepSeek 控制台申请 API Key（主力 LLM）
    DEEPSEEK_API_KEY: str = ""
    # TODO(Yili): 可选备用 LLM；DeepSeek 额度不足时会自动尝试
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    # TODO(Yili): 和风天气控制台申请 Key；免费版多为 3 日预报
    HEFENG_KEY: str = ""
    OPENWEATHER_KEY: str = ""
    BING_SEARCH_KEY: str = ""

    # 第三方服务切换
    DOMESTIC_MODE: bool = True  # True=国内模式(高德/和风), False=海外模式(Google/OpenWeather)

    # 同日行程空间跨度上限（公里）
    # TODO(Yili): 按城市体量调整，一线城市可适当加大到 20~25
    MAX_DAY_SPAN_KM: float = 15.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
