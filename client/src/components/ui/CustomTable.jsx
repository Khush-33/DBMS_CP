import React from 'react';

const CustomTable = ({ columns, data, onRowClick, getRowId, selectedRowId }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No data available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg animate-fade-in-up">
      <table>
        <thead>
          
          <tr>
            <th></th>
            <th>Sr No.</th>
            {columns.map((col) => (
              <th key={col.accessor}>{col.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
            
          {data.map((row, rowIndex) => (
            (() => {
              const derivedRowId = getRowId ? getRowId(row, rowIndex) : rowIndex;
              const rowId = derivedRowId ?? rowIndex;
              const isSelected = selectedRowId !== undefined && rowId === selectedRowId;
              const rowClasses = [
                onRowClick ? 'cursor-pointer hover:bg-slate-800/60 transition-colors' : '',
                isSelected ? 'bg-slate-800/80' : ''
              ].join(' ').trim();

              return (
                <tr
                  key={rowId}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                  className={rowClasses}
                >
                  <td>{rowIndex + 1}</td>
              {columns.map((col, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`}>
                  {row[col.accessor]}
                </td>
              ))}
                </tr>
              );
            })()
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
