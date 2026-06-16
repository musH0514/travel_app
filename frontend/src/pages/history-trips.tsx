import React from 'react';
import TripCard from '@/components/TripCard';
import { mockTrips } from '@/utils/mockData';

const HistoryTripsPage: React.FC = () => {
  const completedTrips = mockTrips.filter((t) => t.status === 'completed');

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        {completedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">📜</span>
            <p className="text-sm">还没有完成的历史行程</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTripsPage;
