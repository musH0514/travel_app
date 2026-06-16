import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import type { TripPlan } from '@/utils/types';

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
    weatherConcerns: [],
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
  {
    id: '3', userId: 'u1',
    destinations: [
      { id: 'd4', name: '大理', description: '', location: { lat: 25.6, lng: 100.2 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2026-09-10', endDate: '2026-09-14',
    budget: { total: 4000, transport: 800, accommodation: 1500, food: 1000, tickets: 300, other: 400 },
    preferences: { style: '休闲度假', budgetLevel: '经济型' },
    weatherConcerns: [],
    status: 'planned',
    createdAt: '2026-06-05', updatedAt: '2026-06-05',
  },
];

const TripsPage: React.FC = () => {
  const router = useRouter();

  const ongoingTrips = mockTrips.filter((t) => t.status === 'ongoing');
  const plannedTrips = mockTrips.filter((t) => t.status === 'planned');

  const handleTripPress = (trip: TripPlan) => {
    router.push('/trip-plan');
  };

  const handleEditTrip = (trip: TripPlan) => {
    console.log('编辑行程:', trip.id);
  };

  const handleDeleteTrip = (trip: TripPlan) => {
    console.log('删除行程:', trip.id);
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => router.push('/create-trip')}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold rounded-xl active:opacity-90 transition-opacity shadow-soft"
        >
          + 创建新行程
        </button>
      </div>

      {ongoingTrips.length > 0 && (
        <div className="px-4 mt-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">⏳ 进行中</h3>
          <div className="space-y-3">
            {ongoingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={handleTripPress}
                onEdit={handleEditTrip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        </div>
      )}

      {plannedTrips.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📅 未出行</h3>
          <div className="space-y-3">
            {plannedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={handleTripPress}
                onEdit={handleEditTrip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        </div>
      )}

      {ongoingTrips.length === 0 && plannedTrips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">🗓</span>
          <p className="text-sm">还没有行程</p>
          <p className="text-xs mt-1">点击上方按钮创建你的第一个行程吧</p>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
