# ============================================================
# 目的地模型
# ============================================================
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Float, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(200), nullable=True)  # 英文名称（海外用）
    description: Mapped[str] = mapped_column(Text, nullable=True)
    # 经纬度：JSON 格式 {"lat": 39.9042, "lng": 116.4074}
    location: Mapped[dict] = mapped_column(JSON, nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    # 目的地分类：自然风光 / 人文历史 / 美食购物 / 主题乐园 / 城市地标
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # 图片列表：JSON 数组
    images: Mapped[list] = mapped_column(JSON, nullable=True, default=list)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    # 消费等级：经济 / 舒适 / 轻奢 / 豪华
    price_level: Mapped[str] = mapped_column(String(20), default="经济")
    tags: Mapped[list] = mapped_column(JSON, nullable=True, default=list)
    suggested_duration: Mapped[float] = mapped_column(Float, default=2.0)  # 建议游览时长（小时）
    domestic: Mapped[bool] = mapped_column(Boolean, default=True)  # True=国内, False=海外
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<Destination {self.name}>"
