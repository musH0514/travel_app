# ============================================================
# 每项活动明细模型
# ============================================================
import uuid
from datetime import datetime, time
from sqlalchemy import String, Integer, Float, DateTime, Time, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    trip_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("trip_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 第几天
    order_index: Mapped[int] = mapped_column(Integer, default=0)  # 排序字段
    start_time: Mapped[time] = mapped_column(Time, nullable=True)
    end_time: Mapped[time] = mapped_column(Time, nullable=True)
    destination_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("destinations.id", ondelete="SET NULL"),
        nullable=True
    )
    # 活动类型：景点 / 交通 / 餐饮 / 住宿 / 自由活动
    activity_type: Mapped[str] = mapped_column(String(30), default="景点")
    transport_mode: Mapped[str] = mapped_column(String(50), nullable=True)
    # 交通详情：JSON {"route": "...", "duration": 30, "cost": 20.0}
    transport_detail: Mapped[dict] = mapped_column(JSON, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0)

    def __repr__(self) -> str:
        return f"<ItineraryItem Day{self.day_number}: {self.activity_type}>"
