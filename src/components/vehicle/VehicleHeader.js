// src/components/vehicle/VehicleHeader.js
import React from 'react';
import { Link } from 'react-router-dom';

const VehicleHeader = ({ make, model, isSpecialCase, parameterCount }) => {
  // Get appropriate title based on whether it's a special case or regular make/model
  const getTitle = () => {
    if (isSpecialCase) {
      return make;  // Just use the make for special cases
    }
    return `${make} ${model}`;  // Use make + model for regular cases
  };

  // Open GitHub repository
  const openGitHubRepo = () => {
    let url;
    if (isSpecialCase) {
      // For special cases like SAEJ1979
      url = `https://github.com/OBDb/${make}/blob/main/signalsets/v3/default.json`;
    } else {
      // For regular make-model
      url = `https://github.com/OBDb/${make}-${model}/blob/main/signalsets/v3/default.json`;
    }
    window.open(url, '_blank');
  };

  // Adjust breadcrumbs based on special case status
  const getBreadcrumbs = () => (
    <>
      <Link to="/" className="hover:text-primary-600">Home</Link>
      <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      <Link to="/vehicles" className="hover:text-primary-600">Vehicles</Link>
      <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      <span className="text-gray-700">{getTitle()}</span>
    </>
  );

  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          {getBreadcrumbs()}
        </div>

        <h1 className="text-2xl font-bold flex items-center">
          <span>{getTitle()}</span>
          <button
            onClick={openGitHubRepo}
            className="ml-2 text-gray-500 hover:text-primary-600"
            title="View on GitHub"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.998.108-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.606-.015 2.896-.015 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </button>
        </h1>
      </div>

      <div className="mt-4 sm:mt-0">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
          {parameterCount} parameters
        </span>
      </div>
    </div>
  );
};

export default VehicleHeader;
