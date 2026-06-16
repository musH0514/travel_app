import React from 'react';
import { useRouter } from 'next/router';

const menuItems = [
  { key: 'tracks', icon: '🗺', label: '我的足迹', desc: '查看你去过的城市', path: '/my-tracks' },
  { key: 'history', icon: '📜', label: '历史行程', desc: '查看已完成的行程', path: '/history-trips' },
  { key: 'settings', icon: '⚙️', label: '设置', desc: '应用设置与偏好', path: '/settings' },
];

const ProfilePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="pb-6">
      <div className="px-4 pt-6">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-4xl overflow-hidden mb-3">
            <span className="text-brand-600">👤</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">旅行者</h2>
          <p className="text-xs text-gray-400 mt-1">用户ID: u_10001</p>
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
      </div>
    </div>
  );
};

export default ProfilePage;
