import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import YearDivider from '@/components/YearDivider';
import { getTripPlans } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import { adaptTrip } from '@/utils/apiAdapters';
import { STORAGE_KEYS } from '@/utils/constants';
import { restoreScrollPosition } from '@/utils/scrollRestoration';
import type { TripPlan } from '@/utils/types';

const TripsPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (loading) return;
    restoreScrollPosition(STORAGE_KEYS.SCROLL_HOME, scrollContainerRef.current);
  }, [loading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>
    );
  }

  const ongoingTrips = trips.filter((t) => t.status === 'ongoing');
  const plannedTrips = trips
    .filter((t) => t.status === 'planned')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const tripListProps = {
    scrollRestoreKey: STORAGE_KEYS.SCROLL_HOME,
    scrollContainerRef,
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: 'calc(100vh - 48px - 56px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex-shrink-0 px-4 pt-3 pb-2 bg-white border-b border-gray-50">
        <button
          onClick={() => router.push('/create-trip')}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold rounded-xl active:opacity-90 transition-opacity shadow-soft"
        >
          + 创建新行程
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain pb-6">
        {ongoingTrips.length > 0 && (
          <div className="px-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">⏳ 进行中</h3>
            <div className="space-y-3">
              {ongoingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} {...tripListProps} />
              ))}
            </div>
          </div>
        )}

        {plannedTrips.length > 0 && (
          <div className="px-4 mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">📅 未出行</h3>
            <div className="space-y-3">
              {plannedTrips.map((trip, index) => {
                const year = new Date(trip.startDate).getFullYear();
                const prevYear =
                  index > 0
                    ? new Date(plannedTrips[index - 1].startDate).getFullYear()
                    : null;
                const showYearDivider = index === 0 || year !== prevYear;

                return (
                  <React.Fragment key={trip.id}>
                    {showYearDivider && <YearDivider year={year} />}
                    <TripCard trip={trip} {...tripListProps} />
                  </React.Fragment>
                );
              })}
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
    </div>
  );
};

export default TripsPage;
