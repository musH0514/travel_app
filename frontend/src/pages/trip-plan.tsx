import React, { useState } from 'react';
import TripCard from '@/components/TripCard';
import AiPlanForm from '@/components/AiPlanForm';
import ItineraryView from '@/components/ItineraryView';
import BudgetSummary from '@/components/BudgetSummary';
import LuggageSuggest from '@/components/LuggageSuggest';
import RestaurantCard from '@/components/RestaurantCard';
import AccommodationCard from '@/components/AccommodationCard';
import type {
  TripPlan, Itinerary, Budget, WeatherForecast,
  LuggageSuggestion, Restaurant, Accommodation, AiPlanFormData,
} from '@/utils/types';

const mockTrips: TripPlan[] = [
  {
    id: '1', userId: 'u1',
    destinations: [
      { id: 'd1', name: '北京', description: '', location: { lat: 39.9, lng: 116.4 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 },
      { id: 'd2', name: '西安', description: '', location: { lat: 34.3, lng: 108.9 }, images: [], category: '', rating: 4.7, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2026-07-15', endDate: '2026-07-20',
    budget: { total: 8000, transport: 2000, accommodation: 3000, food: 1500, tickets: 800, other: 700 },
    preferences: { style: '深度文化', budgetLevel: '舒适型' },
    weatherConcerns: [{ date: '2026-07-17', originalCondition: '小雨', concern: '故宫游览需带伞' }],
    status: 'ongoing',
    createdAt: '2026-06-10', updatedAt: '2026-06-10',
  },
  {
    id: '2', userId: 'u1',
    destinations: [
      { id: 'd3', name: '成都', description: '', location: { lat: 30.5, lng: 104.0 }, images: [], category: '', rating: 4.6, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2026-08-01', endDate: '2026-08-04',
    budget: { total: 5000, transport: 1000, accommodation: 2000, food: 1200, tickets: 400, other: 400 },
    preferences: { style: '美食之旅', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'planned',
    createdAt: '2026-06-08', updatedAt: '2026-06-08',
  },
];

const mockItinerary: Itinerary = {
  tripId: '1',
  version: 'sunny',
  days: [
    {
      date: '2026-07-15', dayNumber: 1,
      items: [
        { day: 1, timeSlot: '上午', destination: { id: 'd1', name: '故宫博物院', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '参观故宫博物院', transport: { mode: '地铁', duration: 30, cost: 5, route: '1号线天安门东站' }, estimatedCost: 60 },
        { day: 1, timeSlot: '下午', destination: { id: 'd1', name: '景山公园', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '景山公园俯瞰故宫全景', transport: { mode: '步行', duration: 10, cost: 0, route: '故宫北门步行' }, estimatedCost: 10 },
        { day: 1, timeSlot: '晚上', destination: { id: 'd1', name: '南锣鼓巷', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '南锣鼓巷逛吃', transport: { mode: '打车', duration: 15, cost: 20, route: '景山公园→南锣鼓巷' }, estimatedCost: 100 },
      ],
      isBadWeather: false,
    },
    {
      date: '2026-07-16', dayNumber: 2,
      items: [
        { day: 2, timeSlot: '上午', destination: { id: 'd1', name: '八达岭长城', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '登八达岭长城', transport: { mode: '自驾', duration: 90, cost: 50, route: '京藏高速' }, estimatedCost: 40 },
        { day: 2, timeSlot: '下午', destination: { id: 'd1', name: '明十三陵', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '参观明十三陵', transport: { mode: '自驾', duration: 20, cost: 15, route: '长城→十三陵' }, estimatedCost: 45 },
      ],
      isBadWeather: false,
    },
    {
      date: '2026-07-17', dayNumber: 3,
      items: [
        { day: 3, timeSlot: '上午', destination: { id: 'd1', name: '国家博物馆', description: '', location: { lat: 0, lng: 0 }, images: [], category: '', rating: 0, price: 0, tags: [], duration: 0 }, activity: '国家博物馆参观', transport: { mode: '地铁', duration: 25, cost: 4, route: '1号线天安门东站' }, estimatedCost: 30 },
      ],
      isBadWeather: true,
    },
  ],
};

const mockWeather: WeatherForecast[] = [
  { date: '2026-07-15', condition: 'sunny', temp: 32, high: 35, low: 25, humidity: 45, windSpeed: 12, icon: 'sunny' },
  { date: '2026-07-16', condition: 'cloudy', temp: 30, high: 33, low: 24, humidity: 55, windSpeed: 10, icon: 'cloudy' },
  { date: '2026-07-17', condition: 'light_rain', temp: 26, high: 28, low: 22, humidity: 85, windSpeed: 18, icon: 'light_rain' },
];

const mockBudget: Budget = { total: 8000, transport: 2000, accommodation: 3000, food: 1500, tickets: 800, other: 700 };

const mockLuggage: LuggageSuggestion[] = [
  { category: '证件', items: [{ name: '身份证', reason: '国内旅行必备证件' }, { name: '学生证', reason: '部分景点可享优惠' }] },
  { category: '衣物', items: [{ name: '防晒衣', reason: '夏季紫外线强', weatherRelated: true }, { name: '雨伞', reason: '行程中有雨天预报', weatherRelated: true }] },
  { category: '电子', items: [{ name: '充电宝', reason: '手机拍照导航耗电快' }] },
];

const mockRestaurants: Restaurant[] = [
  { id: 'r1', name: '四季民福烤鸭', location: { lat: 0, lng: 0 }, cuisine: '北京菜', priceRange: 3, rating: 4.6, isAlongRoute: true, distance: 300 },
  { id: 'r2', name: '南锣面馆', location: { lat: 0, lng: 0 }, cuisine: '面食', priceRange: 1, rating: 4.3, isAlongRoute: true, distance: 100 },
  { id: 'r3', name: '大董烤鸭', location: { lat: 0, lng: 0 }, cuisine: '高端中餐', priceRange: 5, rating: 4.8, isAlongRoute: false, distance: 2000 },
];

const mockAccommodations: Accommodation[] = [
  { id: 'a1', name: '北京王府井希尔顿', location: { lat: 0, lng: 0 }, price: 899, rating: 4.6, type: '酒店', amenities: ['WiFi', '早餐', '健身房', '游泳池'], distanceToAttractions: 500 },
  { id: 'a2', name: '北京四合院民宿', location: { lat: 0, lng: 0 }, price: 488, rating: 4.4, type: '民宿', amenities: ['WiFi', '早餐', '空调'], distanceToAttractions: 1200 },
];

const TripPlanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  const handleTripPress = (trip: TripPlan) => {
    setSelectedTrip(trip);
    setShowItinerary(true);
  };

  const handleDeleteTrip = (trip: TripPlan) => {
    console.log('删除行程:', trip.id);
  };

  const handleAiSubmit = async (data: AiPlanFormData) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setActiveTab('list');
  };

  const handleBackFromDetail = () => {
    setShowItinerary(false);
    setSelectedTrip(null);
  };

  if (showItinerary && selectedTrip) {
    return (
      <div className="pb-4">
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={handleBackFromDetail}
            className="flex items-center gap-1 text-sm text-brand-600 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回行程列表
          </button>
        </div>

        <div className="px-4 py-2">
          <h2 className="text-lg font-bold text-gray-800">
            {selectedTrip.destinations.map((d) => d.name).join(' · ')}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(selectedTrip.startDate).toLocaleDateString('zh-CN')} - {new Date(selectedTrip.endDate).toLocaleDateString('zh-CN')}
            {' · '} {selectedTrip.preferences.style}
          </p>
        </div>

        <div className="px-4 mt-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📋 每日行程</h3>
          <ItineraryView
            itinerary={mockItinerary}
            weatherForecasts={mockWeather}
            onToggleVersion={() => console.log('切换版本')}
          />
        </div>

        <div className="px-4 mt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">💰 预算概览</h3>
          <BudgetSummary budget={mockBudget} />
        </div>

        <div className="px-4 mt-5">
          <LuggageSuggest suggestions={mockLuggage} />
        </div>

        <div className="px-4 mt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🍜 沿途美食推荐</h3>
          <div className="space-y-2">
            {mockRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        </div>

        <div className="px-4 mt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🏨 住宿推荐</h3>
          <div className="space-y-2">
            {mockAccommodations.map((acc) => (
              <AccommodationCard
                key={acc.id}
                accommodation={acc}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 pb-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-gray-800 shadow-soft'
                : 'text-gray-500'
            }`}
          >
            📋 我的行程
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'new'
                ? 'bg-white text-gray-800 shadow-soft'
                : 'text-gray-500'
            }`}
          >
            ✨ 新建行程
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="px-4 space-y-3">
          {mockTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-4xl mb-3">🗓</span>
              <p className="text-sm">还没有行程</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3 px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl"
              >
                ✨ 新建一个行程
              </button>
            </div>
          ) : (
            mockTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={handleTripPress}
                onDelete={handleDeleteTrip}
              />
            ))
          )}
        </div>
      ) : (
        <div className="px-4">
          <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-brand-800">🤖 AI 智能规划</h3>
            <p className="text-xs text-brand-600 mt-1">
              告诉我想去哪里、玩什么，AI 帮你一键生成完美行程
            </p>
          </div>

          <AiPlanForm
            onSubmit={handleAiSubmit}
            isLoading={isGenerating}
          />
        </div>
      )}
    </div>
  );
};

export default TripPlanPage;
