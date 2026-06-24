import React, { useState, useEffect } from 'react';
import WeatherCard from '@/components/WeatherCard';
import MapView from '@/components/MapView';
import { getWeatherForecast, getWeatherAlert } from '@/api/weather';
import { adaptWeatherForecast, adaptWeatherAlert } from '@/utils/apiAdapters';
import type { WeatherForecast, WeatherAlert } from '@/utils/types';

const WeatherPage: React.FC = () => {
  const [location] = useState('北京');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const loc = { lat: 39.9163, lng: 116.3972 };
        const [forecastData, alertData] = await Promise.all([
          getWeatherForecast(loc, {
            start: new Date().toISOString().slice(0, 10),
            end: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          }),
          getWeatherAlert(loc),
        ]);
        setForecast(adaptWeatherForecast(forecastData as unknown as Record<string, unknown>[]));
        const adaptedAlerts = adaptWeatherAlert(alertData);
        setAlerts(adaptedAlerts);
      } catch {
        setForecast([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tripImpact = forecast.slice(0, 4).map((f) => {
    const score = f.condition === 'sunny' ? 95 : f.condition === 'cloudy' ? 85 : f.condition.includes('rain') ? 45 : 70;
    const impact = score >= 80 ? '适合户外活动' : score >= 60 ? '天气一般，注意防护' : '建议室内活动';
    const suggestion = score >= 80 ? '推荐户外景点' : score >= 60 ? '推荐混合行程' : '推荐室内景点';
    const dateStr = new Date(f.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    return { date: dateStr, condition: f.condition, impact, suggestion, score };
  });

  return (
    <div className="pb-4">
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

      <div className="px-4 py-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">{location}</h2>
          <button className="px-3 py-1 bg-gray-50 rounded-full text-[10px] text-gray-500 border border-gray-100">
            切换城市
          </button>
        </div>
      </div>

      <div className="px-4 mt-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">加载天气数据...</div>
        ) : (
          <WeatherCard forecast={forecast} alerts={alerts} />
        )}
      </div>

      <div className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 对行程的影响</h3>
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {tripImpact.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">暂无数据</div>
          ) : (
            tripImpact.map((day, index) => (
              <div
                key={day.date}
                className={`flex items-center gap-3 p-3.5 ${
                  index < tripImpact.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="w-16 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">{day.date}</span>
                </div>

                <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                  <span className="text-sm">
                    {day.condition === 'sunny' ? '☀️' :
                     day.condition === 'cloudy' ? '⛅' :
                     day.condition.includes('rain') ? '🌧' : '☀️'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {day.condition === 'sunny' ? '晴' :
                     day.condition === 'cloudy' ? '多云' :
                     day.condition.includes('rain') ? '雨' : '晴'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">{day.impact}</p>
                  <p className="text-[10px] text-brand-600 mt-0.5">{day.suggestion}</p>
                </div>

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
            ))
          )}
        </div>
      </div>

      {alerts.length > 0 && (
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

      <div className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">🗺 天气地图</h3>
        <MapView height="200px" />
      </div>

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
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700 mb-2">☀️ 多云版方案</p>
                <ul className="space-y-1.5">
                  <li className="text-[11px] text-gray-600">• 故宫博物院（户外）</li>
                  <li className="text-[11px] text-gray-600">• 八达岭长城</li>
                  <li className="text-[11px] text-gray-600">• 颐和园游湖</li>
                </ul>
              </div>

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
