// ========== 行程详情视图 ==========
// 以时间线形式展示每日行程，支持拖拽排序和版本切换

import React, { useState } from 'react';
import type { Itinerary, ItineraryDay, WeatherForecast } from '@/utils/types';

interface ItineraryViewProps {
  itinerary: Itinerary;
  weatherForecasts?: WeatherForecast[];
}

// 时间段的图标映射
const timeSlotIcons: Record<string, string> = {
  '上午': '🌅',
  '下午': '☀️',
  '晚上': '🌙',
};

// 时间段颜色映射
const timeSlotColors: Record<string, string> = {
  '上午': 'bg-accent-50 border-accent-200',
  '下午': 'bg-blue-50 border-blue-200',
  '晚上': 'bg-purple-50 border-purple-200',
};

const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  weatherForecasts = [],
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  // 获取某天的天气预报
  const getWeatherForDay = (date: string): WeatherForecast | undefined => {
    return weatherForecasts.find((wf) => wf.date === date);
  };

  // 展开/折叠某天
  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  // 获取交通方式图标
  const getTransportIcon = (mode: string) => {
    const icons: Record<string, string> = {
      '自驾': '🚗',
      '公交': '🚌',
      '步行': '🚶',
      '打车': '🚕',
      '地铁': '🚇',
    };
    return icons[mode] || '🚶';
  };

  // 渲染日程项目
  const renderItineraryItem = (item: ItineraryDay['items'][number], index: number) => {
    return (
      <div
        key={`${item.day}-${item.timeSlot}-${index}`}
        className="flex gap-3 pb-4 last:pb-0 group"
      >
        {/* 时间线 */}
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full border-2 ${timeSlotColors[item.timeSlot]?.split(' ')[0].replace('bg-', 'border-') || 'border-gray-300'} bg-white z-10`} />
          {index < itinerary.days[item.day - 1]?.items.length - 1 && (
            <div className="flex-1 w-0.5 bg-gray-200 mt-1" />
          )}
        </div>

        {/* 内容卡片 */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 shadow-soft">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">
                {timeSlotIcons[item.timeSlot]} {item.timeSlot}
              </span>
              <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] rounded-full font-medium">
                ¥{item.estimatedCost}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-800">{item.activity}</p>
          <p className="text-xs text-gray-500 mt-1">{item.destination.name}</p>
          {item.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">📝 {item.notes}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{getTransportIcon(item.transport.mode)} {item.transport.mode}</span>
            <span>⏱ {item.transport.duration}分钟</span>
            <span>💰 ¥{item.transport.cost}</span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染每日行程
  const renderDay = (day: ItineraryDay) => {
    const isExpanded = expandedDay === day.dayNumber;
    const weather = day.weather || getWeatherForDay(day.date);

    return (
      <div
        key={day.dayNumber}
        className={`rounded-2xl border transition-all duration-300 ${
          day.isBadWeather
            ? 'border-red-200 bg-red-50/30'
            : 'border-gray-100 bg-white'
        } ${isExpanded ? 'shadow-medium' : 'shadow-soft'}`}
      >
        {/* 日期头部 - 展开时固定 */}
        <div className="sticky top-12 z-10">
          <button
            onClick={() => toggleDay(day.dayNumber)}
            className={`w-full p-4 flex items-center gap-3 active:bg-gray-50/50 ${
              isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'
            } ${day.isBadWeather ? 'bg-red-50/30' : 'bg-white'}`}
          >
          {/* 日期信息 */}
          <div className="flex flex-col items-center min-w-[44px]">
            <span className="text-sm font-bold text-brand-700">Day {day.dayNumber}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </span>
          </div>

          {/* 天气状况 */}
          {weather && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">
                {weather.condition === 'sunny' ? '☀️' :
                 weather.condition === 'cloudy' ? '⛅' :
                 weather.condition === 'light_rain' ? '🌦' :
                 weather.condition === 'heavy_rain' ? '🌧' : '☀️'}
              </span>
              <span className="text-xs text-gray-500">{weather.temp}°</span>
            </div>
          )}

          {/* 行程摘要 */}
          <div className="flex-1 text-left">
            <p className="text-xs text-gray-500">{day.items.length} 个活动</p>
          </div>

          {/* 恶劣天气标识 */}
          {day.isBadWeather && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded-full font-medium">
              ⚠️ 恶劣天气
            </span>
          )}

          {/* 展开/折叠箭头 */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        </div>

        {/* 展开的日程详情 */}
        {isExpanded && (
          <div className="px-4 pb-4 animate-slide-down">
            {/* 全天花费摘要 */}
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-3">
              <span className="text-xs text-gray-500">本日花费</span>
              <span className="text-sm font-semibold text-gray-800">
                ¥{day.items.reduce((sum, item) => sum + item.estimatedCost + item.transport.cost, 0)}
              </span>
              {weather && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">💧 {weather.humidity}%</span>
                  <span className="text-xs text-gray-500">💨 {weather.windSpeed}km/h</span>
                </>
              )}
            </div>

            {/* 活动列表 */}
            <div className="pl-2">
              {day.items.map((item, index) => renderItineraryItem(item, index))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* 每日行程列表 */}
      {itinerary.days.map(renderDay)}

      {/* 空状态 */}
      {itinerary.days.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <span className="text-4xl mb-3">🗓</span>
          <p className="text-sm">暂无行程安排</p>
          <p className="text-xs mt-1">点击「生成方案」开始规划</p>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
