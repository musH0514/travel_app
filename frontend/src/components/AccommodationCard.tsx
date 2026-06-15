// ========== 住宿推荐卡片 ==========

import React from 'react';
import type { Accommodation } from '@/utils/types';

interface AccommodationCardProps {
  accommodation: Accommodation;
  onBook?: (accommodation: Accommodation) => void;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  onBook,
}) => {
  // 距离格式化
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // 获取住宿类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case '酒店': return '🏨';
      case '民宿': return '🏡';
      case '青旅': return '🏠';
      default: return '🏨';
    }
  };

  // 渲染星级
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden active:bg-gray-50 transition-colors">
      <div className="flex gap-3 p-3">
        {/* 图片占位 */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-200 to-purple-400 flex-shrink-0 flex items-center justify-center">
          <span className="text-2xl">{getTypeIcon(accommodation.type)}</span>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          {/* 名称和类型 */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                {accommodation.name}
              </h4>
              <span className="text-[10px] text-gray-400">{accommodation.type}</span>
            </div>
            {/* 价格 */}
            <div className="text-right ml-2 flex-shrink-0">
              <p className="text-sm font-bold text-accent-600">¥{accommodation.price}</p>
              <p className="text-[9px] text-gray-400">/晚</p>
            </div>
          </div>

          {/* 评分 */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-500 text-xs">{renderStars(accommodation.rating)}</span>
            <span className="text-[10px] text-gray-400">{accommodation.rating}</span>
          </div>

          {/* 设施和距离 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1 overflow-hidden">
              {accommodation.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[8px] rounded-full border border-gray-100 whitespace-nowrap"
                >
                  {amenity === 'WiFi' ? '📶' :
                   amenity === '停车场' ? '🅿' :
                   amenity === '早餐' ? '🍳' :
                   amenity === '游泳池' ? '🏊' :
                   amenity === '健身房' ? '🏋' :
                   amenity === '空调' ? '❄' : amenity}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              📍 {formatDistance(accommodation.distanceToAttractions)}
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      {onBook && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onBook(accommodation)}
            className="w-full py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-medium rounded-xl active:opacity-90 transition-opacity"
          >
            预订
          </button>
        </div>
      )}
    </div>
  );
};

export default AccommodationCard;
