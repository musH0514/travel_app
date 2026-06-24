import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { getCurrentUser } from '@/api/auth';
import type { UserResponse } from '@/api/auth';

const menuItems = [
  { key: 'tracks', icon: '🗺', label: '我的足迹', desc: '查看你去过的城市', path: '/my-tracks' },
  { key: 'history', icon: '📜', label: '历史行程', desc: '查看已完成的行程', path: '/history-trips' },
  { key: 'settings', icon: '⚙️', label: '设置', desc: '应用设置与偏好', path: '/settings' },
];

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      getCurrentUser().then(setUser).catch(() => setUser(null));
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 pt-10 text-center">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-4xl mb-3">
            <span className="text-brand-600">👤</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">登录后体验完整功能</p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl"
          >
            登录 / 注册
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-soft active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const displayName = user?.username || '旅行者';
  const displayId = user?.id ? `ID: ${user.id.slice(0, 8)}` : '';

  return (
    <div className="pb-6">
      <div className="px-4 pt-6">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-4xl overflow-hidden mb-3">
            <span className="text-brand-600">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{displayName}</h2>
          {user?.email && (
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          )}
        </div>
      </div>

      <div className="px-4 mt-2 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-soft active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-soft active:scale-[0.98] transition-transform mt-4"
        >
          <span className="text-2xl">🚪</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-red-600">退出登录</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
