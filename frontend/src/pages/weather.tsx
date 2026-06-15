// ========== 天气页面 ==========
// 天气预报、预警、对行程影响分析

import React, { useState } from 'react';
import WeatherCard from '@/components/WeatherCard';
import MapView from '@/components/MapView';
import type { WeatherForecast, WeatherAlert } from '@/utils/types';

// 模拟天气数据
const mockForecast: WeatherForecast[] = [
  { date: '2026-06-15', condition: 'sunny', temp: 32, high: 35, low: 25, humidity: 45, windSpeed: 12, icon: 'sunny' },
  { date: '2026-06-16', condition: 'cloudy', temp: 30, high: 33, low: 24, humidity: 55, windSpeed: 10, icon: 'cloudy' },
  { date: '2026-06-17', condition: 'light_rain', temp: 28, high: 30, low: 22, humidity: 75, windSpeed: 15, icon: 'light_rain' },
  { date: '2026-06-18', condition: 'moderate_rain', temp: 25, high: 27, low: 20, humidity: 85, windSpeed: 20, icon: 'moderate_rain' },
  { date: '2026-06-19', condition: 'sunny', temp: 31, high: 34, low: 23, humidity: 40, windSpeed: 8, icon: 'sunny' },
  { date: '2026-06-20', condition: 'cloudy', temp: 29, high: 32, low: 22, humidity: 50, windSpeed: 10, icon: 'cloudy' },
  { date: '2026-06-21', condition: 'sunny', temp: 33, high: 36, low: 26, humidity: 35, windSpeed: 11, icon: 'sunny' },
];

const mockAlerts: WeatherAlert[] = [
  { type: '高温', severity: 'orange', message: '预计未来三天将持续高温天气，请注意防暑降温', date: '2026-06-15' },
  { type: '暴雨', severity: 'yellow', message: '6月18日前后将有暴雨天气，请注意出行安全', date: '2026-06-17' },
];

// 行程影响分析
const tripImpact = [
  { date: '6月15日', condition: '晴朗 ☀️', impact: '适合户外活动，注意防晒', suggestion: '推荐：故宫、长城等户外景点', score: 95 },
  { date: '6月16日', condition: '多云 ⛅', impact: '天气舒适，适合观光', suggestion: '推荐：颐和园、天坛', score: 90 },
  { date: '6月17日', condition: '小雨 🌦', impact: '有小雨，建议备伞', suggestion: '推荐：国家博物馆、商场', score: 70 },
  { date: '6月18日', condition: '中雨 🌧', impact: '中雨天气，建议室内活动', suggestion: '推荐：室内景点、美食探店', score: 45 },
];

const WeatherPage: React.FC = () => {
  const [location] = useState('北京');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="pb-4">
      {/* 搜索/定位 */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索城市..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            自动定位
          </div>
        </div>
      </div>

      {/* 当前城市名称 */}
      <div className="px-4 py-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">{location}</h2>
          <button className="px-3 py-1 bg-gray-50 rounded-full text-[10px] text-gray-500 border border-gray-100">
            切换城市
          </button>
        </div>
      </div>

      {/* 天气卡片（含预警） */}
      <div className="px-4 mt-2">
        <WeatherCard
          forecast={mockForecast}
          alerts={mockAlerts}
        />
      </div>

      {/* 对行程的影响 */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 对行程的影响</h3>
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {tripImpact.map((day, index) => (
            <div
              key={day.date}
              className={`flex items-center gap-3 p-3.5 ${
                index < tripImpact.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              {/* 日期 */}
              <div className="w-16 flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">{day.date}</span>
              </div>

              {/* 天气条件 */}
              <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                <span className="text-sm">{day.condition.split(' ')[1] || '☀️'}</span>
                <span className="text-[10px] text-gray-500">{day.condition.split(' ')[0]}</span>
              </div>

              {/* 影响和建议 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">{day.impact}</p>
                <p className="text-[10px] text-brand-600 mt-0.5">{day.suggestion}</p>
              </div>

              {/* 出行评分 */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      day.score >= 80 ? 'bg-green-500' :
                      day.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${day.score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  day.score >= 80 ? 'text-green-600' :
                  day.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {day.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 恶劣天气备选方案按钮 */}
      {mockAlerts.length > 0 && (
        <div className="px-4 mt-5">
          <button
            onClick={() => setShowComparison(true)}
            className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold rounded-xl active:opacity-90 transition-opacity shadow-soft"
          >
            🆘 恶劣天气备选方案
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            基于天气预报生成室内替代方案
          </p>
        </div>
      )}

      {/* 天气地图 */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">🗺 天气地图</h3>
        <MapView height="200px" />
      </div>

      {/* 版本对比弹出 */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowComparison(false)}>
          <div
            className="w-full max-w-[480px] bg-white rounded-t-3xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">🔄 多云版 vs 下雨版</h3>
              <button
                onClick={() => setShowComparison(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 多云版 */}
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700 mb-2">☀️ 多云版方案</p>
                <ul className="space-y-1.5">
                  <li className="text-[11px] text-gray-600">• 故宫博物院（户外）</li>
                  <li className="text-[11px] text-gray-600">• 八达岭长城</li>
                  <li className="text-[11px] text-gray-600">• 颐和园游湖</li>
                </ul>
              </div>

              {/* 下雨版 */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-2">🌧 下雨版方案</p>
                <ul className="space-y-1.5">
                  <li className="text-[11px] text-gray-600">• 国家博物馆（室内）</li>
                  <li className="text-[11px] text-gray-600">• 商场购物</li>
                  <li className="text-[11px] text-gray-600">• 美食探店</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowComparison(false)}
              className="w-full mt-4 py-3 bg-brand-500 text-white text-sm font-medium rounded-xl"
            >
              应用到行程
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
