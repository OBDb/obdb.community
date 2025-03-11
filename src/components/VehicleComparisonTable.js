// src/components/VehicleComparisonTable.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import signalUtils from '../utils/signalUtils';

const VehicleComparisonTable = ({ vehicles, parameters, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParameterId, setExpandedParameterId] = useState(null);
  const [filterByCommon, setFilterByCommon] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // Whether to show parameter IDs under badges

  // Get all unique parameters across all vehicles
  const allParams = new Map();

  // Group parameters by signal signature
  parameters.forEach((vehicleParams, vehicleIndex) => {
    vehicleParams.forEach(param => {
      const signature = signalUtils.generateSignalSignature(param);
      const normalizedName = signalUtils.normalizeParameterName(
        param.name,
        vehicles[vehicleIndex].make,
        vehicles[vehicleIndex].model
      );

      if (!allParams.has(signature)) {
        // Create a new entry with a representative ID and name
        allParams.set(signature, {
          signature,
          id: param.id, // Use the first found ID as representative
          name: normalizedName,
          vehicles: Array(vehicles.length).fill(null),
          // Store original parameters for each vehicle for reference
          originalParams: Array(vehicles.length).fill(null)
        });
      }

      // Store parameter for this vehicle
      allParams.get(signature).vehicles[vehicleIndex] = param;
      allParams.get(signature).originalParams[vehicleIndex] = param;
    });
  });

  // Convert map to array and apply filters
  let displayParams = Array.from(allParams.values()).filter(param => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      // Search in representative ID and name
      if (param.id.toLowerCase().includes(query) || param.name.toLowerCase().includes(query)) {
        return true;
      }

      // Also search in all vehicle-specific parameter IDs and names
      for (const vehicleParam of param.vehicles) {
        if (vehicleParam && (
            vehicleParam.id.toLowerCase().includes(query) ||
            vehicleParam.name.toLowerCase().includes(query)
          )) {
          return true;
        }
      }

      return false;
    }
    return true;
  });

  // Apply common parameters filter
  if (filterByCommon) {
    displayParams = displayParams.filter(param =>
      param.vehicles.every(vehicle => vehicle !== null)
    );
  }

  // Sort parameters
  displayParams.sort((a, b) => {
    // Sort by availability (common parameters first)
    const aAvailableCount = a.vehicles.filter(v => v !== null).length;
    const bAvailableCount = b.vehicles.filter(v => v !== null).length;

    if (bAvailableCount !== aAvailableCount) {
      return bAvailableCount - aAvailableCount;
    }

    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Toggle parameter expansion
  const toggleParameter = (paramSignature) => {
    setExpandedParameterId(expandedParameterId === paramSignature ? null : paramSignature);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Parameter Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center mb-4 gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter parameters..."
              className="input text-sm py-2 pl-9 w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center">
              <input
                id="filter-common"
                type="checkbox"
                checked={filterByCommon}
                onChange={() => setFilterByCommon(!filterByCommon)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="filter-common" className="ml-2 text-sm text-gray-700">
                Common parameters only
              </label>
            </div>

            <div className="inline-flex items-center">
              <input
                id="show-details"
                type="checkbox"
                checked={showDetails}
                onChange={() => setShowDetails(!showDetails)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="show-details" className="ml-2 text-sm text-gray-700">
                Show parameter IDs
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center bg-gray-50 p-2 rounded-md">
                <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
                </svg>
                <span className="text-sm font-medium flex-grow">
                  {vehicle.make} {vehicle.model}
                </span>
                <Link
                  to={`/vehicles/${vehicle.make}/${vehicle.model}`}
                  className="text-xs text-primary-600 hover:text-primary-800 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {displayParams.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No matching parameters found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-compact comparison-table">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signal Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Command
                </th>
                {vehicles.map((vehicle) => (
                  <th key={vehicle.id} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    {vehicle.model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayParams.map((param) => (
                <React.Fragment key={param.signature}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === param.signature ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleParameter(param.signature)}
                  >
                    <td className="px-3 py-2 text-xs font-medium text-gray-900">
                      {param.name}
                      {param.vehicles.filter(v => v !== null).length === vehicles.length && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Common
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">
                      {(() => {
                        // Find the first available parameter to show command info
                        const firstParam = param.vehicles.find(v => v !== null);
                        if (firstParam) {
                          const cmdStr = firstParam.cmd ?
                            Object.entries(firstParam.cmd)
                              .map(([key, value]) => `${key}${value}`)
                              .join(' ') : '';

                          return (
                            <div className="flex flex-col">
                              <span className="text-primary-700">{firstParam.hdr || ''}</span>
                              {cmdStr && <span className="text-gray-600">{cmdStr}</span>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    {param.vehicles.map((vehicleParam, index) => (
                      <td key={`${param.signature}-${index}`} className="px-3 py-2 text-xs text-center">
                        {vehicleParam ? (
                          <div className="flex flex-col items-center">
                            <StatusBadge
                              text="Available"
                              variant="success"
                              size="sm"
                            />
                            {showDetails && (
                              <span className="mt-1 text-xs text-gray-500 font-mono">
                                {vehicleParam.id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <StatusBadge
                            text="Not Available"
                            variant="default"
                            size="sm"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedParameterId === param.signature && (
                    <tr>
                      <td colSpan={2 + vehicles.length} className="px-0 py-0 border-t border-gray-100">
                        <div className="p-4 bg-gray-50">
                          <h4 className="text-sm font-medium mb-3">Signal Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {param.vehicles.map((vehicleParam, index) =>
                              vehicleParam ? (
                                <div key={index} className="bg-white p-3 rounded-md border border-gray-200 text-xs">
                                  <div className="font-medium mb-2 text-primary-700">
                                    {vehicles[index].make} {vehicles[index].model}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">ID:</span> {vehicleParam.id}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">Name:</span> {vehicleParam.name}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">ECU:</span> {vehicleParam.hdr || '-'}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">Command:</span>{' '}
                                    {vehicleParam.cmd ?
                                      Object.entries(vehicleParam.cmd)
                                        .map(([key, value]) => `${key}${value}`)
                                        .join(' ') : '-'}
                                  </div>
                                  {vehicleParam.bitOffset !== undefined && vehicleParam.bitLength !== undefined && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Bit Range:</span>{' '}
                                      {vehicleParam.bitOffset}-{vehicleParam.bitOffset + vehicleParam.bitLength - 1}
                                    </div>
                                  )}
                                  {vehicleParam.suggestedMetric && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Metric:</span> {vehicleParam.suggestedMetric}
                                    </div>
                                  )}
                                  {vehicleParam.unit && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Unit:</span> {vehicleParam.unit}
                                    </div>
                                  )}
                                  {vehicleParam.fmt && (
                                    <div className="mt-2">
                                      <div className="text-gray-500 mb-1">Scaling Info:</div>
                                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                        {JSON.stringify(vehicleParam.fmt, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleComparisonTable;
