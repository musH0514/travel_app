import React from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import type { TripPlan } from '@/utils/types';

const mockCompletedTrips: TripPlan[] = [
  {
    id: 'h1', userId: 'u1',
    destinations: [
      { id: 'd1', name: '昆明', description: '', location: { lat: 25.0, lng: 102.7 }, images: [], category: '', rating: 4.5, price: 0, tags: [], duration: 0 },
      { id: 'd2', name: '大理', description: '', location: { lat: 25.6, lng: 100.2 }, images: [], category: '', rating: 4.6, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2026-04-01', endDate: '2026-04-05',
    budget: { total: 6000, transport: 1500, accommodation: 2000, food: 1500, tickets: 500, other: 500 },
    preferences: { style: '休闲度假', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2026-03-20', updatedAt: '2026-04-05',
  },
  {
    id: 'h2', userId: 'u1',
    destinations: [
      { id: 'd3', name: '厦门', description: '', location: { lat: 24.5, lng: 118.1 }, images: [], category: '', rating: 4.4, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2026-02-10', endDate: '2026-02-13',
    budget: { total: 3500, transport: 800, accommodation: 1200, food: 800, tickets: 300, other: 400 },
    preferences: { style: '美食之旅', budgetLevel: '经济型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2026-01-25', updatedAt: '2026-02-13',
  },
  {
    id: 'h3', userId: 'u1',
    destinations: [
      { id: 'd4', name: '杭州', description: '', location: { lat: 30.3, lng: 120.2 }, images: [], category: '', rating: 4.7, price: 0, tags: [], duration: 0 },
    ],
    startDate: '2025-12-20', endDate: '2025-12-24',
    budget: { total: 4500, transport: 1000, accommodation: 1800, food: 1000, tickets: 400, other: 300 },
    preferences: { style: '文艺漫步', budgetLevel: '舒适型' },
    weatherConcerns: [],
    status: 'completed',
    createdAt: '2025-12-01', updatedAt: '2025-12-24',
  },
];

const HistoryTripsPage: React.FC = () => {
  const router = useRouter();

  const handleTripPress = (trip: TripPlan) => {
    router.push('/trip-plan');
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        {mockCompletedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">📜</span>
            <p className="text-sm">还没有完成的历史行程</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockCompletedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={handleTripPress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTripsPage;
