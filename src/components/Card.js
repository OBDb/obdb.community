// src/components/Card.js
import React from 'react';

const Card = ({
  title = null,
  icon = null,
  children,
  actions = null,
  className = "",
  padding = true
}) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            {icon && (
              <div className="flex-shrink-0 mr-3">
                {icon}
              </div>
            )}
            {title && (
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            )}
          </div>
        </div>
      )}

      <div className={padding ? "px-4 py-5 sm:p-6" : ""}>
        {children}
      </div>

      {actions && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
