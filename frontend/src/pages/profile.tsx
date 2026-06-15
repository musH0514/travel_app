// ========== 个人中心页面 ==========
// 用户信息、偏好设置、API Key 管理

import React, { useState } from 'react';
import { TRIP_STYLES, BUDGET_LEVELS, PLACEHOLDER_AMAP_KEY, PLACEHOLDER_HEFENG_KEY } from '@/utils/constants';
import type { TripStyle, BudgetLevel } from '@/utils/types';

const ProfilePage: React.FC = () => {
  const [user] = useState({
    name: '旅行者',
    email: 'traveler@example.com',
    avatar: null as string | null,
  });

  // 偏好设置
  const [defaultStyle, setDefaultStyle] = useState<TripStyle>('休闲度假');
  const [defaultBudget, setDefaultBudget] = useState<BudgetLevel>('舒适型');
  const [weatherPreference, setWeatherPreference] = useState<'indoor' | 'outdoor'>('outdoor');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  // API Keys
  const [amapKey, setAmapKey] = useState(PLACEHOLDER_AMAP_KEY);
  const [hefengKey, setHefengKey] = useState(PLACEHOLDER_HEFENG_KEY);

  // 通知设置
  const [notifications, setNotifications] = useState({
    weatherAlert: true,
    tripReminder: true,
    recommendation: false,
  });

  // 密码修改
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 保存设置
  const saveSettings = () => {
    // TODO: 实际保存逻辑
    console.log('保存设置');
  };

  // 设置项组件
  const SettingRow: React.FC<{
    label: string;
    description?: string;
    children: React.ReactNode;
  }> = ({ label, description, children }) => (
    <div className="py-3.5 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-700">{label}</p>
          {description && (
            <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        <div className="ml-3">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="pb-4">
      {/* 用户信息卡片 */}
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            {/* 信息 */}
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm opacity-80 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  🌟 旅行达人
                </span>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  📍 去过 3 个城市
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 设置列表 */}
      <div className="px-4 mt-4 space-y-4">
        {/* 偏好设置 */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">⚙️ 偏好设置</h3>
          <p className="text-[10px] text-gray-400 mb-3">这些设置将影响 AI 生成行程的推荐</p>

          {/* 默认出行风格 */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">默认出行风格</p>
            <div className="flex flex-wrap gap-1.5">
              {TRIP_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setDefaultStyle(style as TripStyle)}
                  className={`px-3 py-1 text-[10px] rounded-full border transition-all ${
                    defaultStyle === style
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 默认预算 */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">默认预算等级</p>
            <div className="flex gap-2">
              {BUDGET_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setDefaultBudget(level as BudgetLevel)}
                  className={`flex-1 px-3 py-2 text-[10px] rounded-xl border transition-all ${
                    defaultBudget === level
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 天气偏好 */}
          <SettingRow label="天气偏好" description="影响 AI 推荐的行程类型">
            <div className="flex bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setWeatherPreference('indoor')}
                className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${
                  weatherPreference === 'indoor' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
                }`}
              >
                🏠 室内
              </button>
              <button
                onClick={() => setWeatherPreference('outdoor')}
                className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${
                  weatherPreference === 'outdoor' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
                }`}
              >
                🌲 户外
              </button>
            </div>
          </SettingRow>

          {/* 单位制 */}
          <SettingRow label="温度单位" description="摄氏 / 华氏">
            <div className="flex bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setUnits('metric')}
                className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${
                  units === 'metric' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${
                  units === 'imperial' ? 'bg-white text-gray-700 shadow-soft' : 'text-gray-400'
                }`}
              >
                °F
              </button>
            </div>
          </SettingRow>
        </div>

        {/* API Key 管理 */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">🔑 API Key 管理</h3>
          <p className="text-[10px] text-gray-400 mb-3">请替换为你的真实 API Key</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1.5 block">
                高德地图 Key
                <span className="text-gray-300 ml-1">(地图服务)</span>
              </label>
              <input
                type="text"
                value={amapKey}
                onChange={(e) => setAmapKey(e.target.value)}
                placeholder="输入高德地图 API Key"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[9px] text-gray-300 mt-1">请访问 https://lbs.amap.com 获取 Key</p>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1.5 block">
                和风天气 Key
                <span className="text-gray-300 ml-1">(天气预报服务)</span>
              </label>
              <input
                type="text"
                value={hefengKey}
                onChange={(e) => setHefengKey(e.target.value)}
                placeholder="输入和风天气 API Key"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[9px] text-gray-300 mt-1">请访问 https://www.qweather.com 获取 Key</p>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🔔 通知设置</h3>

          <SettingRow label="天气预警通知" description="恶劣天气时推送提醒">
            <button
              onClick={() => setNotifications((n) => ({ ...n, weatherAlert: !n.weatherAlert }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notifications.weatherAlert ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                notifications.weatherAlert ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </SettingRow>

          <SettingRow label="行程提醒" description="出发前一天提醒">
            <button
              onClick={() => setNotifications((n) => ({ ...n, tripReminder: !n.tripReminder }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notifications.tripReminder ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                notifications.tripReminder ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </SettingRow>

          <SettingRow label="推荐通知" description="新目的地或优惠推荐">
            <button
              onClick={() => setNotifications((n) => ({ ...n, recommendation: !n.recommendation }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notifications.recommendation ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                notifications.recommendation ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </SettingRow>
        </div>

        {/* 关于 */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">ℹ️ 关于</h3>
          <div className="space-y-2 text-xs text-gray-500">
            <p>TripWise v1.0.0</p>
            <p>AI 驱动的智能旅行规划助手</p>
            <p className="text-gray-300">© 2026 TripWise. All rights reserved.</p>
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={saveSettings}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold rounded-xl active:opacity-90 transition-opacity shadow-soft"
        >
          保存设置
        </button>

        {/* 退出登录 */}
        <button className="w-full py-3 text-sm text-red-500 font-medium bg-white rounded-xl border border-red-100 active:bg-red-50 transition-colors">
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
