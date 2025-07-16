import React from 'react';

interface TableSkeletonProps {
  numRows?: number;
  numCols?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ numRows = 5, numCols = 3 }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: numCols }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: numRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: numCols }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton; 