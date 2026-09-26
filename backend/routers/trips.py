# ============================================================
# 行程计划管理接口
# ============================================================
from datetime import date, time
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, and_
from models.trip import TripPlan
from models.itinerary import ItineraryItem
from models.destination import Destination
from services.trip_orchestrator import TripOrchestrator
from utils.deps import get_db, get_current_user
from utils.status_updater import update_trip_statuses

router = APIRouter()
orchestrator = TripOrchestrator()


# ==================== Pydantic 模型 ====================

class TripCreate(BaseModel):
    """创建行程请求"""
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    destinations: Optional[list] = None
    preferences: Optional[dict] = None
    weather_concerns: Optional[bool] = False
    total_budget: Optional[dict] = None


class TripUpdate(BaseModel):
    """更新行程请求"""
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    destinations: Optional[list] = None
    preferences: Optional[dict] = None
    weather_concerns: Optional[bool] = None
    total_budget: Optional[dict] = None
    status: Optional[str] = None


class ReplanTripRequest(BaseModel):
    """修改日期后重新规划请求"""
    start_date: date
    end_date: date


class TripResponse(BaseModel):
    """行程响应"""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    destinations: Optional[list] = None
    preferences: Optional[dict] = None
    weather_concerns: bool = False
    total_budget: Optional[dict] = None
    version: str = "sunny"
    companion_version_id: Optional[str] = None
    status: str = "draft"

    class Config:
        from_attributes = True


class ItineraryItemCreate(BaseModel):
    """创建行程项请求"""
    day_number: int
    start_time: Optional[str] = None  # HH:MM 格式
    end_time: Optional[str] = None
    destination_id: Optional[str] = None
    activity_type: Optional[str] = "景点"
    transport_mode: Optional[str] = None
    transport_detail: Optional[dict] = None
    notes: Optional[str] = None
    estimated_cost: Optional[float] = 0.0
    order_index: Optional[int] = 0


class ItineraryItemUpdate(BaseModel):
    """更新行程项请求"""
    day_number: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    destination_id: Optional[str] = None
    activity_type: Optional[str] = None
    transport_mode: Optional[str] = None
    transport_detail: Optional[dict] = None
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    order_index: Optional[int] = None


class ItineraryItemResponse(BaseModel):
    """行程项响应"""
    id: str
    trip_id: str
    day_number: int
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    destination_id: Optional[str] = None
    # 嵌套目的地，供前端时间线展示地点名/坐标
    destination: Optional[dict] = None
    activity_type: str
    transport_mode: Optional[str] = None
    transport_detail: Optional[dict] = None
    notes: Optional[str] = None
    estimated_cost: float
    order_index: int

    class Config:
        from_attributes = True


class TripDetailResponse(TripResponse):
    """带完整行程的行程响应"""
    itinerary: List[ItineraryItemResponse] = []


# ==================== 序列化辅助 ====================

async def _get_owned_trip(db: AsyncSession, trip_id: str, user_id: str) -> TripPlan:
    result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == user_id)
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="行程不存在"
        )
    return trip


async def _load_trip_itinerary(db: AsyncSession, trip_id: str):
    items_result = await db.execute(
        select(ItineraryItem)
        .where(ItineraryItem.trip_id == trip_id)
        .order_by(ItineraryItem.day_number, ItineraryItem.order_index)
    )
    items = items_result.scalars().all()

    dest_ids = [i.destination_id for i in items if i.destination_id]
    dest_map = {}
    if dest_ids:
        dest_result = await db.execute(
            select(Destination).where(Destination.id.in_(dest_ids))
        )
        dest_map = {d.id: d for d in dest_result.scalars().all()}
    return items, dest_map


def _destination_payload(d: Optional[Destination]) -> Optional[dict]:
    if not d:
        return None
    return {
        "id": d.id,
        "name": d.name,
        "description": d.description or "",
        "location": d.location or {"lat": 0, "lng": 0},
        "images": d.images or [],
        "category": d.category,
        "rating": d.rating or 0,
        "budget_per_person": d.budget_per_person,
        "suggested_duration": d.suggested_duration,
        "address": d.address,
        "city": d.city,
    }


def _build_trip_detail(trip: TripPlan, items, dest_map) -> dict:
    return {
        "id": trip.id,
        "user_id": trip.user_id,
        "title": trip.title,
        "description": getattr(trip, 'description', None),
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "destinations": trip.destinations,
        "preferences": trip.preferences,
        "weather_concerns": False,
        "total_budget": trip.total_budget,
        "version": "sunny",
        "companion_version_id": None,
        "status": trip.status,
        "itinerary": [
            {
                "id": item.id,
                "trip_id": item.trip_id,
                "day_number": item.day_number,
                "date": (
                    trip.start_date.fromordinal(
                        trip.start_date.toordinal() + item.day_number - 1
                    ).isoformat()
                    if trip.start_date else None
                ),
                "start_time": item.start_time.isoformat() if item.start_time else None,
                "end_time": item.end_time.isoformat() if item.end_time else None,
                "destination_id": item.destination_id,
                "destination": _destination_payload(
                    dest_map.get(item.destination_id) if item.destination_id else None
                ),
                "activity_type": item.activity_type,
                "transport_mode": item.transport_mode,
                "transport_detail": item.transport_detail,
                "notes": item.notes,
                "estimated_cost": item.estimated_cost,
                "order_index": item.order_index
            }
            for item in items
        ]
    }


