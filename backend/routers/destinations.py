# ============================================================
# 目的地管理接口
# ============================================================
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from models.destination import Destination
from services.recommendation import RecommendationEngine
from utils.deps import get_db, get_current_user

router = APIRouter()
recommendation_engine = RecommendationEngine()


# ==================== Pydantic 模型 ====================

class DestinationCreate(BaseModel):
    """创建目的地请求"""
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    location: Optional[dict] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    category: str
    images: Optional[list] = None
    rating: Optional[float] = 0.0
    price_level: Optional[str] = "经济"
    tags: Optional[list] = None
    suggested_duration: Optional[float] = 2.0
    domestic: Optional[bool] = True


class DestinationUpdate(BaseModel):
    """更新目的地请求"""
    name: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    location: Optional[dict] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    images: Optional[list] = None
    rating: Optional[float] = None
    price_level: Optional[str] = None
    tags: Optional[list] = None
    suggested_duration: Optional[float] = None
    domestic: Optional[bool] = None


class DestinationResponse(BaseModel):
    """目的地响应"""
    id: str
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    location: Optional[dict] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    category: str
    images: Optional[list] = None
    rating: float
    price_level: str
    tags: Optional[list] = None
    suggested_duration: float
    domestic: bool

    class Config:
        from_attributes = True


# ==================== 路由 ====================

@router.get("/", response_model=List[DestinationResponse])
async def list_destinations(
    category: Optional[str] = Query(None, description="目的地分类"),
    price_level: Optional[str] = Query(None, description="消费等级"),
    domestic: Optional[bool] = Query(None, description="国内/海外"),
    tags: Optional[str] = Query(None, description="标签（逗号分隔）"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取目的地列表（支持筛选）"""
    query = select(Destination)
    conditions = []

    if category:
        conditions.append(Destination.category == category)
    if price_level:
        conditions.append(Destination.price_level == price_level)
    if domestic is not None:
        conditions.append(Destination.domestic == domestic)
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        for tag in tag_list:
            conditions.append(Destination.tags.contains([tag]))

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(skip).limit(limit).order_by(Destination.rating.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/search", response_model=List[DestinationResponse])
async def search_destinations(
    keyword: str = Query(..., min_length=1, description="搜索关键词"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """根据关键词搜索目的地"""
    pattern = f"%{keyword}%"
    query = (
        select(Destination)
        .where(
            or_(
                Destination.name.ilike(pattern),
                Destination.name_en.ilike(pattern),
                Destination.city.ilike(pattern),
                Destination.country.ilike(pattern),
                Destination.description.ilike(pattern),
                Destination.tags.contains([keyword])
            )
        )
        .offset(skip)
        .limit(limit)
        .order_by(Destination.rating.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/recommend", response_model=List[DestinationResponse])
async def recommend_destinations(
    category: Optional[str] = Query(None),
    price_level: Optional[str] = Query(None),
    domestic: Optional[bool] = Query(None),
    tags: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user)
):
    """AI 推荐目的地（基于用户偏好）"""
    tag_list = [t.strip() for t in tags.split(",")] if tags else None

    results = await recommendation_engine.recommend_destinations(
        user_preferences=current_user.preferences,
        category=category,
        price_level=price_level,
        domestic=domestic,
        tags=tag_list,
        limit=limit
    )
    return results


@router.get("/{destination_id}", response_model=DestinationResponse)
async def get_destination(
    destination_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取目的地详情"""
    result = await db.execute(
        select(Destination).where(Destination.id == destination_id)
    )
    destination = result.scalar_one_or_none()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="目的地不存在"
        )
    return destination


@router.post("/", response_model=DestinationResponse, status_code=status.HTTP_201_CREATED)
async def create_destination(
    data: DestinationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """创建新目的地（需要登录）"""
    destination = Destination(**data.model_dump())
    db.add(destination)
    await db.commit()
    await db.refresh(destination)
    return destination


@router.put("/{destination_id}", response_model=DestinationResponse)
async def update_destination(
    destination_id: str,
    data: DestinationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """更新目的地信息"""
    result = await db.execute(
        select(Destination).where(Destination.id == destination_id)
    )
    destination = result.scalar_one_or_none()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="目的地不存在"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(destination, field, value)

    await db.commit()
    await db.refresh(destination)
    return destination


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_destination(
    destination_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """删除目的地"""
    result = await db.execute(
        select(Destination).where(Destination.id == destination_id)
    )
    destination = result.scalar_one_or_none()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="目的地不存在"
        )
    await db.delete(destination)
    await db.commit()
