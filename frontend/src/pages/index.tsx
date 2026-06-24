import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import { getTripPlans } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import { adaptTrip } from '@/utils/apiAdapters';
import type { TripPlan } from '@/utils/types';

const TripsPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        const data = await getTripPlans();
        setTrips((data as unknown as Record<string, unknown>[]).map(adaptTrip));
      } catch {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>
    );
  }

  const ongoingTrips = trips.filter((t) => t.status === 'ongoing');
  const plannedTrips = trips.filter((t) => t.status === 'planned');

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
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {plannedTrips.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📅 未出行</h3>
          <div className="space-y-3">
            {plannedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
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
