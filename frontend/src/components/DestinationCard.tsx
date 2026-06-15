// ========== 目的地卡片组件 ==========
// 展示目的地信息，支持添加到行程

import React from 'react';
import type { Destination } from '@/utils/types';

interface DestinationCardProps {
  destination: Destination;
  onAddTrip?: (destination: Destination) => void;
  onPress?: (destination: Destination) => void;
  style?: React.CSSProperties;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onAddTrip,
  onPress,
  style,
}) => {
  // 渲染星级评分
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <span className="text-xs">
        {'★'.repeat(fullStars)}
        {hasHalf ? '½' : ''}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  const handlePress = () => {
    onPress?.(destination);
  };

  const handleAddTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTrip?.(destination);
  };

  return (
    <div
      onClick={handlePress}
      className="bg-white rounded-2xl shadow-soft overflow-hidden active:scale-[0.97] transition-transform cursor-pointer"
      style={style}
    >
      {/* 图片占位 - 渐变色 */}
      <div className="relative h-28 bg-gradient-to-br from-brand-300 to-brand-500">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>
        {/* 价格标签 */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-accent-600">
          ¥{destination.price}
        </div>
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* 内容 */}
      <div className="p-3">
        {/* 名称和评分 */}
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1">
            {destination.name}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-yellow-500">{renderStars(destination.rating)}</span>
            <span className="text-[10px] text-gray-400">{destination.rating}</span>
          </div>
        </div>

        {/* 分类标签 */}
        <p className="text-[10px] text-gray-400 mt-1">{destination.category}</p>

        {/* 描述 */}
        <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        {/* 标签和添加按钮 */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex gap-1 flex-1 overflow-hidden">
            {destination.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[9px] rounded-full border border-gray-100 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
            {destination.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[9px] text-gray-300">
                +{destination.tags.length - 3}
              </span>
            )}
          </div>
          {onAddTrip && (
            <button
              onClick={handleAddTrip}
              className="px-3 py-1.5 bg-brand-500 text-white text-[10px] font-medium rounded-full active:bg-brand-600 transition-colors whitespace-nowrap ml-2"
            >
              + 添加到行程
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
