import type { TripPlan, Itinerary, WeatherForecast, LuggageSuggestion, Restaurant, Accommodation } from './types';

export const mockTrips: TripPlan[] = [
  {
    id: '1', userId: 'u1',
    destinations: [{ id: 'd1', name: '北京', description: '', location: { lat: 39.9, lng: 116.4 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 }, { id: 'd2', name: '西安', description: '', location: { lat: 34.3, lng: 108.9 }, images: [], category: '', rating: 4.7, price: 0, tags: [], duration: 0 }],
    startDate: '2026-07-15', endDate: '2026-07-20',
    budget: { total: 8000, transport: 2000, accommodation: 3000, food: 1500, tickets: 800, other: 700 },
    preferences: { style: '深度文化', budgetLevel: '舒适型' },
    weatherConcerns: [{ date: '2026-07-17', originalCondition: '小雨', concern: '故宫游览需带伞' }],
    status: 'ongoing',
    createdAt: '2026-06-10', updatedAt: '2026-06-10',
  },
  {
    id: '2', userId: 'u1',
    destinations: [{ id: 'd3', name: '成都', description: '', location: { lat: 30.5, lng: 104.0 }, images: [], category: '', rating: 4.6, price: 0, tags: [], duration: 0 }],
    startDate: '2026-08-01', endDate: '2026-08-04',
    budget: { total: 5000, transport: 1000, accommodation: 2000, food: 1200, tickets: 400, other: 400 },
    preferences: { style: '美食之旅', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'planned',
    createdAt: '2026-06-08', updatedAt: '2026-06-08',
  },
  {
    id: '3', userId: 'u1',
    destinations: [{ id: 'd4', name: '大理', description: '', location: { lat: 25.6, lng: 100.2 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 }],
    startDate: '2026-09-10', endDate: '2026-09-14',
    budget: { total: 4000, transport: 800, accommodation: 1500, food: 1000, tickets: 300, other: 400 },
    preferences: { style: '休闲度假', budgetLevel: '经济型' },
    weatherConcerns: [],
    status: 'planned',
    createdAt: '2026-06-05', updatedAt: '2026-06-05',
  },
  {
    id: 'h1', userId: 'u1',
    destinations: [{ id: 'd5', name: '昆明', description: '', location: { lat: 25.0, lng: 102.7 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 }, { id: 'd6', name: '大理', description: '', location: { lat: 25.6, lng: 100.2 }, images: [], category: '', rating: 4.6, price: 0, tags: [], duration: 0 }],
    startDate: '2026-04-01', endDate: '2026-04-05',
    budget: { total: 6000, transport: 1500, accommodation: 2000, food: 1500, tickets: 500, other: 500 },
    preferences: { style: '休闲度假', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2026-03-20', updatedAt: '2026-04-05',
  },
  {
    id: 'h2', userId: 'u1',
    destinations: [{ id: 'd7', name: '厦门', description: '', location: { lat: 24.5, lng: 118.1 }, images: [], category: '', rating: 4.4, price: 0, tags: [], duration: 0 }],
    startDate: '2026-02-10', endDate: '2026-02-13',
    budget: { total: 3500, transport: 800, accommodation: 1200, food: 800, tickets: 300, other: 400 },
    preferences: { style: '美食之旅', budgetLevel: '经济型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2026-01-25', updatedAt: '2026-02-13',
  },
  {
    id: 'h3', userId: 'u1',
    destinations: [{ id: 'd8', name: '杭州', description: '', location: { lat: 30.3, lng: 120.2 }, images: [], category: '', rating: 4.7, price: 0, tags: [], duration: 0 }],
    startDate: '2025-12-20', endDate: '2025-12-24',
    budget: { total: 4500, transport: 1000, accommodation: 1800, food: 1000, tickets: 400, other: 300 },
    preferences: { style: '文艺漫步', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2025-12-01', updatedAt: '2025-12-24',
  },
];

const baseItineraryDay = (dayNumber: number, date: string, activities: { slot: string; name: string; desc: string; cost: number }[]) => ({
  date,
  dayNumber,
  items: activities.map((a) => ({
    day: dayNumber,
    timeSlot: a.slot,
    destination: { id: `dest-${dayNumber}`, name: a.name, description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 },
    activity: a.desc,
    transport: { mode: '步行' as const, duration: 15, cost: 0, route: '' },
    estimatedCost: a.cost,
  })),
  isBadWeather: false,
});

export const tripItineraries: Record<string, Itinerary> = {
  '1': {
    tripId: '1', version: 'sunny',
    days: [
      baseItineraryDay(1, '2026-07-15', [
        { slot: '上午', name: '故宫博物院', desc: '参观故宫博物院', cost: 60 },
        { slot: '下午', name: '景山公园', desc: '景山公园俯瞰故宫全景', cost: 10 },
        { slot: '晚上', name: '南锣鼓巷', desc: '南锣鼓巷逛吃', cost: 100 },
      ]),
      baseItineraryDay(2, '2026-07-16', [
        { slot: '上午', name: '八达岭长城', desc: '登八达岭长城', cost: 40 },
        { slot: '下午', name: '明十三陵', desc: '参观明十三陵', cost: 45 },
      ]),
      baseItineraryDay(3, '2026-07-17', [
        { slot: '上午', name: '国家博物馆', desc: '国家博物馆参观', cost: 30 },
        { slot: '下午', name: '天坛公园', desc: '天坛公园游览', cost: 20 },
        { slot: '晚上', name: '王府井', desc: '王府井步行街', cost: 80 },
      ]),
      baseItineraryDay(4, '2026-07-18', [
        { slot: '上午', name: '西安', desc: '高铁前往西安', cost: 500 },
        { slot: '下午', name: '兵马俑', desc: '参观秦始皇兵马俑', cost: 120 },
        { slot: '晚上', name: '回民街', desc: '回民街品尝美食', cost: 80 },
      ]),
      baseItineraryDay(5, '2026-07-19', [
        { slot: '上午', name: '大雁塔', desc: '大雁塔游览', cost: 50 },
        { slot: '下午', name: '古城墙', desc: '西安古城墙骑行', cost: 45 },
      ]),
      baseItineraryDay(6, '2026-07-20', [
        { slot: '上午', name: '陕西历史博物馆', desc: '陕西历史博物馆', cost: 30 },
        { slot: '下午', name: '返程', desc: '整理行李返程', cost: 0 },
      ]),
    ],
  },
  '2': {
    tripId: '2', version: 'sunny',
    days: [
      baseItineraryDay(1, '2026-08-01', [
        { slot: '上午', name: '成都', desc: '抵达成都，入住酒店', cost: 0 },
        { slot: '下午', name: '宽窄巷子', desc: '宽窄巷子漫步', cost: 30 },
        { slot: '晚上', name: '锦里', desc: '锦里古街小吃', cost: 80 },
      ]),
      baseItineraryDay(2, '2026-08-02', [
        { slot: '上午', name: '大熊猫基地', desc: '成都大熊猫繁育研究基地', cost: 55 },
        { slot: '下午', name: '武侯祠', desc: '武侯祠游览', cost: 50 },
        { slot: '晚上', name: '九眼桥', desc: '九眼桥酒吧街', cost: 120 },
      ]),
      baseItineraryDay(3, '2026-08-03', [
        { slot: '上午', name: '都江堰', desc: '都江堰一日游', cost: 80 },
        { slot: '下午', name: '青城山', desc: '青城山游览', cost: 90 },
      ]),
      baseItineraryDay(4, '2026-08-04', [
        { slot: '上午', name: '人民公园', desc: '人民公园喝盖碗茶', cost: 20 },
        { slot: '下午', name: '返程', desc: '整理行李返程', cost: 0 },
      ]),
    ],
  },
  '3': {
    tripId: '3', version: 'sunny',
    days: [
      baseItineraryDay(1, '2026-09-10', [
        { slot: '上午', name: '大理', desc: '抵达大理，入住客栈', cost: 0 },
        { slot: '下午', name: '大理古城', desc: '大理古城闲逛', cost: 20 },
        { slot: '晚上', name: '人民路', desc: '人民路夜市小吃', cost: 60 },
      ]),
      baseItineraryDay(2, '2026-09-11', [
        { slot: '上午', name: '洱海', desc: '洱海西线骑行', cost: 30 },
        { slot: '下午', name: '喜洲古镇', desc: '喜洲古镇游览', cost: 20 },
        { slot: '晚上', name: '双廊', desc: '双廊古镇晚餐', cost: 80 },
      ]),
      baseItineraryDay(3, '2026-09-12', [
        { slot: '上午', name: '苍山', desc: '苍山索道游览', cost: 120 },
        { slot: '下午', name: '崇圣寺三塔', desc: '崇圣寺三塔参观', cost: 75 },
      ]),
      baseItineraryDay(4, '2026-09-13', [
        { slot: '上午', name: '洱海东线', desc: '洱海东线自驾', cost: 50 },
        { slot: '下午', name: '小普陀', desc: '小普陀游览', cost: 15 },
        { slot: '晚上', name: '大理古城', desc: '古城最后晚餐', cost: 80 },
      ]),
      baseItineraryDay(5, '2026-09-14', [
        { slot: '上午', name: '返程', desc: '整理行李返程', cost: 0 },
      ]),
    ],
  },
  'h1': {
    tripId: 'h1', version: 'sunny',
    days: [
      baseItineraryDay(1, '2026-04-01', [
        { slot: '上午', name: '昆明', desc: '抵达昆明长水机场', cost: 0 },
        { slot: '下午', name: '滇池', desc: '滇池海埂公园', cost: 20 },
        { slot: '晚上', name: '昆明老街', desc: '昆明老街美食', cost: 60 },
      ]),
      baseItineraryDay(2, '2026-04-02', [
        { slot: '上午', name: '石林', desc: '石林风景区游览', cost: 130 },
        { slot: '下午', name: '返回昆明', desc: '返回昆明市区', cost: 30 },
      ]),
      baseItineraryDay(3, '2026-04-03', [
        { slot: '上午', name: '大理', desc: '动车前往大理', cost: 145 },
        { slot: '下午', name: '大理古城', desc: '大理古城入住', cost: 10 },
        { slot: '晚上', name: '洋人街', desc: '洋人街晚餐', cost: 70 },
      ]),
      baseItineraryDay(4, '2026-04-04', [
        { slot: '上午', name: '洱海', desc: '洱海环湖一日游', cost: 50 },
        { slot: '下午', name: '双廊', desc: '双廊古镇', cost: 20 },
      ]),
      baseItineraryDay(5, '2026-04-05', [
        { slot: '上午', name: '返程', desc: '返程', cost: 0 },
      ]),
    ],
  },
  'h2': {
    tripId: 'h2', version: 'sunny',
    days: [
      baseItineraryDay(1, '2026-02-10', [
        { slot: '上午', name: '厦门', desc: '抵达厦门', cost: 0 },
        { slot: '下午', name: '鼓浪屿', desc: '鼓浪屿一日游', cost: 80 },
        { slot: '晚上', name: '中山路', desc: '中山路步行街', cost: 60 },
      ]),
      baseItineraryDay(2, '2026-02-11', [
        { slot: '上午', name: '南普陀寺', desc: '南普陀寺参观', cost: 0 },
        { slot: '下午', name: '厦门大学', desc: '厦门大学游览', cost: 0 },
        { slot: '晚上', name: '曾厝垵', desc: '曾厝垵美食', cost: 70 },
      ]),
      baseItineraryDay(3, '2026-02-12', [
        { slot: '上午', name: '环岛路', desc: '环岛路骑行', cost: 30 },
        { slot: '下午', name: '沙坡尾', desc: '沙坡尾艺术区', cost: 20 },
      ]),
      baseItineraryDay(4, '2026-02-13', [
        { slot: '上午', name: '返程', desc: '返程', cost: 0 },
      ]),
    ],
  },
  'h3': {
    tripId: 'h3', version: 'sunny',
    days: [
      baseItineraryDay(1, '2025-12-20', [
        { slot: '上午', name: '杭州', desc: '抵达杭州', cost: 0 },
        { slot: '下午', name: '西湖', desc: '西湖断桥白堤', cost: 0 },
        { slot: '晚上', name: '河坊街', desc: '河坊街历史文化街区', cost: 60 },
      ]),
      baseItineraryDay(2, '2025-12-21', [
        { slot: '上午', name: '灵隐寺', desc: '灵隐寺祈福', cost: 45 },
        { slot: '下午', name: '龙井村', desc: '龙井村品茶', cost: 50 },
      ]),
      baseItineraryDay(3, '2025-12-22', [
        { slot: '上午', name: '西溪湿地', desc: '西溪国家湿地公园', cost: 80 },
        { slot: '下午', name: '宋城', desc: '宋城千古情演出', cost: 120 },
      ]),
      baseItineraryDay(4, '2025-12-23', [
        { slot: '上午', name: '九溪烟树', desc: '九溪十八涧徒步', cost: 0 },
        { slot: '下午', name: '浙大之江校区', desc: '浙江大学之江校区', cost: 0 },
      ]),
      baseItineraryDay(5, '2025-12-24', [
        { slot: '上午', name: '返程', desc: '返程', cost: 0 },
      ]),
    ],
  },
};

export const tripWeather: Record<string, WeatherForecast[]> = {
  '1': [
    { date: '2026-07-15', condition: 'sunny', temp: 32, high: 35, low: 25, humidity: 45, windSpeed: 12, icon: 'sunny' },
    { date: '2026-07-16', condition: 'cloudy', temp: 30, high: 33, low: 24, humidity: 55, windSpeed: 10, icon: 'cloudy' },
    { date: '2026-07-17', condition: 'light_rain', temp: 26, high: 28, low: 22, humidity: 85, windSpeed: 18, icon: 'light_rain' },
    { date: '2026-07-18', condition: 'sunny', temp: 34, high: 37, low: 26, humidity: 40, windSpeed: 8, icon: 'sunny' },
    { date: '2026-07-19', condition: 'sunny', temp: 35, high: 38, low: 27, humidity: 38, windSpeed: 7, icon: 'sunny' },
    { date: '2026-07-20', condition: 'cloudy', temp: 31, high: 34, low: 25, humidity: 50, windSpeed: 9, icon: 'cloudy' },
  ],
  '3': [
    { date: '2026-09-10', condition: 'sunny', temp: 24, high: 27, low: 18, humidity: 60, windSpeed: 10, icon: 'sunny' },
    { date: '2026-09-11', condition: 'sunny', temp: 25, high: 28, low: 19, humidity: 55, windSpeed: 8, icon: 'sunny' },
    { date: '2026-09-12', condition: 'cloudy', temp: 22, high: 25, low: 17, humidity: 65, windSpeed: 12, icon: 'cloudy' },
    { date: '2026-09-13', condition: 'sunny', temp: 26, high: 29, low: 20, humidity: 50, windSpeed: 7, icon: 'sunny' },
    { date: '2026-09-14', condition: 'cloudy', temp: 23, high: 26, low: 18, humidity: 58, windSpeed: 9, icon: 'cloudy' },
  ],
  'h1': [
    { date: '2026-04-01', condition: 'cloudy', temp: 20, high: 23, low: 14, humidity: 55, windSpeed: 10, icon: 'cloudy' },
    { date: '2026-04-02', condition: 'sunny', temp: 22, high: 25, low: 15, humidity: 50, windSpeed: 8, icon: 'sunny' },
    { date: '2026-04-03', condition: 'sunny', temp: 24, high: 27, low: 16, humidity: 45, windSpeed: 7, icon: 'sunny' },
    { date: '2026-04-04', condition: 'light_rain', temp: 19, high: 22, low: 14, humidity: 75, windSpeed: 14, icon: 'light_rain' },
    { date: '2026-04-05', condition: 'cloudy', temp: 21, high: 24, low: 15, humidity: 60, windSpeed: 9, icon: 'cloudy' },
  ],
};

export const mockLuggage: LuggageSuggestion[] = [
  { category: '证件', items: [{ name: '身份证', reason: '国内旅行必备证件' }, { name: '学生证', reason: '部分景点可享优惠' }] },
  { category: '衣物', items: [{ name: '防晒衣', reason: '夏季紫外线强', weatherRelated: true }, { name: '雨伞', reason: '行程中有雨天预报', weatherRelated: true }] },
  { category: '电子', items: [{ name: '充电宝', reason: '手机拍照导航耗电快' }] },
];

export const mockRestaurants: Restaurant[] = [
  { id: 'r1', name: '四季民福烤鸭', location: { lat: 0, lng: 0 }, cuisine: '北京菜', priceRange: 3, rating: 4.6, isAlongRoute: true, distance: 300 },
  { id: 'r2', name: '南锣面馆', location: { lat: 0, lng: 0 }, cuisine: '面食', priceRange: 1, rating: 4.3, isAlongRoute: true, distance: 100 },
  { id: 'r3', name: '大董烤鸭', location: { lat: 0, lng: 0 }, cuisine: '高端中餐', priceRange: 5, rating: 4.8, isAlongRoute: false, distance: 2000 },
];

export const mockAccommodations: Accommodation[] = [
  { id: 'a1', name: '北京王府井希尔顿', location: { lat: 0, lng: 0 }, price: 899, rating: 4.6, type: '酒店', amenities: ['WiFi', '早餐', '健身房', '游泳池'], distanceToAttractions: 500 },
  { id: 'a2', name: '北京四合院民宿', location: { lat: 0, lng: 0 }, price: 488, rating: 4.4, type: '民宿', amenities: ['WiFi', '早餐', '空调'], distanceToAttractions: 1200 },
];
