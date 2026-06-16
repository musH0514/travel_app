# TripWise - 智能行程规划平台

> 一款根据用户偏好、天气、预算等因素，智能生成个性化出游方案的行程规划平台。

## 产品定位

- **国内 + 海外双模支持**：根据目的地自动切换地图/天气/数据源
- **AI 驱动**：基于 LLM（DeepSeek / Claude）生成个性化游览方案
- **天气感知**：规划时即告知天气状况，并提供备选预案（核心差异化）

## 核心功能

### 1. 目的地推荐与管理
- 根据用户偏好（风格/预算/时间）推荐目的地
- 支持用户手动添加明确想去的地点
- 所有目的地在地图上可视化展示

### 2. 智能交通规划
- 目的地间多种交通方式查询（自驾/公交/步行/打车）
- 自动推荐最优交通方案（时间/价格/便捷性综合评分）
- 附人均交通预算

### 3. AI 游览方案生成
- 根据用户偏好（网红打卡/文艺漫步/亲子/深度文化等）定制方案
- 自动分配每个景点的建议游玩时间
- 方案来源：LLM 实时搜索 + 结构化 API 增强
- 附各景点门票/消费预算

### 4. 餐饮推荐
- 根据行程路线顺路推荐用餐地点
- 支持用户指定想去餐厅并规划路线
- 附人均餐饮预算

### 5. 住宿推荐
- 根据预算、品质要求、距景点远近等多维度推荐
- 附住宿预算

### 6. 天气感知（差异化亮点）
- 规划时即显示出行日天气预报
- 恶劣天气自动触发备选预案（如雨天转室内活动）
- 支持"多云版 vs 下雨版"行程比较

### 7. 行李建议
- 证件资料建议，如护照、身份证等纸质资料
- 根据天气情况和目的地自然环境提供衣物建议，如雨伞、登山鞋等

## 技术栈

### 前端
- **Next.js** (SSR/SSG，SEO 友好)
- Tailwind CSS
- 高德地图 JS API（国内）/ Google Maps API（海外）

### 后端
- Python FastAPI（AI 处理 + 业务逻辑）
- PostgreSQL（结构化数据）
- Redis（缓存天气/搜索结果）

### AI / 数据
- **DeepSeek API**（主力 LLM，性价比高）
- Claude API（高精度场景备用）
- **SerpAPI**（实时搜索小红书/马蜂窝等平台内容）
- Bing Search API（搜索增强）

### 第三方服务
| 服务 | 国内 | 海外 |
|------|------|------|
| 地图 | 高德地图 | Google Maps |
| 天气 | 和风天气 | OpenWeatherMap |
| 交通 | 高德路径规划 | Rome2Rio |
| 餐饮 | 大众点评 | Google Places |
| 住宿 | 携程 | Booking.com |

## 项目结构

### 环境变量

| 变量 | 说明 |
|------|------|
| `AMAP_KEY` | 高德地图 JS API Key |
| `GOOGLE_MAPS_KEY` | Google Maps API Key |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `GEMINI_API_KEY` | Google Gemini API Key|
| `OPENAI_API_KEY` | OpenAI API Key | 
| `SERPAPI_KEY` | SerpAPI Key |
| `HEFENG_KEY` | 和风天气 Key |
| `OPENWEATHER_KEY` | OpenWeatherMap Key |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `REDIS_URL` | Redis 连接串 |

* openai, gemini, deepseek的api免费版都有额度限制，基本上只能用最低配的模型。gemini和deepseek的api付费方式都是充值然后按token扣余额，api的费用单独计算，和网页聊天的套餐无关；openai的api套餐和网页聊天的套餐是同一个，额度对应。

### 模块架构

```
┌─────────────────────────────────────┐
│          Next.js Frontend           │
│  ┌─────┐ ┌──────┐   ┌──────────┐    │
│  │地图 │ │ 天气  │   │ 行程编   │    │
│  │组件 │ │ 组件  │   │ 辑器     │    │
│  └──┬──┘ └──┬───┘   └────┬─────┘    │
│     │       │            │          │
└─────┼───────┼────────────┼──────────┘
      │       │            │
┌─────┼───────┼────────────┼──────────┐
│     ▼       ▼            ▼          │
│        FastAPI Backend              │
│  ┌──────────┐ ┌────────────────┐    │
│  │ 目的地    │ │ AI 规划引擎    │    │
│  │ 推荐引擎  │ │ (LLM编排)      │    │
│  └──────────┘ └───────┬────────┘    │
│  ┌──────────┐ ┌───────┴────────┐    │
│  │ 天气     │ │ 搜索增强        │    │
│  │ 服务     │ │ (SerpAPI等)     │    │
│  └──────────┘ └────────────────┘    │
│  ┌──────────┐ ┌──────────┐          │
│  │ 地图     │ │ 第三方    │          │
│  │ 服务     │ │ API代理   │          │
│  └──────────┘ └──────────┘          │
└─────┬───────────────────────────────┘
      │
┌─────┴───────────────────────────────┐
│          PostgreSQL + Redis         │
└─────────────────────────────────────┘
```

### 文件目录结构

