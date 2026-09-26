import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TripCard from '@/components/TripCard';
import AiPlanForm from '@/components/AiPlanForm';
import ItineraryView from '@/components/ItineraryView';
import BudgetSummary from '@/components/BudgetSummary';
import LuggageSuggest from '@/components/LuggageSuggest';
import type { AiPlanFormData, TripPlan, Itinerary, Budget, LuggageSuggestion } from '@/utils/types';
import { getTripPlanById, getTripPlans, getItinerary, updateTripPlan, replanTrip, deleteTripPlan } from '@/api/trips';
import { generateTripPlan, getLuggageSuggestions } from '@/api/ai';
import { useAuth } from '@/context/AuthContext';
import { useHeaderAction } from '@/context/HeaderActionContext';
import { adaptTrip, adaptItinerary } from '@/utils/apiAdapters';
import { ApiError } from '@/api/client';

const TripPlanPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setRightAction } = useHeaderAction();
  const id = router.query.id as string | undefined;

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [isGenerating, setIsGenerating] = useState(false);
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [luggage, setLuggage] = useState<LuggageSuggestion[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [replanning, setReplanning] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

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
            setItinerary(
              adaptItinerary(id, items, adapted.startDate)
            );
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

  const titleFallback =
    trip?.destinations.map((d) => d.name).join(' · ') || '未命名行程';

  const openRename = () => {
    setRenameValue(trip?.title || titleFallback);
    setActionError('');
    setRenameOpen(true);
    setMenuOpen(false);
  };

  const handleRename = async () => {
    const name = renameValue.trim();
    if (!name) {
      setActionError('行程名称不能为空');
      return;
    }
    if (!id) return;
    setRenaming(true);
    setActionError('');
    try {
      await updateTripPlan(id, { title: name });
      setTrip((prev) => (prev ? { ...prev, title: name } : prev));
      setRenameOpen(false);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : '重命名失败，请稍后重试');
    } finally {
      setRenaming(false);
    }
  };

  const openDate = () => {
    setNewStartDate(trip?.startDate || '');
    setNewEndDate(trip?.endDate || '');
    setActionError('');
    setDateOpen(true);
    setMenuOpen(false);
  };

  const handleReplan = async () => {
    if (!id) return;
    if (!newStartDate || !newEndDate) {
      setActionError('请选择出发和返程日期');
      return;
    }
    if (newEndDate < newStartDate) {
      setActionError('返程日期不能早于出发日期');
      return;
    }
    setReplanning(true);
    setActionError('');
    try {
      await replanTrip(id, newStartDate, newEndDate);
      const data = await getTripPlanById(id);
      const raw = data as unknown as Record<string, unknown>;
      const adapted = adaptTrip(raw);
      setTrip(adapted);
      const items = raw.itinerary as Array<Record<string, unknown>> | undefined;
      if (items) {
        setItinerary(adaptItinerary(id, items, adapted.startDate));
      }
      setDateOpen(false);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : '重新规划失败，请稍后重试');
    } finally {
      setReplanning(false);
    }
  };

  const openDelete = () => {
    setActionError('');
    setDeleteOpen(true);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setActionError('');
    try {
      await deleteTripPlan(id);
      router.push('/');
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : '删除失败，请稍后重试');
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!id || !trip) {
      setRightAction(null);
      return;
    }

    setRightAction(
      <>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="-mr-2 w-10 h-10 flex items-center justify-center rounded-full text-gray-700 active:bg-gray-100"
          aria-label="更多操作"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="19" cy="12" r="1.7" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-40 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <button
              onClick={openRename}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-50 border-b border-gray-50"
            >
              ✏️ 重命名行程
            </button>
            <button
              onClick={openDate}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-50 border-b border-gray-50"
            >
              📅 修改日期
            </button>
            <button
              onClick={openDelete}
              className="w-full text-left px-4 py-3 text-sm text-red-600 active:bg-red-50"
            >
              🗑 删除行程
            </button>
          </div>
        )}
      </>
    );

    return () => setRightAction(null);
  }, [id, trip, menuOpen, setRightAction]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>;
  }

  if (id && trip) {
    const budget: Budget = trip.budget;
    const displayTitle =
      trip.title || trip.destinations.map((d) => d.name).join(' · ') || '未命名行程';
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="pb-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-bold text-gray-800">{displayTitle}</h2>
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

        {renameOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !renaming && setRenameOpen(false)}
          >
            <div
              className="w-full max-w-[360px] bg-white rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-800 mb-3">✏️ 重命名行程</h3>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="输入新的行程名称"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                autoFocus
              />
              {actionError && (
                <p className="mt-2 text-xs text-red-600">{actionError}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setRenameOpen(false)}
                  disabled={renaming}
                  className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-xl active:bg-gray-200 disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  onClick={handleRename}
                  disabled={renaming}
                  className="flex-1 py-2.5 text-sm text-white bg-brand-500 rounded-xl active:opacity-90 disabled:opacity-60"
                >
                  {renaming ? '保存中...' : '确定'}
                </button>
              </div>
            </div>
          </div>
        )}

        {dateOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !replanning && setDateOpen(false)}
          >
            <div
              className="w-full max-w-[400px] bg-white rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">📅 修改日期</h3>
                <button
                  onClick={() => setDateOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">出发日期</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">返程日期</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={newStartDate || today}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {actionError && (
                <p className="mt-3 text-xs text-red-600">{actionError}</p>
              )}

              <button
                onClick={handleReplan}
                disabled={replanning}
                className="w-full mt-4 py-3 bg-brand-500 text-white text-sm font-medium rounded-xl active:opacity-90 disabled:opacity-60"
              >
                {replanning ? '重新规划中...' : '确认重新规划'}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                将根据新日期和原目的地重新生成行程
              </p>
            </div>
          </div>
        )}

        {deleteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !deleting && setDeleteOpen(false)}
          >
            <div
              className="w-full max-w-[320px] bg-white rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-800">🗑 删除行程</h3>
              <p className="text-sm text-gray-500 mt-2">
                确定删除「{displayTitle}」吗？删除后无法恢复。
              </p>
              {actionError && (
                <p className="mt-2 text-xs text-red-600">{actionError}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-xl active:bg-gray-200 disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 text-sm text-white bg-red-500 rounded-xl active:opacity-90 disabled:opacity-60"
                >
                  {deleting ? '删除中...' : '确认'}
                </button>
              </div>
            </div>
          </div>
        )}
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
