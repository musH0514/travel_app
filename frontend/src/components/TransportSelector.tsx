// ========== 交通方式选择器 ==========
// 展示不同交通方式的耗时和费用对比

import React, { useState } from 'react';
import { TRANSPORT_MODES } from '@/utils/constants';
import type { TransportOption, TransportMode } from '@/utils/types';

interface TransportSelectorProps {
  options: TransportOption[];
  onSelect?: (option: TransportOption) => void;
  defaultSelected?: string;
  showComparison?: boolean; // 是否展示对比
}

const TransportSelector: React.FC<TransportSelectorProps> = ({
  options = [],
  onSelect,
  defaultSelected,
  showComparison = true,
}) => {
  const [selectedMode, setSelectedMode] = useState<string>(defaultSelected || '');
  const [isDomestic, setIsDomestic] = useState(true);

  // 获取交通方式图标
  const getModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      '自驾': '🚗',
      '公交': '🚌',
      '步行': '🚶',
      '打车': '🚕',
      '地铁': '🚇',
    };
    return icons[mode] || '🚶';
  };

  // 获取最快的选项
  const getFastestOption = () => {
    if (options.length === 0) return null;
    return options.reduce((fastest, opt) =>
      opt.duration < fastest.duration ? opt : fastest
    );
  };

  // 获取最便宜的选项
  const getCheapestOption = () => {
    if (options.length === 0) return null;
    return options.reduce((cheapest, opt) =>
      opt.cost < cheapest.cost ? opt : cheapest
    );
  };

  // 选择交通方式
  const handleSelect = (option: TransportOption) => {
    setSelectedMode(option.mode);
    onSelect?.(option);
  };

  const fastest = getFastestOption();
  const cheapest = getCheapestOption();

  // 如果没提供 options，从所有交通方式生成模拟数据
  const displayOptions = options.length > 0
    ? options
    : TRANSPORT_MODES.map((mode, index) => ({
        mode: mode as TransportMode,
        duration: [15, 30, 5, 10, 20][index],
        cost: [20, 2, 0, 15, 3][index],
        route: `${mode}路线示意`,
      }));

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* 头部 */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">🚗 交通方式</h3>
        {/* 国内外切换 */}
        <div className="flex bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setIsDomestic(true)}
            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
              isDomestic ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
            }`}
          >
            国内
          </button>
          <button
            onClick={() => setIsDomestic(false)}
            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
              !isDomestic ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
            }`}
          >
            海外
          </button>
        </div>
      </div>

      {/* 推荐标签 */}
      {showComparison && fastest && cheapest && (
        <div className="px-4 pb-3 flex gap-2">
          <span className="px-2 py-1 bg-green-50 text-green-600 text-[9px] rounded-full font-medium">
            ⚡ 最快: {fastest.mode} ({fastest.duration}分钟)
          </span>
          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] rounded-full font-medium">
            💰 最省: {cheapest.mode} (¥{cheapest.cost})
          </span>
        </div>
      )}

      {/* 选项列表 */}
      <div className="px-4 pb-4 space-y-2">
        {displayOptions.map((option) => {
          const isSelected = selectedMode === option.mode;
          const isFastest = fastest?.mode === option.mode;
          const isCheapest = cheapest?.mode === option.mode;

          return (
            <button
              key={option.mode}
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-brand-50 border-brand-300 shadow-soft'
                  : 'bg-white border-gray-100 active:bg-gray-50'
              }`}
            >
              {/* 图标 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                isSelected ? 'bg-brand-500' : 'bg-gray-50'
              }`}>
                {getModeIcon(option.mode)}
              </div>

              {/* 信息 */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-brand-700' : 'text-gray-800'
                  }`}>
                    {option.mode}
                  </span>
                  {isFastest && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-[8px] rounded-full font-medium">
                      最快
                    </span>
                  )}
                  {isCheapest && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] rounded-full font-medium">
                      最省
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{option.route}</p>
              </div>

              {/* 时间和费用 */}
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{option.duration}分钟</p>
                <p className="text-[10px] text-gray-400">¥{option.cost}</p>
              </div>

              {/* 选中标记 */}
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TransportSelector;
