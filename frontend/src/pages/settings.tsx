import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="pb-6">
      <div className="px-4 pt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-soft p-5 text-center">
          <span className="text-4xl block mb-3">⚙️</span>
          <h3 className="text-base font-semibold text-gray-800">设置</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            设置功能正在开发中，敬请期待
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-600">版本</span>
              <span className="text-sm text-gray-400">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">应用名称</span>
              <span className="text-sm text-gray-400">TripWise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
