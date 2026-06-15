// ========== 预算概览组件 ==========
// 展示总预算和各分类预算占比

import React from 'react';
import type { Budget } from '@/utils/types';
import { BUDGET_CATEGORIES } from '@/utils/constants';

interface BudgetSummaryProps {
  budget: Budget;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budget }) => {
  // 计算每个分类的花费百分比
  const categories = BUDGET_CATEGORIES.map((cat) => {
    const spent = budget[cat.key as keyof Budget] as number;
    const percentage = budget.total > 0 ? Math.round((spent / budget.total) * 100) : 0;
    return { ...cat, spent, percentage };
  });

  // 总花费
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = budget.total - totalSpent;
  const remainingPercentage = budget.total > 0 ? Math.round((remaining / budget.total) * 100) : 0;

  // 判断是否超预算
  const isOverBudget = totalSpent > budget.total;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      {/* 总预算 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">预算总计</p>
          <p className={`text-2xl font-bold mt-0.5 ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            ¥{budget.total.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">已花费</p>
          <p className={`text-lg font-semibold mt-0.5 ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
            ¥{totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 总进度条 */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="absolute top-0 left-0 h-full transition-all duration-500"
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color,
              left: `${categories
                .slice(0, categories.indexOf(cat))
                .reduce((sum, c) => sum + c.percentage, 0)}%`,
            }}
          />
        ))}
      </div>

      {/* 剩余预算 */}
      <div className="flex items-center justify-between text-xs mb-5">
        <span className="text-gray-400">剩余</span>
        <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {remaining >= 0 ? '+' : ''}¥{remaining.toLocaleString()} ({remainingPercentage}%)
        </span>
      </div>

      {/* 分类详情 */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-gray-600">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">
                  ¥{cat.spent.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">{cat.percentage}%</span>
              </div>
            </div>
            {/* 单项进度条 */}
            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 超预算警告 */}
      {isOverBudget && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="text-xs font-medium text-red-700">预算超支</p>
            <p className="text-[10px] text-red-500 mt-0.5">
              已超出 ¥{(totalSpent - budget.total).toLocaleString()}，建议调整部分开支
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;
