# ============================================================
# 搜索增强服务
# 使用 SerpAPI / Bing Search 聚合旅游内容
# ============================================================
import json
from typing import Optional, Dict, Any, List
import httpx
from config import settings
from utils.cache import cache


class SearchService:
    """旅游信息搜索聚合服务"""

    async def search_online(
        self,
        query: str,
        sources: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """多源搜索旅游信息"""
        if sources is None:
            sources = ["xiaohongshu", "mafengwo"]

        cache_key = cache.make_key("search_online", query, str(sources))
        cached = await cache.get(cache_key)
        if cached:
            return cached

        results = {"query": query, "sources": {}, "is_mock": False}

        # SerpAPI 搜索
        if settings.SERPAPI_KEY:
            serp_results = await self._search_serpapi(query, sources)
            if serp_results:
                results["sources"]["serpapi"] = serp_results

        # Bing Search
        if settings.BING_SEARCH_KEY:
            bing_results = await self._search_bing(query)
            if bing_results:
                results["sources"]["bing"] = bing_results

        # 如果没有配置任何 API Key，返回模拟数据
        if not results["sources"]:
            results["sources"]["demo"] = self._get_mock_results(query)
            results["is_mock"] = True

        await cache.set(cache_key, results, ttl=600)
        return results

    async def _search_serpapi(self, query: str, sources: List[str]) -> Optional[List[Dict]]:
        """通过 SerpAPI 搜索"""
        try:
            all_results = []
            async with httpx.AsyncClient(timeout=15) as client:
                # 调用 Google 搜索
                resp = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "q": query,
                        "api_key": settings.SERPAPI_KEY,
                        "engine": "google",
                        "hl": "zh-cn",
                        "gl": "cn"
                    }
                )
                data = resp.json()
                organic = data.get("organic_results", [])
                for item in organic[:5]:
                    all_results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "source": item.get("source", ""),
                        "engine": "google"
                    })
            return all_results
        except Exception:
            return None

    async def _search_bing(self, query: str) -> Optional[List[Dict]]:
        """通过 Bing Search API 搜索"""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    "https://api.bing.microsoft.com/v7.0/search",
                    headers={"Ocp-Apim-Subscription-Key": settings.BING_SEARCH_KEY},
                    params={"q": query, "count": 10, "mkt": "zh-CN"}
                )
                data = resp.json()
                web_pages = data.get("webPages", {}).get("value", [])
                return [
                    {
                        "title": item.get("name", ""),
                        "link": item.get("url", ""),
                        "snippet": item.get("snippet", ""),
                        "source": "bing"
                    }
                    for item in web_pages
                ]
        except Exception:
            return None

    def _get_mock_results(self, query: str) -> List[Dict]:
        """返回模拟搜索结果"""
        return [
            {
                "title": f"{query} - 最佳旅行攻略（演示数据）",
                "link": "https://example.com/travel-guide",
                "snippet": f"为您整理了{query}的详细旅行攻略，包含景点、美食、住宿等全面信息。"
                           "（API Key 未配置，此数据为演示内容）",
                "source": "demo"
            },
            {
                "title": f"{query} - 三日游行程推荐（演示数据）",
                "link": "https://example.com/3-day-itinerary",
                "snippet": f"经典{query}三日游行程安排，涵盖必去景点和当地特色美食。",
                "source": "demo"
            },
            {
                "title": f"{query} - 当地美食推荐（演示数据）",
                "link": "https://example.com/food-guide",
                "snippet": f"{query}必吃美食清单，从街头小吃到高档餐厅一网打尽。",
                "source": "demo"
            }
        ]

    async def aggregate_results(self, query: str) -> Dict[str, Any]:
        """聚合多方搜索结果"""
        return await self.search_online(query, sources=["xiaohongshu", "mafengwo", "bing"])