async def _resolve_trip_city(db: AsyncSession, trip: TripPlan) -> str:
    prefs = trip.preferences or {}
    city = (prefs.get("city") or "").strip()
    if city:
        return city

    item_result = await db.execute(
        select(ItineraryItem)
        .where(ItineraryItem.trip_id == trip.id)
        .order_by(ItineraryItem.day_number, ItineraryItem.order_index)
        .limit(1)
    )
    item = item_result.scalar_one_or_none()
    if item and item.destination_id:
        dest_result = await db.execute(
            select(Destination).where(Destination.id == item.destination_id)
        )
        dest = dest_result.scalar_one_or_none()
        if dest and (dest.city or "").strip():
            return dest.city.strip()

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="无法确定行程目的地城市，请先重命名或重新创建行程",
    )


# ==================== 路由 ====================

@router.get("/", response_model=List[TripResponse])
async def list_trips(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """获取用户的所有行程计划"""
    await update_trip_statuses(db)
    query = select(TripPlan).where(TripPlan.user_id == current_user.id)
    if status_filter:
        query = query.where(TripPlan.status == status_filter)
    query = query.offset(skip).limit(limit).order_by(TripPlan.updated_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    data: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """创建新的行程计划"""
    trip = TripPlan(
        user_id=current_user.id,
        title=data.title,
        start_date=data.start_date,
        end_date=data.end_date,
        destinations=data.destinations or [],
        preferences=data.preferences or current_user.preferences or {},
        total_budget=data.total_budget or {"transport": 0, "accommodation": 0, "food": 0, "tickets": 0, "other": 0}
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripDetailResponse)
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """获取行程详情（含完整行程单）"""
    trip = await _get_owned_trip(db, trip_id, current_user.id)
    items, dest_map = await _load_trip_itinerary(db, trip_id)
    return _build_trip_detail(trip, items, dest_map)


@router.put("/{trip_id}/replan", response_model=TripDetailResponse)
async def replan_trip(
    trip_id: str,
    data: ReplanTripRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """修改日期后，按原目的地与偏好重新规划行程。"""
    trip = await _get_owned_trip(db, trip_id, current_user.id)
    city = await _resolve_trip_city(db, trip)

    prefs = trip.preferences or {}
    styles_raw = prefs.get("styles")
    if isinstance(styles_raw, list) and styles_raw:
        styles = [str(s) for s in styles_raw]
    elif prefs.get("style"):
        styles = [str(prefs["style"])]
    else:
        styles = ["休闲度假"]
    budget_level = prefs.get("budgetLevel") or "舒适型"
    special_requirements = prefs.get("specialRequirements") or ""

    try:
        await orchestrator.replan_and_persist(
            db=db,
            trip=trip,
            city=city,
            start_date=data.start_date,
            end_date=data.end_date,
            styles=styles,
            budget_level=budget_level,
            special_requirements=special_requirements,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重新规划失败: {e}",
        )

    items, dest_map = await _load_trip_itinerary(db, trip_id)
    return _build_trip_detail(trip, items, dest_map)


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    data: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """更新行程计划"""
    result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="行程不存在"
        )

    update_data = data.model_dump(exclude_unset=True)
    allowed_fields = {"title", "start_date", "end_date", "destinations", "preferences", "total_budget", "status"}
    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(trip, field, value)

    await db.commit()
    await db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """删除行程计划"""
    result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="行程不存在"
        )
    await db.execute(delete(ItineraryItem).where(ItineraryItem.trip_id == trip_id))
    await db.delete(trip)
    await db.commit()


# ==================== 行程项管理 ====================

@router.get("/{trip_id}/itinerary", response_model=List[ItineraryItemResponse])
async def get_itinerary(
    trip_id: str,
    day_number: Optional[int] = Query(None, description="按天数筛选"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """获取行程单"""
    # 确认行程归属
    trip_result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    if not trip_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="行程不存在")

    query = (
        select(ItineraryItem)
        .where(ItineraryItem.trip_id == trip_id)
        .order_by(ItineraryItem.day_number, ItineraryItem.order_index)
    )
    if day_number is not None:
        query = query.where(ItineraryItem.day_number == day_number)

    result = await db.execute(query)
    items = result.scalars().all()

    dest_ids = [i.destination_id for i in items if i.destination_id]
    dest_map = {}
    if dest_ids:
        dest_result = await db.execute(
            select(Destination).where(Destination.id.in_(dest_ids))
        )
        dest_map = {d.id: d for d in dest_result.scalars().all()}

    enriched = []
    for item in items:
        d = dest_map.get(item.destination_id) if item.destination_id else None
        enriched.append({
            "id": item.id,
            "trip_id": item.trip_id,
            "day_number": item.day_number,
            "start_time": item.start_time.isoformat() if item.start_time else None,
            "end_time": item.end_time.isoformat() if item.end_time else None,
            "destination_id": item.destination_id,
            "destination": {
                "id": d.id,
                "name": d.name,
                "description": d.description or "",
                "location": d.location or {"lat": 0, "lng": 0},
                "images": d.images or [],
                "category": d.category,
                "rating": d.rating or 0,
                "address": d.address,
                "city": d.city,
            } if d else None,
            "activity_type": item.activity_type,
            "transport_mode": item.transport_mode,
            "transport_detail": item.transport_detail,
            "notes": item.notes,
            "estimated_cost": item.estimated_cost,
            "order_index": item.order_index
        })
    return enriched


@router.post(
    "/{trip_id}/itinerary",
    response_model=ItineraryItemResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_itinerary_item(
    trip_id: str,
    data: ItineraryItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """添加行程项"""
    trip_result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    if not trip_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="行程不存在")

    # 解析时间字符串
    start = None
    end = None
    if data.start_time:
        try:
            parts = data.start_time.split(":")
            start = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        except (ValueError, IndexError):
            pass
    if data.end_time:
        try:
            parts = data.end_time.split(":")
            end = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        except (ValueError, IndexError):
            pass

    # 如果指定了目的地，自动从 destinations.category 获取 activity_type
    activity_type = data.activity_type
    if data.destination_id:
        dest_result = await db.execute(
            select(Destination.category).where(Destination.id == data.destination_id)
        )
        dest_category = dest_result.scalar_one_or_none()
        if dest_category:
            activity_type = dest_category

    item = ItineraryItem(
        trip_id=trip_id,
        day_number=data.day_number,
        start_time=start,
        end_time=end,
        destination_id=data.destination_id,
        activity_type=activity_type,
        transport_mode=data.transport_mode,
        transport_detail=data.transport_detail or {},
        notes=data.notes,
        estimated_cost=data.estimated_cost,
        order_index=data.order_index
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return {
        "id": item.id,
        "trip_id": item.trip_id,
        "day_number": item.day_number,
        "start_time": item.start_time.isoformat() if item.start_time else None,
        "end_time": item.end_time.isoformat() if item.end_time else None,
        "destination_id": item.destination_id,
        "activity_type": item.activity_type,
        "transport_mode": item.transport_mode,
        "transport_detail": item.transport_detail,
        "notes": item.notes,
        "estimated_cost": item.estimated_cost,
        "order_index": item.order_index
    }


@router.put("/{trip_id}/itinerary/{item_id}", response_model=ItineraryItemResponse)
async def update_itinerary_item(
    trip_id: str,
    item_id: str,
    data: ItineraryItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """更新行程项"""
    trip_result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    if not trip_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="行程不存在")

    result = await db.execute(
        select(ItineraryItem).where(
            and_(ItineraryItem.id == item_id, ItineraryItem.trip_id == trip_id)
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="行程项不存在"
        )

    update_data = data.model_dump(exclude_unset=True)

    # 处理时间字符串
    if "start_time" in update_data and update_data["start_time"]:
        try:
            parts = update_data["start_time"].split(":")
            update_data["start_time"] = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        except (ValueError, IndexError):
            del update_data["start_time"]
    if "end_time" in update_data and update_data["end_time"]:
        try:
            parts = update_data["end_time"].split(":")
            update_data["end_time"] = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        except (ValueError, IndexError):
            del update_data["end_time"]

    # 如果更新了 destination_id，自动从 destinations.category 更新 activity_type
    if "destination_id" in update_data and update_data["destination_id"]:
        dest_result = await db.execute(
            select(Destination.category).where(Destination.id == update_data["destination_id"])
        )
        dest_category = dest_result.scalar_one_or_none()
        if dest_category:
            update_data["activity_type"] = dest_category

    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)

    return {
        "id": item.id,
        "trip_id": item.trip_id,
        "day_number": item.day_number,
        "start_time": item.start_time.isoformat() if item.start_time else None,
        "end_time": item.end_time.isoformat() if item.end_time else None,
        "destination_id": item.destination_id,
        "activity_type": item.activity_type,
        "transport_mode": item.transport_mode,
        "transport_detail": item.transport_detail,
        "notes": item.notes,
        "estimated_cost": item.estimated_cost,
        "order_index": item.order_index
    }


@router.delete("/{trip_id}/itinerary/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary_item(
    trip_id: str,
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """删除行程项"""
    trip_result = await db.execute(
        select(TripPlan).where(
            and_(TripPlan.id == trip_id, TripPlan.user_id == current_user.id)
        )
    )
    if not trip_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="行程不存在")

    result = await db.execute(
        select(ItineraryItem).where(
            and_(ItineraryItem.id == item_id, ItineraryItem.trip_id == trip_id)
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="行程项不存在"
        )
    await db.delete(item)
    await db.commit()
