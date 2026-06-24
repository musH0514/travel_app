import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import DestinationCard from '@/components/DestinationCard';
import MapView from '@/components/MapView';
import type { Destination } from '@/utils/types';
import { DESTINATION_CATEGORIES, TRIP_STYLES, BUDGET_LEVELS } from '@/utils/constants';
import { getDestinations, searchDestinations } from '@/api/destinations';
import { adaptDestination } from '@/utils/apiAdapters';

const DestinationsPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    style: '',
    budget: '',
    duration: '',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          const data = await searchDestinations(searchQuery.trim());
          setDestinations((data as unknown as Record<string, unknown>[]).map(adaptDestination));
        } else {
          const params: Record<string, string | number | undefined> = {};
          if (activeCategory !== 'all') {
            const catMap: Record<string, string> = {
              'natural': '自然风光',
              'culture': '人文历史',
              'food': '美食购物',
              'shopping': '美食购物',
            };
            params.category = catMap[activeCategory];
          }
          const data = await getDestinations(params);
          const list = (data as unknown as Record<string, unknown>).data as Array<Record<string, unknown>> || data as unknown as Array<Record<string, unknown>>;
          setDestinations((Array.isArray(list) ? list : []).map(adaptDestination));
        }
      } catch {
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, activeCategory]);

  const filteredDestinations = useCallback(() => {
    let result = [...destinations];

    if (filters.budget) {
      const maxPrice: Record<string, number> = { '经济型': 100, '舒适型': 300, '轻奢型': 800, '豪华型': 99999 };
      result = result.filter((d) => d.price <= (maxPrice[filters.budget] || 99999));
    }

    return result;
  }, [destinations, filters]);

  const displayDestinations = filteredDestinations();

  const clearFilters = () => {
    setFilters({ style: '', budget: '', duration: '' });
  };

  const hasActiveFilters = filters.style || filters.budget || filters.duration;

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索目的地..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              hasActiveFilters
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {hasActiveFilters ? `筛选 (${Object.values(filters).filter(Boolean).length})` : '筛选'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mx-4 mb-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-medium animate-slide-down">
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">出行风格</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setFilters((f) => ({ ...f, style: f.style === style ? '' : style }))}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    filters.style === style
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">预算等级</p>
            <div className="flex gap-2">
              {BUDGET_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFilters((f) => ({ ...f, budget: f.budget === level ? '' : level }))}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-full border transition-all ${
                    filters.budget === level
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 py-2 text-xs text-gray-500 bg-gray-50 rounded-xl active:bg-gray-100"
            >
              重置
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-2 text-xs text-white bg-brand-500 rounded-xl active:bg-brand-600"
            >
              完成
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {DESTINATION_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-gray-50 text-gray-500 active:bg-gray-100'
              }`}
            >
              {cat.key === 'all' ? '🏠' :
               cat.key === 'natural' ? '🌿' :
               cat.key === 'culture' ? '🏛' :
               cat.key === 'food' ? '🍜' :
               cat.key === 'shopping' ? '🛍' : ''} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {loading ? '搜索中...' : `找到 ${displayDestinations.length} 个目的地`}
        </p>
        <div className="flex bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
              viewMode === 'list' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
            }`}
          >
            📋 列表
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
              viewMode === 'map' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
            }`}
          >
            🗺 地图
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">加载中...</div>
          ) : displayDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm">没有找到匹配的目的地</p>
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 text-xs text-brand-600 bg-brand-50 rounded-xl"
              >
                清除筛选条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayDestinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onAddTrip={() => router.push('/trip-plan')}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4">
          <MapView
            destinations={displayDestinations}
            height="calc(100vh - 320px)"
          />
        </div>
      )}
    </div>
  );
};

export default DestinationsPage;
