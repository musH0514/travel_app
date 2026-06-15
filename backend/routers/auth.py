# ============================================================
# 用户认证与资料管理接口
# ============================================================
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from config import settings
from models.user import User
from utils.deps import get_db, get_current_user

router = APIRouter()

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==================== Pydantic 请求/响应模型 ====================

class UserRegister(BaseModel):
    """用户注册请求"""
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """用户登录请求"""
    username: Optional[str] = None
    email: Optional[str] = None
    password: str


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserUpdate(BaseModel):
    """用户资料更新"""
    username: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    """用户信息响应"""
    id: str
    username: str
    email: str
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== 辅助函数 ====================

def create_access_token(user_id: str) -> str:
    """生成 JWT 访问令牌"""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def hash_password(password: str) -> str:
    """对密码进行哈希处理"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码与哈希是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)


# ==================== 路由 ====================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """用户注册"""
    # 检查用户名或邮箱是否已存在
    result = await db.execute(
        select(User).where(
            or_(User.username == data.username, User.email == data.email)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名或邮箱已被注册"
        )

    # 创建新用户
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        preferences={"style": [], "budget_level": "经济", "weather_preferences": []}
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 返回令牌
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "preferences": user.preferences,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """用户登录"""
    # 通过用户名或邮箱查找用户
    conditions = []
    if data.username:
        conditions.append(User.username == data.username)
    if data.email:
        conditions.append(User.email == data.email)

    if not conditions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供用户名或邮箱"
        )

    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名/邮箱或密码错误"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用"
        )

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "preferences": user.preferences,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新当前用户资料"""
    if data.username is not None:
        # 检查用户名是否已被使用
        result = await db.execute(
            select(User).where(
                User.username == data.username,
                User.id != current_user.id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已被使用"
            )
        current_user.username = data.username

    if data.email is not None:
        result = await db.execute(
            select(User).where(
                User.email == data.email,
                User.id != current_user.id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被使用"
            )
        current_user.email = data.email

    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.preferences is not None:
        current_user.preferences = data.preferences

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/me/api-keys", response_model=dict)
async def update_api_keys(
    api_keys: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新用户的自定义 API Key（存储在用户偏好的 settings 字段）"""
    # API Keys 存储在用户偏好的 settings 子字段中
    prefs = current_user.preferences or {}
    if "settings" not in prefs:
        prefs["settings"] = {}
    prefs["settings"].update(api_keys)
    current_user.preferences = prefs
    await db.commit()
    return {"message": "API Key 已更新", "keys": list(api_keys.keys())}
