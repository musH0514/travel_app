from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.trip import TripPlan


async def update_trip_statuses(db: AsyncSession):
    """根据北京时间 (UTC+8) 更新所有行程的状态"""
    bj_tz = timezone(timedelta(hours=8))
    today = datetime.now(bj_tz).date()

    result = await db.execute(select(TripPlan))
    trips = result.scalars().all()

    for trip in trips:
        new_status = trip.status
        if trip.end_date < today:
            new_status = "completed"
        elif trip.start_date <= today <= trip.end_date:
            if trip.status != "completed":
                new_status = "ongoing"
        else:
            if trip.status == "draft":
                new_status = "planned"

        if new_status != trip.status:
            trip.status = new_status

    await db.commit()
