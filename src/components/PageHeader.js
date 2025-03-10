// src/components/PageHeader.js
import React from 'react';

const PageHeader = ({
  title,
  description = null,
  breadcrumbs = null,
  actions = null,
  className = ""
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          {breadcrumbs}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {actions && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
