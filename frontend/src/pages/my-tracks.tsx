import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTripPlans } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import { adaptTrip } from '@/utils/apiAdapters';

const MyTracksPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [visitedCities, setVisitedCities] = useState<string[]>([]);
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
        const trips = (data as unknown as Record<string, unknown>[]).map(adaptTrip);
        const citySet = new Set<string>();
        for (const trip of trips) {
          for (const dest of trip.destinations) {
            if (dest.name) citySet.add(dest.name);
          }
        }
        setVisitedCities(Array.from(citySet));
      } catch {
        setVisitedCities([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, authLoading, router]);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const visitedCount = visitedCities.length;

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>;
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">已探索</p>
              <p className="text-3xl font-bold mt-1">{visitedCount}</p>
              <p className="text-xs opacity-70 mt-1">个城市</p>
            </div>
            <span className="text-5xl">🗺</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">📍 已解锁城市</h3>
        <div className="relative bg-gray-50 rounded-3xl p-5 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              <path d="M200,200 Q300,150 400,200 Q500,250 600,200 Q700,150 800,200" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M150,300 Q300,250 450,300 Q600,350 750,300 Q850,250 900,300" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {visitedCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className="p-3 rounded-2xl text-center transition-all bg-brand-50 border border-brand-200 hover:bg-brand-100"
              >
                <span className="text-xl block mb-1">📍</span>
                <span className="text-xs font-medium text-brand-700">{city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCity && (
        <div className="px-4 mt-4">
          <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
            <p className="text-sm font-medium text-brand-800">
              📍 {selectedCity} — 已打卡
            </p>
            <p className="text-xs text-brand-600 mt-1">
              在这里留下了美好的旅行回忆
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTracksPage;
