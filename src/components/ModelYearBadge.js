// src/components/ModelYearBadge.js
import React from 'react';

const ModelYearBadge = ({ years, variant = 'default', className = '' }) => {
  // Don't render if no years provided
  if (!years || (Array.isArray(years) && years.length === 0)) {
    return null;
  }

  // Handle both array format [startYear, endYear] and individual year
  const startYear = Array.isArray(years) ? years[0] : years;
  const endYear = Array.isArray(years) ? years[1] : years;

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };

  // Format the display text
  let displayText;
  if (startYear === endYear) {
    displayText = `${startYear}`;
  } else {
    displayText = `${startYear}-${endYear}`;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {displayText}
    </span>
  );
};

export default ModelYearBadge;
