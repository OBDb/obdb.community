// src/components/SearchFilter.js
import React from 'react';

const SearchFilter = ({
  filters,
  onFilterChange,
  fields,
  className = ""
}) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.className || "flex-1 min-w-[200px]"}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={filters[field.name]}
                onChange={onFilterChange}
                className="input text-sm py-1"
              >
                <option value="">{field.placeholder || `All ${field.label}s`}</option>
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={filters[field.name]}
                  onChange={onFilterChange}
                  placeholder={field.placeholder || "Type to search..."}
                  className="input text-sm py-1 pl-8"
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
