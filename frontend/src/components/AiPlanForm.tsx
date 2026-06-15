// ========== AI 行程规划表单 ==========
// 用户输入偏好，AI 生成行程方案

import React, { useState } from 'react';
import { TRIP_STYLES, BUDGET_LEVELS } from '@/utils/constants';
import type { TripStyle, BudgetLevel, AiPlanFormData } from '@/utils/types';

interface AiPlanFormProps {
  onSubmit: (data: AiPlanFormData) => void;
  isLoading: boolean;
}

const AiPlanForm: React.FC<AiPlanFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<AiPlanFormData>({
    destinations: '',
    startDate: '',
    endDate: '',
    style: '休闲度假',
    budgetLevel: '舒适型',
    specialRequirements: '',
    weatherPreference: 'outdoor',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AiPlanFormData, string>>>({});

  // 今天日期，用于设置日期选择器最小值
  const today = new Date().toISOString().split('T')[0];

  // 更新表单字段
  const updateField = <K extends keyof AiPlanFormData>(
    key: K,
    value: AiPlanFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // 清除对应字段的错误
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // 表单验证
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AiPlanFormData, string>> = {};

    if (!formData.destinations.trim()) {
      newErrors.destinations = '请输入目的地';
    }
    if (!formData.startDate) {
      newErrors.startDate = '请选择出发日期';
    }
    if (!formData.endDate) {
      newErrors.endDate = '请选择返回日期';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '返回日期不能早于出发日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // 渲染风格选择器
  const renderStyleSelector = () => (
    <div className="grid grid-cols-4 gap-2">
      {TRIP_STYLES.map((style) => (
        <button
          key={style}
          type="button"
          onClick={() => updateField('style', style as TripStyle)}
          className={`px-2 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
            formData.style === style
              ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
              : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
          }`}
        >
          {style === '网红打卡' ? '📸' :
           style === '文艺漫步' ? '🎨' :
           style === '亲子游玩' ? '👨‍👩‍👧' :
           style === '深度文化' ? '🏛' :
           style === '休闲度假' ? '🏖' :
           style === '美食之旅' ? '🍜' :
           style === '摄影采风' ? '📷' :
           style === '冒险探索' ? '🧗' : '🎯'}
          <span className="block mt-0.5">{style}</span>
        </button>
      ))}
    </div>
  );

  // 渲染预算选择器
  const renderBudgetSelector = () => (
    <div className="flex gap-2">
      {BUDGET_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => updateField('budgetLevel', level as BudgetLevel)}
          className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
            formData.budgetLevel === level
              ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
              : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
          }`}
        >
          {level === '经济型' ? '💰' :
           level === '舒适型' ? '💵' :
           level === '轻奢型' ? '💎' :
           level === '豪华型' ? '👑' : '💰'}
          <span className="block mt-0.5">{level}</span>
        </button>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 目的地输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          目的地
        </label>
        <input
          type="text"
          value={formData.destinations}
          onChange={(e) => updateField('destinations', e.target.value)}
          placeholder="例如：北京、上海、成都"
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
            errors.destinations ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.destinations && (
          <p className="text-xs text-red-500 mt-1">{errors.destinations}</p>
        )}
      </div>

      {/* 日期选择 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            出发日期
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            min={today}
            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
              errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            返回日期
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            min={formData.startDate || today}
            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
              errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* 出行风格 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出行风格
        </label>
        {renderStyleSelector()}
      </div>

      {/* 预算等级 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          预算等级
        </label>
        {renderBudgetSelector()}
      </div>

      {/* 天气偏好 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          天气偏好
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateField('weatherPreference', 'indoor')}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              formData.weatherPreference === 'indoor'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
            }`}
          >
            🏠 室内偏好
          </button>
          <button
            type="button"
            onClick={() => updateField('weatherPreference', 'outdoor')}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              formData.weatherPreference === 'outdoor'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
            }`}
          >
            🌲 户外偏好
          </button>
        </div>
      </div>

      {/* 特殊需求 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          特殊需求（选填）
        </label>
        <textarea
          value={formData.specialRequirements}
          onChange={(e) => updateField('specialRequirements', e.target.value)}
          placeholder="例如：带老人出行、需要无障碍设施、不想爬山等"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all ${
          isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-500 to-brand-600 active:opacity-90 shadow-soft'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            AI 正在生成方案...
          </span>
        ) : (
          '🚀 生成方案'
        )}
      </button>
    </form>
  );
};

export default AiPlanForm;
