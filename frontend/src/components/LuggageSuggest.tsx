// ========== 行李建议组件 ==========
// 按类别展示行李清单，标记天气相关物品

import React, { useState } from 'react';
import type { LuggageSuggestion, LuggageCategory } from '@/utils/types';
import { LUGGAGE_CATEGORIES } from '@/utils/constants';

interface LuggageSuggestProps {
  suggestions: LuggageSuggestion[];
}

const LuggageSuggest: React.FC<LuggageSuggestProps> = ({ suggestions }) => {
  const [activeCategory, setActiveCategory] = useState<LuggageCategory>('证件');

  // 获取当前分类的物品
  const currentCategory = suggestions.find((s) => s.category === activeCategory);
  const items = currentCategory?.items || [];

  // 统计总数
  const totalItems = suggestions.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* 头部 */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">🧳 行李清单</h3>
          <span className="text-xs text-gray-400">共 {totalItems} 件物品</span>
        </div>
      </div>

      {/* 分类标签页 */}
      <div className="px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-3 border-b border-gray-50">
          {LUGGAGE_CATEGORIES.map((cat) => {
            const catData = suggestions.find((s) => s.category === cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                {cat === '证件' ? '🪪' :
                 cat === '衣物' ? '👕' :
                 cat === '电子' ? '📱' :
                 cat === '药品' ? '💊' :
                 cat === '其他' ? '📦' : '📦'} {cat}
                {catData && (
                  <span className={`ml-1 ${isActive ? 'text-white/70' : 'text-gray-300'}`}>
                    ({catData.items.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 物品列表 */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <span className="text-2xl mb-2">✅</span>
            <p className="text-xs">该分类暂无建议</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  item.weatherRelated
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                {/* 复选框 */}
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex-shrink-0" />

                {/* 物品信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    {item.weatherRelated && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] rounded-full font-medium whitespace-nowrap">
                        天气相关
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuggageSuggest;
