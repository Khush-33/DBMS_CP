import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-11 bg-gray-800/50 rounded-lg w-full max-w-md"></div>
        <div className="h-5 bg-gray-800/50 rounded w-32"></div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-xl border border-gray-800/50">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-900/90 to-gray-800/90">
            <tr>
              {Array.from({ length: columns }).map((_, idx) => (
                <th key={idx} className="px-6 py-4">
                  <div className="h-4 bg-gray-700/50 rounded w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900/30 divide-y divide-gray-800/50">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-4 bg-gray-800/50 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="h-9 bg-gray-800/50 rounded-lg w-32"></div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-9 w-9 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
