import React from 'react';

const YearDivider: React.FC<{ year: number }> = ({ year }) => (
  <div className="flex items-center gap-3 py-1">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs font-medium text-gray-400">{year}</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

export default YearDivider;
