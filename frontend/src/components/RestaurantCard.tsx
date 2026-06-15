// ========== 餐厅推荐卡片 ==========

import React from 'react';
import type { Restaurant } from '@/utils/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToItinerary?: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onAddToItinerary,
}) => {
  // 价格等级显示
  const renderPriceRange = (range: number) => {
    return '¥'.repeat(range) + ' '.repeat(5 - range);
  };

  // 距离格式化
  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 active:bg-gray-50 transition-colors">
      {/* 图片占位 */}
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 flex-shrink-0 flex items-center justify-center">
        <span className="text-2xl">🍽</span>
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        {/* 名称和评级 */}
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
            {restaurant.name}
          </h4>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs text-gray-500">{restaurant.rating}</span>
          </div>
        </div>

        {/* 菜系和价格 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
            {restaurant.cuisine}
          </span>
          <span className="text-[10px] text-gray-400">{renderPriceRange(restaurant.priceRange)}</span>
          {restaurant.isAlongRoute && (
            <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full font-medium">
              顺路
            </span>
          )}
        </div>

        {/* 距离和操作 */}
        <div className="flex items-center justify-between mt-2">
          {restaurant.distance ? (
            <span className="text-[10px] text-gray-400">
              📍 {formatDistance(restaurant.distance)}
            </span>
          ) : (
            <span />
          )}
          {onAddToItinerary && (
            <button
              onClick={() => onAddToItinerary(restaurant)}
              className="px-3 py-1 bg-brand-500 text-white text-[10px] font-medium rounded-full active:bg-brand-600 transition-colors"
            >
              + 加入行程
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
