// ========== 天气卡片组件 ==========
// 展示当前天气、7天预报和天气预警

import React, { useState } from 'react';
import type { WeatherForecast, WeatherAlert } from '@/utils/types';

interface WeatherCardProps {
  forecast: WeatherForecast[]; // 天气预报数组
  alerts?: WeatherAlert[]; // 天气预警
  onViewComparison?: () => void; // 查看多云版 vs 下雨版对比
  compact?: boolean; // 紧凑模式
}

// 天气条件映射
const weatherConfig: Record<string, { icon: string; label: string }> = {
  sunny: { icon: '☀️', label: '晴' },
  cloudy: { icon: '⛅', label: '多云' },
  overcast: { icon: '☁️', label: '阴' },
  light_rain: { icon: '🌦', label: '小雨' },
  moderate_rain: { icon: '🌧', label: '中雨' },
  heavy_rain: { icon: '🌧', label: '大雨' },
  thunderstorm: { icon: '⛈', label: '雷雨' },
  snowy: { icon: '🌨', label: '雪' },
  foggy: { icon: '🌫', label: '雾' },
};

// 预警严重等级颜色映射
const alertColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: '红色预警' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: '橙色预警' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: '黄色预警' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: '蓝色预警' },
};

const WeatherCard: React.FC<WeatherCardProps> = ({
  forecast = [],
  alerts = [],
  onViewComparison,
  compact = false,
}) => {
  const [showAlerts, setShowAlerts] = useState(false);

  // 当前天气（取第一条预报）
  const currentWeather = forecast[0];
  // 未来预报
  const futureForecast = forecast.slice(1);

  // 获取天气配置
  const getWeatherConfig = (condition: string) => {
    return weatherConfig[condition] || { icon: '❓', label: condition };
  };

  // 渲染预警徽章
  const renderAlertBadge = (alert: WeatherAlert) => {
    const colors = alertColors[alert.severity] || alertColors.yellow;
    return (
      <div
        key={`${alert.type}-${alert.date}`}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} text-xs`}
      >
        <span className="font-bold">{colors.label}</span>
        <span>{alert.type}</span>
        <span className="flex-1 truncate">{alert.message}</span>
      </div>
    );
  };

  if (compact) {
    // 紧凑模式 - 只显示今日天气摘要
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl">
        <span className="text-3xl">
          {currentWeather ? getWeatherConfig(currentWeather.condition).icon : '☀️'}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-800">
              {currentWeather?.temp || '--'}°
            </span>
            <span className="text-xs text-gray-500">
              {currentWeather ? getWeatherConfig(currentWeather.condition).label : '未知'}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {currentWeather
              ? `${currentWeather.low}° / ${currentWeather.high}° · 湿度 ${currentWeather.humidity}%`
              : '暂无天气数据'}
          </div>
        </div>
        {alerts.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* 当前天气 */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">当前天气</p>
            <p className="text-4xl font-bold mt-1">
              {currentWeather?.temp ?? '--'}°
            </p>
            <p className="text-sm mt-1 opacity-90">
              {currentWeather ? getWeatherConfig(currentWeather.condition).label : '暂无数据'}
            </p>
            {currentWeather && (
              <p className="text-xs opacity-70 mt-1">
                H:{currentWeather.high}° L:{currentWeather.low}°
              </p>
            )}
          </div>
          <span className="text-6xl">
            {currentWeather ? getWeatherConfig(currentWeather.condition).icon : '☀️'}
          </span>
        </div>
        {currentWeather && (
          <div className="flex items-center gap-4 mt-3 text-xs opacity-80">
            <span>💧 湿度 {currentWeather.humidity}%</span>
            <span>💨 风速 {currentWeather.windSpeed}km/h</span>
          </div>
        )}
      </div>

      {/* 7天预报横向滚动 */}
      {futureForecast.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {futureForecast.map((day, index) => {
              const config = getWeatherConfig(day.condition);
              const date = new Date(day.date);
              const dayName = index === 0 ? '明天' : date.toLocaleDateString('zh-CN', { weekday: 'short' });
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1.5 min-w-[56px]"
                >
                  <span className="text-xs text-gray-500">{dayName}</span>
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-gray-800">{day.high}°</span>
                    <span className="text-gray-400">{day.low}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 天气预警 */}
      {alerts.length > 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex items-center gap-1.5 text-sm text-red-600 font-medium mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            共 {alerts.length} 条天气预警
            <svg className={`w-4 h-4 transition-transform ${showAlerts ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAlerts && (
            <div className="space-y-2">
              {alerts.map(renderAlertBadge)}
            </div>
          )}
        </div>
      )}

      {/* 版本对比按钮 */}
      {onViewComparison && (
        <div className="px-4 pb-4">
          <button
            onClick={onViewComparison}
            className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-medium rounded-xl active:opacity-90 transition-opacity"
          >
            🔄 查看多云版 vs 下雨版对比
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
