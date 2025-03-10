// src/components/StatusBadge.js
import React from 'react';

const StatusBadge = ({
  text,
  variant = 'default', // default, primary, secondary, success, warning, danger
  size = 'sm', // sm, md, lg
  rounded = 'full' // full, md
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md'
  };

  return (
    <span className={`inline-flex items-center font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
