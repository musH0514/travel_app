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
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tripwise"

    # Redis 缓存
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT 认证配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24小时

    # === API Keys（请在 .env 中填入你的 Key）===
    AMAP_KEY: str = ""  # 高德地图 API Key
    DEEPSEEK_API_KEY: str = ""  # DeepSeek API Key
    # GEMINI_API_KEY: str = ""  # Google Gemini API Key
    # OPENAI_API_KEY: str = ""  # OpenAI API Key
    SERPAPI_KEY: str = ""  # SerpAPI Key
    HEFENG_KEY: str = ""  # 和风天气 Key
    OPENWEATHER_KEY: str = ""  # OpenWeatherMap Key
    BING_SEARCH_KEY: str = ""  # Bing Search API Key

    # 第三方服务切换
    DOMESTIC_MODE: bool = True  # True=国内模式(高德/和风), False=海外模式(Google/OpenWeather)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
