// ========== TripWise 类型定义 ==========

// 用户信息
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // 头像 URL
  preferences: UserPreferences;
}

// 用户偏好设置
export interface UserPreferences {
  defaultTripStyle?: TripStyle; // 默认出行风格
  defaultBudgetLevel?: BudgetLevel; // 默认预算等级
  weatherPreference?: 'indoor' | 'outdoor'; // 天气偏好：室内 / 户外
  units?: 'metric' | 'imperial'; // 单位制
  language?: 'zh-CN' | 'en'; // 语言
}

// 出行风格类型
export type TripStyle = '网红打卡' | '文艺漫步' | '亲子游玩' | '深度文化' | '休闲度假' | '美食之旅' | '摄影采风' | '冒险探索';

// 预算等级
export type BudgetLevel = '经济型' | '舒适型' | '轻奢型' | '豪华型';

// 交通方式
export type TransportMode = '自驾' | '公交' | '步行' | '打车' | '地铁';

// 坐标点
export interface GeoLocation {
  lat: number;
  lng: number;
}

// 目的地
export interface Destination {
  id: string;
  name: string;
  description: string;
  location: GeoLocation;
  images: string[]; // 图片 URL 数组
  category: string; // 分类：自然/人文/美食/购物
  rating: number; // 评分 0-5
  price: number; // 预估价格
  tags: string[]; // 标签
  duration: number; // 建议游览时长（小时）
}

// 行程计划
export interface TripPlan {
  id: string;
  userId: string;
  destinations: Destination[];
  startDate: string; // ISO 日期字符串
  endDate: string;
  budget: Budget;
  preferences: TripPreferences;
  weatherConcerns: WeatherConcern[];
  version?: 'sunny' | 'rainy'; // 天气版本
  createdAt: string;
  updatedAt: string;
}

// 预算
export interface Budget {
  total: number;
  transport: number;
  accommodation: number;
  food: number;
  tickets: number;
  other: number;
}

// 行程偏好
export interface TripPreferences {
  style: TripStyle;
  budgetLevel: BudgetLevel;
  specialRequirements?: string; // 特殊需求
  weatherPreference: 'indoor' | 'outdoor';
}

// 天气关注点
export interface WeatherConcern {
  date: string;
  originalCondition: string;
  concern: string;
}

// 行程日项目
export interface ItineraryItem {
  day: number; // 第几天
  timeSlot: string; // 时间段：上午/下午/晚上
  destination: Destination;
  activity: string; // 活动描述
  transport: TransportOption; // 交通方式
  notes?: string; // 备注
  estimatedCost: number; // 预估花费
}

// 完整行程
export interface Itinerary {
  tripId: string;
  days: ItineraryDay[];
  version: 'sunny' | 'rainy';
}

// 每日行程
export interface ItineraryDay {
  date: string;
  dayNumber: number;
  weather?: WeatherForecast;
  items: ItineraryItem[];
  isBadWeather?: boolean; // 是否恶劣天气
}

// 天气预报
export interface WeatherForecast {
  date: string;
  condition: string; // 天气状况：晴/多云/小雨/大雨/雪
  temp: number; // 当前温度
  high: number; // 最高温
  low: number; // 最低温
  humidity: number; // 湿度
  windSpeed: number; // 风速
  icon: string; // 天气图标代号
}

// 天气预警
export interface WeatherAlert {
  type: string; // 预警类型：暴雨/台风/高温/寒潮
  severity: 'red' | 'orange' | 'yellow' | 'blue'; // 严重等级
  message: string;
  date: string;
}

// 交通选项
export interface TransportOption {
  mode: TransportMode;
  duration: number; // 分钟
  cost: number; // 费用
  route: string; // 路线描述
  provider?: string; // 提供商
}

// 餐厅推荐
export interface Restaurant {
  id: string;
  name: string;
  location: GeoLocation;
  cuisine: string; // 菜系
  priceRange: number; // 价格范围 1-5
  rating: number; // 评分 0-5
  image?: string;
  isAlongRoute: boolean; // 是否顺路
  distance?: number; // 距离（米）
}

// 住宿推荐
export interface Accommodation {
  id: string;
  name: string;
  location: GeoLocation;
  price: number; // 每晚价格
  rating: number; // 评分 0-5
  type: string; // 类型：酒店/民宿/青旅
  amenities: string[]; // 设施列表
  distanceToAttractions: number; // 到景点距离（米）
  image?: string;
}

// 行李建议
export interface LuggageSuggestion {
  category: LuggageCategory;
  items: LuggageItem[];
}

// 行李类别
export type LuggageCategory = '证件' | '衣物' | '电子' | '药品' | '其他';

// 行李物品
export interface LuggageItem {
  name: string;
  reason: string; // 携带理由
  weatherRelated?: boolean; // 是否与天气相关
}

// AI 规划表单数据
export interface AiPlanFormData {
  destinations: string;
  startDate: string;
  endDate: string;
  style: TripStyle;
  budgetLevel: BudgetLevel;
  specialRequirements: string;
  weatherPreference: 'indoor' | 'outdoor';
}

// AI 生成方案请求
export interface AiPlanRequest {
  destinations: string[];
  startDate: string;
  endDate: string;
  style: TripStyle;
  budgetLevel: BudgetLevel;
  specialRequirements?: string;
  weatherPreference: 'indoor' | 'outdoor';
}

// AI 生成方案响应
export interface AiPlanResponse {
  itinerary: Itinerary;
  budget: Budget;
  suggestions: string[];
}
