import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import AiPlanForm from '@/components/AiPlanForm';
import ItineraryView from '@/components/ItineraryView';
import BudgetSummary from '@/components/BudgetSummary';
import LuggageSuggest from '@/components/LuggageSuggest';
import type { AiPlanFormData, TripPlan, Itinerary, Budget, LuggageSuggestion } from '@/utils/types';
import { getTripPlanById, getTripPlans } from '@/api/trips';
import { getItinerary } from '@/api/trips';
import { generateTripPlan, getLuggageSuggestions } from '@/api/ai';
import { useAuth } from '@/context/AuthContext';
import { adaptTrip, adaptItinerary } from '@/utils/apiAdapters';

const TripPlanPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const id = router.query.id as string | undefined;

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [isGenerating, setIsGenerating] = useState(false);
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [luggage, setLuggage] = useState<LuggageSuggestion[]>([]);

  useEffect(() => {
    if (authLoading || !router.isReady) return;

    if (id) {
      (async () => {
        try {
          const data = await getTripPlanById(id);
          const raw = data as unknown as Record<string, unknown>;
          const adapted = adaptTrip(raw);
          setTrip(adapted);

          const items = raw.itinerary as Array<Record<string, unknown>> | undefined;
          if (items) {
            setItinerary(adaptItinerary(id, items));
          }
        } catch {
          setTrip(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
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
    }
  }, [id, isAuthenticated, authLoading, router, router.isReady]);

  const handleAiSubmit = async (data: AiPlanFormData) => {
    setIsGenerating(true);
    try {
      const result = await generateTripPlan({
        destinations: data.destinations.split(/[,，、\s]+/).filter(Boolean),
        startDate: data.startDate,
        endDate: data.endDate,
        styles: data.styles,
        budgetLevel: data.budgetLevel,
        specialRequirements: data.specialRequirements,
      });
      const plan = result as unknown as Record<string, unknown>;
      if (plan.itinerary) {
        setItinerary(adaptItinerary('new', (plan.itinerary as Record<string, unknown>).days as Array<Record<string, unknown>> || []));
      }
      setActiveTab('list');
    } catch {
      // fallback: keep UI unchanged
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>;
  }

  if (id && trip) {
    const budget: Budget = trip.budget;

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
            <ItineraryView itinerary={itinerary} />
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无行程数据</div>
          )}
        </div>

        <div className="px-4 mt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">💰 预算概览</h3>
          <BudgetSummary budget={budget} />
        </div>

        <div className="px-4 mt-5">
          <LuggageSuggest suggestions={luggage.length > 0 ? luggage : ([
            { category: '证件' as const, items: [{ name: '身份证', reason: '国内旅行必备证件' }] },
            { category: '衣物' as const, items: [{ name: '换洗衣物', reason: '根据行程天数准备' }] },
            { category: '电子' as const, items: [{ name: '充电宝', reason: '手机拍照导航耗电快' }] },
          ])} />
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
          {trips.length === 0 ? (
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
            trips.map((t) => (
              <TripCard key={t.id} trip={t} />
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
