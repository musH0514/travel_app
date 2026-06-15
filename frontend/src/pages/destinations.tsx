// ========== 目的地页面 ==========
// 搜索、分类筛选、列表/地图切换

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DestinationCard from '@/components/DestinationCard';
import MapView from '@/components/MapView';
import type { Destination } from '@/utils/types';
import { DESTINATION_CATEGORIES, TRIP_STYLES, BUDGET_LEVELS } from '@/utils/constants';

// 模拟目的地数据
const mockDestinations: Destination[] = [
  { id: 'd1', name: '故宫博物院', description: '中国古代皇家宫殿建筑，世界文化遗产，感受六百年的历史沉淀', location: { lat: 39.9163, lng: 116.3972 }, images: [], category: 'culture', rating: 4.9, price: 60, tags: ['历史', '建筑', '文化'], duration: 4 },
  { id: 'd2', name: '西湖', description: '杭州西湖，人间天堂，断桥残雪、雷峰夕照等十景闻名天下', location: { lat: 30.2592, lng: 120.1528 }, images: [], category: 'natural', rating: 4.8, price: 0, tags: ['自然', '湖泊', '摄影'], duration: 3 },
  { id: 'd3', name: '锦里古街', description: '成都最具特色的仿古商业街，汇集四川美食和手工艺品', location: { lat: 30.6488, lng: 104.0474 }, images: [], category: 'food', rating: 4.5, price: 100, tags: ['美食', '古镇', '小吃'], duration: 2 },
  { id: 'd4', name: '三里屯', description: '北京时尚潮流地标，购物、餐饮、娱乐一体化的商业区', location: { lat: 39.9333, lng: 116.4553 }, images: [], category: 'shopping', rating: 4.3, price: 500, tags: ['购物', '时尚', '美食'], duration: 3 },
  { id: 'd5', name: '八达岭长城', description: '万里长城的精华段，世界新七大奇迹之一', location: { lat: 40.3591, lng: 116.0164 }, images: [], category: 'natural', rating: 4.7, price: 40, tags: ['历史', '爬山', '摄影'], duration: 5 },
  { id: 'd6', name: '南锣鼓巷', description: '北京最古老的街区之一，老北京胡同文化的代表', location: { lat: 39.9402, lng: 116.4039 }, images: [], category: 'culture', rating: 4.4, price: 0, tags: ['胡同', '文艺', '小吃'], duration: 2 },
];

const DestinationsPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    style: '',
    budget: '',
    duration: '',
  });

  // 过滤目的地
  const filteredDestinations = useCallback(() => {
    let result = [...mockDestinations];

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // 分类过滤
    if (activeCategory !== 'all') {
      result = result.filter((d) => d.category === activeCategory);
    }

    // 风格过滤
    if (filters.style) {
      result = result.filter((d) => d.tags.includes(filters.style));
    }

    // 预算过滤
    if (filters.budget) {
      const maxPrice: Record<string, number> = { '经济型': 100, '舒适型': 300, '轻奢型': 800, '豪华型': 99999 };
      result = result.filter((d) => d.price <= (maxPrice[filters.budget] || 99999));
    }

    return result;
  }, [searchQuery, activeCategory, filters]);

  const displayDestinations = filteredDestinations();

  // 重置筛选条件
  const clearFilters = () => {
    setFilters({ style: '', budget: '', duration: '' });
  };

  // 是否有激活的筛选
  const hasActiveFilters = filters.style || filters.budget || filters.duration;

  return (
    <div className="pb-4">
      {/* 搜索栏 */}
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
          {/* 筛选按钮 */}
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

      {/* 筛选面板 - 底部弹出 */}
      {showFilters && (
        <div className="mx-4 mb-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-medium animate-slide-down">
          {/* 出行风格 */}
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

          {/* 预算等级 */}
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

          {/* 操作按钮 */}
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

      {/* 分类标签 */}
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

      {/* 列表/地图切换 */}
      <div className="px-4 flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          找到 {displayDestinations.length} 个目的地
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

      {/* 内容区域 */}
      {viewMode === 'list' ? (
        // 列表视图 - 2列网格
        <div className="px-4">
          {displayDestinations.length === 0 ? (
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
        // 地图视图
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
