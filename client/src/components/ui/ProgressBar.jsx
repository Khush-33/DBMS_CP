import React from 'react';

const ProgressBar = ({ value, max, label, showPercentage = true, color = 'orange' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  const bgColor = colors[color] || colors.orange;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-gray-400 font-medium">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${bgColor} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
