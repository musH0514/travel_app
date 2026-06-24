import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import { getTripPlans } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import { adaptTrip } from '@/utils/apiAdapters';
import type { TripPlan } from '@/utils/types';

const HistoryTripsPage: React.FC = () => {
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
        const all = (data as unknown as Record<string, unknown>[]).map(adaptTrip);
        setTrips(all);
      } catch {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>;
  }

  const completedTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        {completedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">📜</span>
            <p className="text-sm">还没有完成的历史行程</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTripsPage;
