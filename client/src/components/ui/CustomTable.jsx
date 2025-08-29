import React from 'react';

const CustomTable = ({ columns, data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400 mt-8">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg ring-1 ring-white/10 bg-gray-900/50 backdrop-blur-lg">
      <table className="min-w-full">
        <thead className="bg-gray-900/80">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} scope="col" className="px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-800/60 transition-colors duration-200">
              {columns.map((col, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
