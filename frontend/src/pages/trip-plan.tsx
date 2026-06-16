import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import AiPlanForm from '@/components/AiPlanForm';
import ItineraryView from '@/components/ItineraryView';
import BudgetSummary from '@/components/BudgetSummary';
import LuggageSuggest from '@/components/LuggageSuggest';
import RestaurantCard from '@/components/RestaurantCard';
import AccommodationCard from '@/components/AccommodationCard';
import type { AiPlanFormData } from '@/utils/types';
import {
  mockTrips,
  tripItineraries,
  tripWeather,
  mockLuggage,
  mockRestaurants,
  mockAccommodations,
} from '@/utils/mockData';

const TripPlanPage: React.FC = () => {
  const router = useRouter();
  const id = router.isReady ? (router.query.id as string) : undefined;

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiSubmit = async (data: AiPlanFormData) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setActiveTab('list');
  };

  if (id) {
    const trip = mockTrips.find((t) => t.id === id);
    if (trip) {
      const itinerary = tripItineraries[id];
      const weather = tripWeather[id] || [];
      const budget = trip.budget;

      return (
        <div className="pb-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-bold text-gray-800">
              {trip.destinations.map((d) => d.name).join(' · ')}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(trip.startDate).toLocaleDateString('zh-CN')} - {new Date(trip.endDate).toLocaleDateString('zh-CN')}
              {' · '} {trip.preferences.style}
            </p>
          </div>

          <div className="px-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">📋 每日行程</h3>
            {itinerary ? (
              <ItineraryView
                itinerary={itinerary}
                weatherForecasts={weather}
              />
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">暂无行程数据</div>
            )}
          </div>

          <div className="px-4 mt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">💰 预算概览</h3>
            <BudgetSummary budget={budget} />
          </div>

          <div className="px-4 mt-5">
            <LuggageSuggest suggestions={mockLuggage} />
          </div>

          <div className="px-4 mt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">🍜 沿途美食推荐</h3>
            <div className="space-y-2">
              {mockRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>

          <div className="px-4 mt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">🏨 住宿推荐</h3>
            <div className="space-y-2">
              {mockAccommodations.map((acc) => (
                <AccommodationCard key={acc.id} accommodation={acc} />
              ))}
            </div>
          </div>
        </div>
      );
    }
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
              <TripCard key={trip.id} trip={trip} />
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
