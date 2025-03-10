// src/components/TabPanel.js
import React from 'react';

const TabPanel = ({
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`${
                activeTab === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
              onClick={() => onTabChange(index)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default TabPanel;