```
travel_app/
├── backend/                    # FastAPI 后端
│   ├── config.py               # 配置
│   ├── database.py             # 数据库连接
│   ├── main.py                 # 应用入口
│   ├── requirements.txt        # Python 依赖
│   ├── models/                 # 数据模型
│   │   ├── destination.py
│   │   ├── itinerary.py
│   │   ├── trip.py
│   │   └── user.py
│   ├── routers/                # 路由
│   │   ├── ai_plan.py
│   │   ├── auth.py
│   │   ├── destinations.py
│   │   ├── trips.py
│   │   └── weather.py
│   ├── services/               # 业务逻辑
│   │   ├── ai_planner.py
│   │   ├── map_service.py
│   │   ├── recommendation.py
│   │   ├── search_service.py
│   │   └── weather_service.py
│   └── utils/                  # 工具
│       ├── cache.py
│       └── deps.py
├── docs/                       # 文档
├── frontend/                   # Next.js 前端
│   ├── next.config.js
│   ├── package.json
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── src/
│   │   ├── api/                # 前端 API 封装
│   │   │   ├── ai.ts
│   │   │   ├── client.ts
│   │   │   ├── destinations.ts
│   │   │   ├── trips.ts
│   │   │   └── weather.ts
│   │   ├── components/         # UI 组件
│   │   │   ├── AccommodationCard.tsx
│   │   │   ├── AiPlanForm.tsx
│   │   │   ├── BudgetSummary.tsx
│   │   │   ├── DestinationCard.tsx
│   │   │   ├── ItineraryView.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LuggageSuggest.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── TransportSelector.tsx
│   │   │   ├── TripCard.tsx
│   │   │   └── WeatherCard.tsx
│   │   ├── pages/              # 页面
│   │   │   ├── _app.tsx
│   │   │   ├── _document.tsx
│   │   │   ├── create-trip.tsx  # 创建新行程
│   │   │   ├── destinations.tsx # 目的地浏览
│   │   │   ├── history-trips.tsx# 历史行程
│   │   │   ├── index.tsx       # 行程主页面（底部导航-行程）
│   │   │   ├── my-tracks.tsx   # 我的足迹（世界地图）
│   │   │   ├── profile.tsx     # 个人中心（底部导航-我的）
│   │   │   ├── settings.tsx    # 设置
│   │   │   ├── trip-plan.tsx   # 行程详情/AI规划
│   │   │   └── weather.tsx     # 天气页面
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── types.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── README.md
```

## 准备工作

### 环境与工具
- [x] Node.js 18+ 和 npm（前端 Next.js）
- [x] Python 3.10+ 和 pip（后端 FastAPI）
- [x] PostgreSQL 数据库（本地或云上）
- [x] Redis（缓存天气/搜索结果）
- [x] Git

### 需要申请 API Key
- [ ] 高德地图 JS API Key（前端地图展示）
- [x] DeepSeek API Key（AI 路线生成）
- [ ] 和风天气 Key（天气预报接入）

### 需要了解的资料
- Next.js 项目结构和 SSR/SSG 的基本用法
- FastAPI 路由、依赖注入和异步处理
- 高德地图 JS API 的集成方式（地图展示、标记）
- DeepSeek API 的调用格式和参数
- 和风天气 API 的接口文档
- PostgreSQL 建表和基本查询

### PostgreSQL 数据库内容建议：
- users — 用户账户（用户名、邮箱、密码哈希、偏好设置等）
- destinations — 景点/目的地（名称、位置、分类、评分、价格等级、标签等）
- trip_plans — 旅行计划（标题、日期、预算、偏好、天气版本关联等）
- itinerary_items — 行程明细（每日活动、时间、地点、交通方式、预估费用、天气版本等）

## 分阶段开发路线

### Phase 1: MVP 原型（1-2 个月）
- [ ] 用户系统（注册/偏好收集）
- [ ] 目的地 CRUD（手动添加 + 基本推荐）
- [ ] 地图展示（高德地图 SDK 集成）
- [ ] 天气接入 + 展示
- [ ] 基础 AI 路线生成（DeepSeek API）

### Phase 2: 智能规划（2-3 个月）
- [ ] 交通方案推荐（Rome2Rio / 高德路径规划）
- [ ] AI 游览方案深度定制（多风格支持）
- [ ] 餐饮推荐（顺路算法 + 第三方 API）
- [ ] 住宿推荐（预算/品质/距离多维排序）

### Phase 3: 天气备选 + 差异化（1-2 个月）
- [ ] 7 天天气预报接入
- [ ] 恶劣天气自动触发备选方案
- [ ] 行程版本比较（多云 vs 下雨）

### Phase 4: 数据增强（1-2 个月）
- [ ] SerpAPI / Bing Search 实时搜索增强
- [ ] AI 搜索小红书/马蜂窝/豆瓣内容
- [ ] 用户反馈闭环（纠错 + 评分）

### Phase 5: 打磨发布（1 个月）
- [ ] UI/UX 打磨
- [ ] 性能优化（缓存策略）
- [ ] 上线 + 迭代

## 快速启动（开发环境）

```bash
# 前端
cd frontend
# npm install
npm run dev  # 浏览器打开 http://localhost:3001，按 F12 → 切换到移动端视图体验手机效果

# 后端 (C:\ProgramData\anaconda3\python.exe)
cd backend
python -m pip install -r requirements.txt  # already satisfied
python -m uvicorn main:app --reload
```
