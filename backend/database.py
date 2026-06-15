# ============================================================
# TripWise 异步数据库引擎与会话管理
# ============================================================
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings

# 创建异步数据库引擎
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# 创建异步会话工厂
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """SQLAlchemy 声明基类，所有模型继承此类"""
    pass


async def get_db():
    """FastAPI 依赖注入 —— 获取数据库会话"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """初始化数据库：创建所有未创建的表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
