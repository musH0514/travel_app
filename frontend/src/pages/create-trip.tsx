import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { TRIP_STYLES, BUDGET_LEVELS } from '@/utils/constants';
import type { TripStyle, BudgetLevel } from '@/utils/types';
import { planTrip } from '@/api/ai';
import { ApiError } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

const recentSearches = ['北京', '成都', '云南', '日本', '泰国'];
const hotDestinations = ['三亚', '杭州', '西安', '重庆', '厦门', '青岛', '张家界', '南京'];

const LOADING_HINTS = [
  '正在获取天气预报…',
  'AI 正在根据偏好选点…',
  '正在用地图优化每日空间跨度…',
  '正在生成按天行程…',
];

const CreateTripPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [destSearch, setDestSearch] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TripStyle[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('舒适型');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingHintIdx, setLoadingHintIdx] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!submitting) {
      setLoadingHintIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingHintIdx((i) => (i + 1) % LOADING_HINTS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [submitting]);

  const handleStyleToggle = (style: TripStyle) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else if (selectedStyles.length < 3) {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const city = destSearch.trim();
    if (!city) {
      setError('请先选择或输入目的地城市');
      return;
    }
    if (!startDate || !endDate) {
      setError('请选择出发和返程日期');
      return;
    }
    if (endDate < startDate) {
      setError('返程日期不能早于出发日期');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const styles =
        selectedStyles.length > 0 ? selectedStyles : (['休闲度假'] as TripStyle[]);

      const result = await planTrip({
        city,
        destinations: [city],
        start_date: startDate,
        end_date: endDate,
        styles,
        budget_level: budgetLevel,
        special_requirements: specialRequirements,
      });

      if (!result?.trip_id) {
        setError('规划完成但未返回行程 ID，请稍后在「行程」列表查看');
        return;
      }

      router.push(`/trip-plan?id=${result.trip_id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : '规划失败，请稍后重试（若未配置 API Key，后端应仍返回演示数据）';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        <div className="relative">
          <input
            type="text"
            value={destSearch}
            onChange={(e) => {
              setDestSearch(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="搜索目的地..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {!showSearchResults && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">🕐 历史搜索</h4>
              <div className="flex gap-2 flex-wrap">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDestSearch(item)}
                    className="px-3 py-1.5 bg-gray-50 rounded-full text-xs text-gray-500 border border-gray-100 active:bg-gray-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">🔥 热门推荐</h4>
              <div className="flex gap-2 flex-wrap">
                {hotDestinations.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDestSearch(item)}
                    className="px-3 py-1.5 bg-orange-50 rounded-full text-xs text-orange-600 border border-orange-100 active:bg-orange-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 行程时间
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">出发时间</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">返程时间</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 行程偏好 <span className="text-xs text-gray-400 font-normal">（最多选择3个）</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TRIP_STYLES.map((style) => {
              const isSelected = selectedStyles.includes(style as TripStyle);
              const isDisabled = !isSelected && selectedStyles.length >= 3;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style as TripStyle)}
                  disabled={isDisabled}
                  className={`px-2 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                      : isDisabled
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
                  }`}
                >
                  {style === '网红打卡' ? '📸' :
                   style === '文艺漫步' ? '🎨' :
                   style === '亲子游玩' ? '👨‍👩‍👧' :
                   style === '深度文化' ? '🏛' :
                   style === '休闲度假' ? '🏖' :
                   style === '美食之旅' ? '🍜' :
                   style === '摄影采风' ? '📷' :
                   style === '冒险探索' ? '🧗' : '🎯'}
                  <span className="block mt-0.5">{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💰 预算等级
          </label>
          <div className="flex gap-2">
            {BUDGET_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setBudgetLevel(level as BudgetLevel)}
                className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                  budgetLevel === level
                    ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                    : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
                }`}
              >
                {level === '经济型' ? '💰' :
                 level === '舒适型' ? '💵' :
                 level === '轻奢型' ? '💎' :
                 level === '豪华型' ? '👑' : '💰'}
                <span className="block mt-0.5">{level}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            📝 特殊需求（选填）
          </label>
          <textarea
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            placeholder="例如：带老人出行、需要无障碍设施、不想爬山等"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {submitting && (
          <p className="text-center text-xs text-brand-600 animate-pulse">
            {LOADING_HINTS[loadingHintIdx]}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-base font-semibold rounded-xl active:opacity-90 transition-opacity shadow-soft disabled:opacity-60"
        >
          {submitting ? '规划中...' : '🚀 开始规划'}
        </button>
      </div>
    </div>
  );
};

export default CreateTripPage;
