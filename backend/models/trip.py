# ============================================================
# 整个行程计划模型
# ============================================================
import uuid
from datetime import datetime, date
from sqlalchemy import String, Integer, DateTime, Date, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class TripPlan(Base):
    __tablename__ = "trip_plans"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    # 目的地列表（有序）：JSON 数组 [{"id": "uuid", "order": 0}, ...]
    destinations: Mapped[list] = mapped_column(JSON, nullable=True, default=list)
    # 用户偏好设置
    preferences: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)
    # 总预算：JSON {"transport": 0, "accommodation": 0, "food": 0, "tickets": 0, "other": 0}
    total_budget: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)
    group_size: Mapped[int] = mapped_column(nullable=True, default=1)
    # 状态：draft（草稿）/ planning（规划中）/ confirmed（已确认）/ completed（已完成）
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<TripPlan {self.title}>"
