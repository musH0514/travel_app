# ============================================================
# AI 行程规划引擎
# 调用 DeepSeek / Gemini / OpenAI 生成个性化行程
# ============================================================
import json
import re
from typing import Optional, List, Dict, Any
import httpx
from config import settings
from models.trip import TripPlan
from models.itinerary import ItineraryItem
from utils.cache import cache


def _extract_json(text: str) -> Optional[Any]:
    """从 LLM 回复中提取 JSON（支持 ```json code fence）"""
    if not text:
        return None
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if fence:
        cleaned = fence.group(1).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # 尝试截取第一个 { ... } 或 [ ... ]
        for open_c, close_c in (("{", "}"), ("[", "]")):
            start = cleaned.find(open_c)
            end = cleaned.rfind(close_c)
            if start >= 0 and end > start:
                try:
                    return json.loads(cleaned[start : end + 1])
                except json.JSONDecodeError:
                    continue
    return None


def _build_mock_candidates(
    city: str,
    day_infos: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """无 Key / 解析失败时的演示候选点（按天气标签分配室内外）"""
    indoor_pool = [
        ("博物馆", "室内展馆参观", "人文历史"),
        ("美术馆", "艺术展览漫步", "人文历史"),
        ("购物中心", "室内逛街休息", "美食购物"),
        ("科技馆", "互动科普体验", "主题乐园"),
    ]
    outdoor_pool = [
        ("古城/老街", "街区漫步打卡", "城市地标"),
        ("公园", "户外散步休闲", "自然风光"),
        ("观景台", "俯瞰城市风光", "城市地标"),
        ("湖畔/滨水", "户外休闲散步", "自然风光"),
    ]
    candidates = []
    for d in day_infos:
        day_num = d.get("day_number", 1)
        tag = d.get("tag", "forecast_unknown")
        pool = indoor_pool if tag == "rainy" else outdoor_pool
        # 雨天两室内；晴天两户外；未知一天一室内一户外
        picks = pool[:2] if tag != "forecast_unknown" else [indoor_pool[0], outdoor_pool[0]]
        slots = ["上午", "下午", "晚上"]
        for i, (place, activity, category) in enumerate(picks):
            candidates.append({
                "name": f"{city}{place}",
                "indoor_outdoor": "indoor" if tag == "rainy" or (tag == "forecast_unknown" and i == 0) else "outdoor",
                "suggested_day": day_num,
                "time_slot": slots[i % 3],
                "activity": activity,
                "category": category,
                "estimated_cost": 50 + i * 20,
                "duration_hours": 2.5,
                "reason": f"天气标签={tag}，演示数据",
            })
    return {
        "title": f"{city}智能行程（演示数据）",
        "candidates": candidates,
        "total_budget": {
            "transport": 200,
            "accommodation": 800,
            "food": 400,
            "tickets": 200,
            "other": 100,
            "total": 1700,
        },
        "tips": ["当前为演示数据：请在 .env 配置 DEEPSEEK_API_KEY 以启用真实 AI 规划"],
        "is_mock": True,
    }


# 模拟数据：当 API Key 未配置时返回
_MOCK_TRIP_PLAN = {
    "title": "北京三日经典游（演示数据）",
    "description": "感受古都魅力，品味京城文化（API Key 未配置，此数据仅供参考）",
    "days": [
        {
            "day": 1,
            "date": "2026-06-16",
            "items": [
                {
                    "time": "08:00-10:00",
                    "activity": "游览天安门广场",
                    "activity_type": "景点",
                    "notes": "建议早点出发，避开人流高峰"
                },
                {
                    "time": "10:00-12:30",
                    "activity": "参观故宫博物院",
                    "activity_type": "景点",
                    "notes": "提前网上预约门票"
                },
                {
                    "time": "12:30-13:30",
                    "activity": "午餐 - 王府井小吃街",
                    "activity_type": "餐饮",
                    "estimated_cost": 80
                },
                {
                    "time": "14:00-17:00",
                    "activity": "游览景山公园 & 北海公园",
                    "activity_type": "景点",
                    "notes": "俯瞰故宫全景"
                },
                {
                    "time": "18:00-20:00",
                    "activity": "南锣鼓巷逛逛",
                    "activity_type": "景点",
                    "estimated_cost": 100
                },
                {
                    "time": "20:00",
                    "activity": "返回酒店休息",
                    "activity_type": "住宿",
                    "notes": "建议住二环内"
                }
            ]
        },
        {
            "day": 2,
            "date": "2026-06-17",
            "items": [
                {
                    "time": "07:00-08:00",
                    "activity": "早餐 - 老北京豆汁焦圈",
                    "activity_type": "餐饮",
                    "estimated_cost": 30
                },
                {
                    "time": "08:30-12:00",
                    "activity": "爬八达岭长城",
                    "activity_type": "景点",
                    "notes": "穿舒适运动鞋，带足水"
                },
                {
                    "time": "12:00-13:00",
                    "activity": "午餐 - 长城脚下农家院",
                    "activity_type": "餐饮",
                    "estimated_cost": 60
                },
                {
                    "time": "14:00-16:00",
                    "activity": "参观明十三陵",
                    "activity_type": "景点"
                },
                {
                    "time": "17:00-18:00",
                    "activity": "返回市区",
                    "activity_type": "交通",
                    "transport_mode": "公交/打车"
                },
                {
                    "time": "18:30-20:00",
                    "activity": "晚餐 - 烤鸭",
                    "activity_type": "餐饮",
                    "estimated_cost": 150
                }
            ]
        },
        {
            "day": 3,
            "date": "2026-06-18",
            "items": [
                {
                    "time": "08:00-10:00",
                    "activity": "游览颐和园",
                    "activity_type": "景点",
                    "notes": "昆明湖散步，长廊赏画"
                },
                {
                    "time": "10:30-12:00",
                    "activity": "圆明园遗址公园",
                    "activity_type": "景点"
                },
                {
                    "time": "12:00-13:00",
                    "activity": "午餐 - 五道口美食",
                    "activity_type": "餐饮",
                    "estimated_cost": 50
                },
                {
                    "time": "13:30-15:00",
                    "activity": "参观清华大学",
                    "activity_type": "景点"
                },
                {
                    "time": "15:30-17:00",
                    "activity": "鸟巢/水立方拍照",
                    "activity_type": "景点"
                },
                {
                    "time": "17:30",
                    "activity": "结束行程，返程",
                    "activity_type": "自由活动"
                }
            ]
        }
    ],
    "total_budget": {"transport": 300, "accommodation": 1200, "food": 600, "tickets": 400, "other": 200},
    "tips": ["提前预订门票和酒店", "下载北京地铁APP", "注意防晒防暑"],
    "is_mock": True
}

_MOCK_LUGGAGE = {
    "items": [
        {"name": "身份证/护照", "category": "证件", "quantity": 1, "important": True},
        {"name": "手机充电器", "category": "电子", "quantity": 1, "important": True},
        {"name": "充电宝", "category": "电子", "quantity": 1, "important": True},
        {"name": "换洗衣物", "category": "衣物", "quantity": 3, "important": False},
        {"name": "舒适运动鞋", "category": "衣物", "quantity": 1, "important": True},
        {"name": "雨伞/雨衣", "category": "日用品", "quantity": 1, "important": True},
        {"name": "防晒霜", "category": "日用品", "quantity": 1, "important": False},
        {"name": "常用药品", "category": "医疗", "quantity": 1, "important": True},
        {"name": "水杯", "category": "日用品", "quantity": 1, "important": False},
        {"name": "现金/银行卡", "category": "财务", "quantity": 1, "important": True}
    ],
    "tips": ["重要证件随身携带", "根据天气预报调整衣物", "轻装出行"],
    "is_mock": True
}

_MOCK_FOOD = {
    "restaurants": [
        {"name": "四季民福烤鸭店", "cuisine": "北京菜", "price_level": "舒适",
         "address": "东城区南池子大街", "rating": 4.8, "recommended_dishes": ["烤鸭", "宫保虾球"]},
        {"name": "姚记炒肝店", "cuisine": "北京小吃", "price_level": "经济",
         "address": "东城区鼓楼东大街", "rating": 4.5, "recommended_dishes": ["炒肝", "包子"]},
        {"name": "花家怡园", "cuisine": "融合菜", "price_level": "轻奢",
         "address": "东城区东直门内大街", "rating": 4.6, "recommended_dishes": ["花家鱼", "麻辣小龙虾"]}
    ],
    "is_mock": True
}


class AIPlanner:
    """AI 行程规划服务"""

    async def generate_weather_aware_candidates(
        self,
        city: str,
        day_infos: List[Dict[str, Any]],
        styles: List[str],
        budget_level: str,
        special_requirements: str = "",
    ) -> Dict[str, Any]:
        """
        根据天气标签生成候选景点（尚未做地图聚类）。
        day_infos: [{day_number, date, weather, tag}, ...]
        """
        system_prompt = (
            "你是专业旅行规划师。只输出合法 JSON，不要 markdown 说明文字。"
            "雨天(tag=rainy)优先室内景点；晴天/多云(tag=outdoor_ok)优先户外；"
            "未知预报(tag=forecast_unknown)则室内外搭配。"
        )
        prompt = f"""
请为「{city}」生成旅行候选景点列表。

每日天气（务必遵守 tag 约束）：
{json.dumps(day_infos, ensure_ascii=False)}

旅行偏好风格：{json.dumps(styles, ensure_ascii=False)}
预算等级：{budget_level}
特殊需求：{special_requirements or '无'}

硬性要求：
1. 覆盖每一天（suggested_day 从 1 到 {len(day_infos)}）
2. 每天 2~4 个景点级活动（MVP 可不含复杂餐饮/住宿）
3. time_slot 只能是：上午 / 下午 / 晚上
4. indoor_outdoor 只能是：indoor / outdoor
5. rainy 日的候选应以 indoor 为主；outdoor_ok 以 outdoor 为主

严格按以下 JSON 结构返回：
{{
  "title": "行程标题",
  "candidates": [
    {{
      "name": "景点名称",
      "indoor_outdoor": "indoor",
      "suggested_day": 1,
      "time_slot": "上午",
      "activity": "活动描述",
      "category": "人文历史",
      "estimated_cost": 60,
      "duration_hours": 3,
      "reason": "雨天室内"
    }}
  ],
  "total_budget": {{"transport": 0, "accommodation": 0, "food": 0, "tickets": 0, "other": 0}},
  "tips": ["建议1"]
}}
"""
        result_str = await self._call_llm(prompt, system_prompt)
        parsed = _extract_json(result_str)
        if not isinstance(parsed, dict) or not parsed.get("candidates"):
            return _build_mock_candidates(city, day_infos)

        # 规范化字段
        normalized = []
        for c in parsed.get("candidates", []):
            if not isinstance(c, dict) or not c.get("name"):
                continue
            slot = c.get("time_slot") or "上午"
            if slot not in ("上午", "下午", "晚上"):
                slot = "上午"
            io = c.get("indoor_outdoor") or "outdoor"
            if io not in ("indoor", "outdoor"):
                io = "outdoor"
            try:
                day = int(c.get("suggested_day") or 1)
            except (TypeError, ValueError):
                day = 1
            normalized.append({
                "name": str(c["name"]),
                "indoor_outdoor": io,
                "suggested_day": day,
                "time_slot": slot,
                "activity": str(c.get("activity") or c["name"]),
                "category": str(c.get("category") or "城市地标"),
                "estimated_cost": float(c.get("estimated_cost") or 0),
                "duration_hours": float(c.get("duration_hours") or 2),
                "reason": str(c.get("reason") or ""),
            })

        if not normalized:
            return _build_mock_candidates(city, day_infos)

        budget = parsed.get("total_budget") or {}
        if isinstance(budget, dict) and "total" not in budget:
            budget["total"] = sum(
                float(budget.get(k) or 0)
                for k in ("transport", "accommodation", "food", "tickets", "other")
            )

        return {
            "title": parsed.get("title") or f"{city}行程",
            "candidates": normalized,
            "total_budget": budget,
            "tips": parsed.get("tips") or [],
            "is_mock": bool(parsed.get("is_mock", False)),
        }

    async def _call_llm(self, prompt: str, system_prompt: str = "") -> str:
        """调用 LLM API（优先 DeepSeek，可备选 Gemini/OpenAI）"""
        # TODO(Yili): 额度紧张时可调整优先级，或把 model 换成更便宜的档位
        # 检查 DeepSeek API Key
        if settings.DEEPSEEK_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    response = await client.post(
                        "https://api.deepseek.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"},
                        json={
                            "model": "deepseek-chat",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.7,
                            "max_tokens": 4096
                        }
                    )
                    result = response.json()
                    if "choices" in result and len(result["choices"]) > 0:
                        return result["choices"][0]["message"]["content"]
            except Exception as e:
                # DeepSeek 失败，尝试备选
                pass

        # 备选：Google Gemini
        if settings.GEMINI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{
                                "parts": [{"text": f"{system_prompt}\n\n{prompt}"}]
                            }]
                        }
                    )
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        return result["candidates"][0]["content"]["parts"][0]["text"]
            except Exception:
                pass

        # 备选：OpenAI
        if settings.OPENAI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.7,
                            "max_tokens": 4096
                        }
                    )
                    result = response.json()
                    if "choices" in result and len(result["choices"]) > 0:
                        return result["choices"][0]["message"]["content"]
            except Exception:
                pass

        # 所有 API Key 未配置或调用失败，返回模拟数据
        return json.dumps({"is_mock": True, "warning": "API Key 未配置或调用失败，返回演示数据"})

    async def generate_trip_plan(
        self,
        preferences: Dict[str, Any],
        destinations: List[Dict[str, Any]],
        weather: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """根据用户偏好和目的地生成个性化行程计划"""
        # 检查缓存
        cache_key = cache.make_key("trip_plan", str(preferences), str(destinations))
        cached = await cache.get(cache_key)
        if cached:
            return cached

        # 构建提示词
        dest_names = [d.get("name", "") for d in destinations]
        system_prompt = "你是一个专业的旅行规划师，擅长制定详细、合理的行程计划。请以JSON格式输出。"
        prompt = f"""
请根据以下信息生成一份详细的行程计划：

旅行偏好：{json.dumps(preferences, ensure_ascii=False)}
目的地：{', '.join(dest_names)}
天气信息：{json.dumps(weather, ensure_ascii=False) if weather else '无'}

要求：
1. 行程必须合理，时间安排恰当
2. 包含每日的景点、餐饮、交通安排
3. 给出预算估算
4. 提供实用建议

请以严格的JSON格式返回，包含 title, description, days（数组，每个元素包含 day, date, items 数组）, total_budget, tips。
"""
        result_str = await self._call_llm(prompt, system_prompt)
        result = _extract_json(result_str)
        if not isinstance(result, dict) or not result.get("days"):
            result = _MOCK_TRIP_PLAN

        # 缓存结果（TTL: 600s）
        await cache.set(cache_key, result, ttl=600)
        return result

    async def optimize_itinerary(
        self,
        trip_id: str,
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """优化已有行程（调整顺序、替换不合理安排）"""
        # 从数据库加载行程数据
        from database import async_session
        from sqlalchemy import select

        async with async_session() as session:
            result = await session.execute(
                select(TripPlan).where(TripPlan.id == trip_id)
            )
            trip = result.scalar_one_or_none()
            if not trip:
                return {"error": "行程不存在", "is_mock": True}

            items_result = await session.execute(
                select(ItineraryItem)
                .where(ItineraryItem.trip_id == trip_id)
                .order_by(ItineraryItem.day_number, ItineraryItem.order_index)
            )
            items = items_result.scalars().all()

        if not items:
            return _MOCK_TRIP_PLAN

        # 构建优化提示
        system_prompt = "你是一个行程优化专家，擅长调整和优化旅行计划。"
        items_summary = [
            {"day": i.day_number, "type": i.activity_type,
             "start": str(i.start_time), "end": str(i.end_time), "cost": i.estimated_cost}
            for i in items
        ]
        prompt = f"""
请优化以下行程安排，使其更加合理高效：

当前行程：{json.dumps(items_summary, ensure_ascii=False)}
限制条件：{json.dumps(constraints, ensure_ascii=False) if constraints else '无'}

请以JSON格式返回优化后的完整行程，保持原有格式。
"""
        result_str = await self._call_llm(prompt, system_prompt)
        result = _extract_json(result_str)
        if isinstance(result, dict):
            return result
        return _MOCK_TRIP_PLAN

    async def get_luggage_suggestions(
        self,
        destination: str,
        weather_forecast: Optional[Dict[str, Any]] = None,
        duration: int = 3
    ) -> Dict[str, Any]:
        """AI 行李打包建议"""
        cache_key = cache.make_key("luggage", destination, str(weather_forecast), str(duration))
        cached = await cache.get(cache_key)
        if cached:
            return cached

        system_prompt = "你是一个旅行打包专家，根据目的地和天气给出详细的行李清单。"
        prompt = f"""
目的地：{destination}
天气预报：{json.dumps(weather_forecast, ensure_ascii=False) if weather_forecast else '未知'}
旅行天数：{duration}天

请以JSON格式输出行李打包清单，包含 items（数组，每个元素包含 name, category, quantity, important 布尔值）和 tips 数组。
"""
        result_str = await self._call_llm(prompt, system_prompt)
        result = _extract_json(result_str)
        if not isinstance(result, dict):
            result = _MOCK_LUGGAGE

        await cache.set(cache_key, result, ttl=600)
        return result

    async def get_food_recommendations(
        self,
        trip_id: str,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """沿途餐厅推荐"""
        # 从数据库获取行程目的地
        from database import async_session
        from sqlalchemy import select
        from models.destination import Destination

        async with async_session() as session:
            result = await session.execute(
                select(TripPlan).where(TripPlan.id == trip_id)
            )
            trip = result.scalar_one_or_none()
            if not trip:
                return _MOCK_FOOD

        system_prompt = "你是一个美食推荐专家，根据旅行路线推荐沿途餐厅。"
        prompt = f"""
旅行目的地：{json.dumps(trip.destinations, ensure_ascii=False)}
用户偏好：{json.dumps(preferences, ensure_ascii=False) if preferences else '无'}
预算信息：{json.dumps(trip.total_budget, ensure_ascii=False)}

请以JSON格式推荐沿途餐厅，包含 restaurants 数组（每个元素含 name, cuisine, price_level, address, rating, recommended_dishes）。
"""
        result_str = await self._call_llm(prompt, system_prompt)
        result = _extract_json(result_str)
        if isinstance(result, dict):
            return result
        return _MOCK_FOOD
