import React, { useState } from 'react';
import type { TripPlan } from '@/utils/types';
import { BUDGET_LEVELS } from '@/utils/constants';

interface TripCardProps {
  trip: TripPlan;
  onPress?: (trip: TripPlan) => void;
  onEdit?: (trip: TripPlan) => void;
  onDelete?: (trip: TripPlan) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const daysCount = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const getBudgetLevelStyle = (level: string) => {
    const index = BUDGET_LEVELS.indexOf(level as typeof BUDGET_LEVELS[number]);
    const colors = [
      'bg-green-50 text-green-600 border-green-200',
      'bg-blue-50 text-blue-600 border-blue-200',
      'bg-purple-50 text-purple-600 border-purple-200',
      'bg-accent-50 text-accent-600 border-accent-200',
    ];
    return colors[index] || colors[0];
  };

  const handlePress = () => {
    onPress?.(trip);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(trip);
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(trip);
    setShowActions(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden active:scale-[0.98] transition-transform">
      <button onClick={handlePress} className="w-full text-left">
        <div className="h-32 bg-gradient-to-br from-brand-400 to-brand-600 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">📅</span>
          </div>
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-base">
                {trip.destinations.map((d) => d.name).join(' · ')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {daysCount}天行程 · {trip.destinations.length}个目的地
              </p>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-heavy border border-gray-100 py-1 min-w-[100px] z-20 animate-scale-in">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                  >
                    🗑 删除
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-2.5 py-1 bg-brand-50 text-brand-600 text-xs rounded-full border border-brand-100">
              {trip.preferences.style}
            </span>
            <span className={`px-2.5 py-1 text-xs rounded-full border ${getBudgetLevelStyle(trip.preferences.budgetLevel)}`}>
              {trip.preferences.budgetLevel}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">预算总计</span>
              <span className="font-semibold text-gray-800">¥{trip.budget.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default TripCard;
