// ========== 地图组件 ==========
// 支持目的地标记、路线规划、信息弹窗

import React, { useState, useCallback } from 'react';
import { PLACEHOLDER_AMAP_KEY } from '@/utils/constants';
import type { Destination, GeoLocation } from '@/utils/types';

interface MapViewProps {
  destinations?: Destination[]; // 目的地标记
  center?: GeoLocation; // 地图中心点
  zoom?: number; // 缩放级别
  routes?: { from: GeoLocation; to: GeoLocation }[]; // 路线
  onMarkerClick?: (destination: Destination) => void; // 标记点击回调
  height?: string; // 地图高度
  fullScreen?: boolean; // 是否全屏
  onToggleFullScreen?: () => void; // 全屏切换回调
}

const MapView: React.FC<MapViewProps> = ({
  destinations = [],
  center = { lat: 39.9042, lng: 116.4074 }, // 默认北京
  zoom = 12,
  routes = [],
  onMarkerClick,
  height = '300px',
  fullScreen = false,
  onToggleFullScreen,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasApiKey = PLACEHOLDER_AMAP_KEY !== 'YOUR_AMAP_KEY_HERE';

  // 模拟地图加载
  React.useEffect(() => {
    if (hasApiKey) {
      // 实际项目中这里会加载地图 SDK
      const timer = setTimeout(() => setMapLoaded(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasApiKey]);

  // 标记点击处理
  const handleMarkerClick = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
    onMarkerClick?.(destination);
  }, [onMarkerClick]);

  // 关闭信息窗口
  const handleCloseInfoWindow = useCallback(() => {
    setSelectedDestination(null);
  }, []);

  return (
    <div
      className={`relative bg-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${
        fullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: fullScreen ? '100vh' : height }}
    >
      {/* 无 API Key 时的占位提示 */}
      {!hasApiKey ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-blue-50 p-6">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-gray-600 text-center text-sm font-medium">
            地图组件 - 请配置 API Key
          </p>
          <p className="text-gray-400 text-center text-xs mt-2">
            在 Profile 页面设置高德地图 Key
          </p>
        </div>
      ) : !mapLoaded ? (
        // 加载中状态
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">地图加载中...</p>
          </div>
        </div>
      ) : (
        // 地图渲染区域
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
          {/* 模拟地图网格 */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* 目的地标记 */}
          {destinations.map((dest, index) => (
            <button
              key={dest.id}
              onClick={() => handleMarkerClick(dest)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${((dest.location.lng - (center.lng - 0.5)) / 1) * 100}%`,
                top: `${((center.lat + 0.3 - dest.location.lat) / 0.6) * 100}%`,
              }}
            >
              <div className="relative">
                {/* 标记点 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg transition-transform hover:scale-110 ${
                  index === 0 ? 'bg-accent-500' : 'bg-brand-500'
                } text-white`}>
                  {index + 1}
                </div>
                {/* 标记阴影 */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/10 rounded-full blur-sm" />
              </div>
              {/* 标记名称 */}
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs bg-white/90 px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {dest.name}
              </span>
            </button>
          ))}

          {/* 路线绘制 */}
          {routes.map((route, index) => (
            <div
              key={index}
              className="absolute h-0.5 bg-brand-400/60"
              style={{
                left: `${((route.from.lng - (center.lng - 0.5)) / 1) * 100}%`,
                top: `${((center.lat + 0.3 - route.from.lat) / 0.6) * 100}%`,
                width: `${Math.abs(route.to.lng - route.from.lng) / 1 * 100}%`,
                height: `${Math.abs(route.to.lat - route.from.lat) / 0.6 * 100}%`,
                transform: 'rotate(0deg)',
                background: 'repeating-linear-gradient(90deg, #0D9488 0px, #0D9488 8px, transparent 8px, transparent 12px)',
              }}
            />
          ))}
        </div>
      )}

      {/* 信息窗口弹出框 */}
      {selectedDestination && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-heavy p-4 animate-slide-up z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">{selectedDestination.name}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{selectedDestination.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-sm">★ {selectedDestination.rating}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 text-xs">¥{selectedDestination.price}</span>
              </div>
            </div>
            <button
              onClick={handleCloseInfoWindow}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 全屏切换按钮 */}
      {onToggleFullScreen && (
        <button
          onClick={onToggleFullScreen}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {fullScreen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            )}
          </svg>
        </button>
      )}

      {/* 定位按钮 */}
      <button className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft active:scale-95 transition-transform">
        <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

export default MapView;
