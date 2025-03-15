// src/components/vehicle/SearchFilter.js
import React from 'react';

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  yearRangeFilter,
  onYearRangeFilterChange,
  yearRanges
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search parameters by ID, name, ECU, or other fields..."
          className="input text-sm py-2 pl-9"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Year range filter */}
      {yearRanges.length > 0 && (
        <div className="md:w-64">
          <select
            value={yearRangeFilter}
            onChange={onYearRangeFilterChange}
            className="input text-sm py-2"
          >
            <option value="all">All Model Years</option>
            {yearRanges.map((range, idx) => (
              <option key={idx} value={`${range.startYear}-${range.endYear}`}>
                {range.startYear === range.endYear
                  ? `${range.startYear} Only`
                  : `${range.startYear}-${range.endYear}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
