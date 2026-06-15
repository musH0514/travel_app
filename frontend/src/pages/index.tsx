// ========== 首页 ==========
// 快捷入口、推荐目的地、当前行程

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import WeatherCard from '@/components/WeatherCard';
import TripCard from '@/components/TripCard';
import DestinationCard from '@/components/DestinationCard';
import type { TripPlan, Destination, WeatherForecast, WeatherAlert } from '@/utils/types';

// 模拟数据 - 首页展示用
const mockCurrentTrip: TripPlan = {
  id: '1',
  userId: 'user1',
  destinations: [
    { id: 'd1', name: '北京', description: '古都北京', location: { lat: 39.9, lng: 116.4 }, images: [], category: '文化', rating: 4.5, price: 2000, tags: ['历史', '故宫'], duration: 8 },
    { id: 'd2', name: '西安', description: '古城西安', location: { lat: 34.3, lng: 108.9 }, images: [], category: '文化', rating: 4.7, price: 1500, tags: ['兵马俑', '历史'], duration: 6 },
  ],
  startDate: '2026-07-15',
  endDate: '2026-07-20',
  budget: { total: 8000, transport: 2000, accommodation: 3000, food: 1500, tickets: 800, other: 700 },
  preferences: { style: '深度文化', budgetLevel: '舒适型', weatherPreference: 'outdoor' },
  weatherConcerns: [],
  createdAt: '2026-06-10',
  updatedAt: '2026-06-10',
};

const mockDestinations: Destination[] = [
  { id: 'd1', name: '北京', description: '千年古都，故宫长城，感受中华文化的博大精深', location: { lat: 39.9, lng: 116.4 }, images: [], category: '人文', rating: 4.8, price: 2000, tags: ['历史', '故宫', '长城'], duration: 8 },
  { id: 'd2', name: '成都', description: '天府之国，美食之都，熊猫故乡', location: { lat: 30.5, lng: 104.0 }, images: [], category: '美食', rating: 4.7, price: 1500, tags: ['熊猫', '火锅', '美食'], duration: 6 },
  { id: 'd3', name: '杭州', description: '人间天堂，西湖美景，江南水乡', location: { lat: 30.3, lng: 120.2 }, images: [], category: '自然', rating: 4.6, price: 1800, tags: ['西湖', '江南', '茶园'], duration: 5 },
  { id: 'd4', name: '大理', description: '风花雪月，苍山洱海，文艺青年最爱', location: { lat: 25.6, lng: 100.2 }, images: [], category: '自然', rating: 4.5, price: 1200, tags: ['洱海', '古城', '文艺'], duration: 6 },
];

const mockWeather: WeatherForecast[] = [
  { date: '2026-06-15', condition: 'sunny', temp: 32, high: 35, low: 25, humidity: 45, windSpeed: 12, icon: 'sunny' },
  { date: '2026-06-16', condition: 'cloudy', temp: 30, high: 33, low: 24, humidity: 55, windSpeed: 10, icon: 'cloudy' },
  { date: '2026-06-17', condition: 'light_rain', temp: 28, high: 30, low: 22, humidity: 75, windSpeed: 15, icon: 'light_rain' },
  { date: '2026-06-18', condition: 'sunny', temp: 31, high: 34, low: 23, humidity: 40, windSpeed: 8, icon: 'sunny' },
  { date: '2026-06-19', condition: 'sunny', temp: 33, high: 36, low: 26, humidity: 35, windSpeed: 11, icon: 'sunny' },
];

const quickActions = [
  { icon: '🤖', title: '智能生成行程', desc: 'AI 一键规划', color: 'from-brand-400 to-brand-600', path: '/trip-plan' },
  { icon: '🌍', title: '浏览目的地', desc: '发现好去处', color: 'from-blue-400 to-blue-600', path: '/destinations' },
  { icon: '🌤', title: '查看天气', desc: '出行好参考', color: 'from-orange-400 to-accent-500', path: '/weather' },
];

const HomePage: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('旅行者');
  const [currentTrip] = useState<TripPlan | null>(mockCurrentTrip);
  const [recommendedDestinations] = useState<Destination[]>(mockDestinations);

  return (
    <div className="pb-4">
      {/* 欢迎横幅 */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">早上好 👋</p>
              <h2 className="text-xl font-bold mt-1">{userName}</h2>
              <p className="text-xs opacity-70 mt-1">准备好开始新的旅程了吗？</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作卡片 */}
      <div className="px-4 mt-1">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => router.push(action.path)}
              className={`bg-gradient-to-br ${action.color} rounded-2xl p-3 text-white active:scale-95 transition-transform`}
              style={{ minHeight: '88px' }}
            >
              <span className="text-2xl block">{action.icon}</span>
              <p className="text-xs font-medium mt-2 leading-tight">{action.title}</p>
              <p className="text-[9px] opacity-70 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 进行中的行程 */}
      {currentTrip && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">⏳ 进行中的行程</h3>
            <button
              onClick={() => router.push('/trip-plan')}
              className="text-xs text-brand-600 font-medium"
            >
              查看全部 →
            </button>
          </div>
          <TripCard
            trip={currentTrip}
            onPress={(trip) => router.push('/trip-plan')}
          />
        </div>
      )}

      {/* 天气摘要 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">🌤 天气概览</h3>
          <button
            onClick={() => router.push('/weather')}
            className="text-xs text-brand-600 font-medium"
          >
            详细 →
          </button>
        </div>
        <WeatherCard
          forecast={mockWeather}
          alerts={[]}
          compact
        />
      </div>

      {/* 推荐目的地 */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">🔥 热门推荐</h3>
          <button
            onClick={() => router.push('/destinations')}
            className="text-xs text-brand-600 font-medium"
          >
            更多 →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide pb-2">
          {recommendedDestinations.map((dest) => (
            <div key={dest.id} className="min-w-[160px] w-[160px] flex-shrink-0">
              <DestinationCard
                destination={dest}
                onAddTrip={() => router.push('/trip-plan')}
                onPress={() => router.push('/destinations')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 最近搜索 */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">🕐 最近搜索</h3>
        <div className="flex gap-2 flex-wrap">
          {['云南', '日本', '海边度假', '古镇'].map((search) => (
            <button
              key={search}
              className="px-3 py-1.5 bg-gray-50 rounded-full text-xs text-gray-500 border border-gray-100 active:bg-gray-100 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
