// src/components/DataTable.js
import React from 'react';

const DataTable = ({
  columns,
  data,
  emptyMessage = "No data found.",
  className = "",
  onRowClick = null,
  isCompact = true,
  sortConfig = { key: null, direction: 'asc' },
  onSort = null
}) => {
  return (
    <div className={`bg-white shadow overflow-hidden border border-gray-200 rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${isCompact ? 'table-compact' : ''}`}>
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable && onSort ? 'cursor-pointer' : ''} ${column.className || ''}`}
                  onClick={column.sortable && onSort ? () => onSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={`${row.id || rowIndex}-${column.key}`}
                      className={`px-3 py-1.5 text-xs ${column.cellClassName || ''}`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-4 text-sm text-gray-500 text-center">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
