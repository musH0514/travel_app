// ========== TripWise 全局常量 ==========

// API 基础地址，从环境变量读取
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 高德地图 API Key（请替换为你自己的 Key）
export const PLACEHOLDER_AMAP_KEY = 'YOUR_AMAP_KEY_HERE';

// 和风天气 API Key（请替换为你自己的 Key）
export const PLACEHOLDER_HEFENG_KEY = 'YOUR_HEFENG_KEY_HERE';

// 出行风格选项
export const TRIP_STYLES = [
  '网红打卡',
  '文艺漫步',
  '亲子游玩',
  '深度文化',
  '休闲度假',
  '美食之旅',
  '摄影采风',
  '冒险探索',
] as const;

// 预算等级
export const BUDGET_LEVELS = ['经济型', '舒适型', '轻奢型', '豪华型'] as const;

// 交通方式
export const TRANSPORT_MODES = ['自驾', '公交', '步行', '打车', '地铁'] as const;

// 目的地分类
export const DESTINATION_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'natural', label: '自然' },
  { key: 'culture', label: '人文' },
  { key: 'food', label: '美食' },
  { key: 'shopping', label: '购物' },
] as const;

// 底部导航配置
export const BOTTOM_NAV_ITEMS = [
  { key: 'trips', label: '行程', icon: '📋', path: '/' },
  { key: 'profile', label: '我的', icon: '👤', path: '/profile' },
] as const;

// 天气状况映射
export const WEATHER_CONDITIONS: Record<string, { label: string; icon: string; color: string }> = {
  sunny: { label: '晴朗', icon: '☀️', color: '#FBBF24' },
  cloudy: { label: '多云', icon: '⛅', color: '#9CA3AF' },
  overcast: { label: '阴天', icon: '☁️', color: '#6B7280' },
  light_rain: { label: '小雨', icon: '🌦', color: '#60A5FA' },
  moderate_rain: { label: '中雨', icon: '🌧', color: '#3B82F6' },
  heavy_rain: { label: '大雨', icon: '🌧', color: '#1D4ED8' },
  thunderstorm: { label: '雷雨', icon: '⛈', color: '#7C3AED' },
  snowy: { label: '雪', icon: '🌨', color: '#E0E7FF' },
  foggy: { label: '雾', icon: '🌫', color: '#9CA3AF' },
} as const;

// 行李类别
export const LUGGAGE_CATEGORIES = ['证件', '衣物', '电子', '药品', '其他'] as const;

// 预算类别
export const BUDGET_CATEGORIES = [
  { key: 'transport', label: '交通', color: '#3B82F6' },
  { key: 'accommodation', label: '住宿', color: '#8B5CF6' },
  { key: 'food', label: '餐饮', color: '#F97316' },
  { key: 'tickets', label: '门票', color: '#10B981' },
  { key: 'other', label: '其他', color: '#6B7280' },
] as const;

// 本地存储 Key
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'tripwise_auth_token',
  USER_INFO: 'tripwise_user',
  AMAP_KEY: 'tripwise_amap_key',
  HEFENG_KEY: 'tripwise_hefeng_key',
  RECENT_SEARCHES: 'tripwise_recent_searches',
  DRAFT_TRIP: 'tripwise_draft_trip',
} as const;

// 页面路由
export const ROUTES = {
  HOME: '/',
  CREATE_TRIP: '/create-trip',
  TRIP_PLAN: '/trip-plan',
  MY_TRACKS: '/my-tracks',
  HISTORY_TRIPS: '/history-trips',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
