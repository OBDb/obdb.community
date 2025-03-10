// src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({
  size = 'md', // sm, md, lg
  centered = true
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`${centered ? 'flex justify-center py-10' : ''}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary-600`}></div>
    </div>
  );
};

export default LoadingSpinner;
