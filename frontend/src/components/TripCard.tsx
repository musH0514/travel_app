import React from 'react';
import { useRouter } from 'next/router';
import type { TripPlan } from '@/utils/types';
import { BUDGET_LEVELS } from '@/utils/constants';
import { saveScrollPosition } from '@/utils/scrollRestoration';

interface TripCardProps {
  trip: TripPlan;
  scrollRestoreKey?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  scrollRestoreKey,
  scrollContainerRef,
}) => {
  const router = useRouter();

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

  const handleClick = () => {
    if (scrollRestoreKey) {
      saveScrollPosition(scrollRestoreKey, scrollContainerRef?.current);
    }
    router.push(`/trip-plan?id=${trip.id}`, undefined, { scroll: false });
  };

  const destNames = trip.destinations.map((d) => d.name).join(' · ');

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-soft overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="h-32 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 relative">
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-sm font-medium text-white">
          {destNames}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          <span className="text-gray-400 text-xs">{daysCount}天 · {trip.destinations.length}个目的地</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-brand-50 text-brand-600 text-xs rounded-full border border-brand-100">
            {trip.preferences.style}
          </span>
          <span className={`px-2.5 py-1 text-xs rounded-full border ${getBudgetLevelStyle(trip.preferences.budgetLevel)}`}>
            {trip.preferences.budgetLevel}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">预算总计</span>
            <span className="font-semibold text-gray-800">¥{trip.budget.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
