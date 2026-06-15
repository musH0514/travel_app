# ============================================================
# Redis 缓存工具
# 提供统一的缓存读写接口，支持自动重试
# ============================================================
import json
import hashlib
from typing import Optional, Any
from redis import asyncio as aioredis
from tenacity import retry, stop_after_attempt, wait_exponential
from config import settings


class CacheService:
    """Redis 缓存服务，封装了连接管理与 CRUD 操作"""

    def __init__(self):
        self.client = None

    async def init(self):
        """初始化 Redis 连接，如果配置了 REDIS_URL 则连接"""
        if settings.REDIS_URL:
            self.client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                encoding="utf-8"
            )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        if not self.client:
            return None
        try:
            data = await self.client.get(key)
            return json.loads(data) if data else None
        except Exception:
            return None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def set(self, key: str, value: Any, ttl: int = 300):
        """设置缓存值，默认 TTL 300 秒"""
        if self.client:
            try:
                await self.client.set(key, json.dumps(value, ensure_ascii=False), ex=ttl)
            except Exception:
                pass

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def delete(self, key: str):
        """删除缓存"""
        if self.client:
            try:
                await self.client.delete(key)
            except Exception:
                pass

    def make_key(self, prefix: str, *args) -> str:
        """生成带前缀和 MD5 哈希的缓存键"""
        raw = ":".join(str(a) for a in args)
        return f"{prefix}:{hashlib.md5(raw.encode()).hexdigest()}"


# 全局缓存实例
cache = CacheService()
