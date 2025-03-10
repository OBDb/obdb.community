// src/pages/VehicleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dataService from '../services/dataService';
import CommandDetailsPanel from '../components/CommandDetailsPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const VehicleDetail = () => {
  const { make, model } = useParams();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filteredParams, setFilteredParams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ecuHeaders, setEcuHeaders] = useState([]);
  const [expandedParameterId, setExpandedParameterId] = useState(null);
  const [commandData, setCommandData] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        const params = await dataService.getVehicleParameters(make, model);
        setParameters(params);

        // Extract unique ECU headers
        const headers = [...new Set(params.map(param => param.hdr))].sort();
        setEcuHeaders(headers);

        setFilteredParams(params);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load data for ${make} ${model}.`);
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicleData();
  }, [make, model]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = parameters.filter(param =>
        param.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParams(filtered);
    } else {
      setFilteredParams(parameters);
    }
  }, [searchQuery, parameters]);

  const handleTabChange = (index) => {
    setTabValue(index);
    // Reset expanded state when changing tabs
    setExpandedParameterId(null);
    setCommandData(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset expanded state when searching
    setExpandedParameterId(null);
    setCommandData(null);
  };

  const openGitHubRepo = () => {
    const url = `https://github.com/OBDb/${make}-${model}/blob/main/signalsets/v3/default.json`;
    window.open(url, '_blank');
  };

  const handleExpandParameter = async (parameter) => {
    if (expandedParameterId === parameter.id) {
      // Collapse if already expanded
      setExpandedParameterId(null);
      setCommandData(null);
      setSelectedSignal(null);
      return;
    }

    try {
      // Find the command details for this parameter
      const commands = await dataService.getCommands({
        hdr: parameter.hdr
      });

      // Format the command to match
      const cmdFormatted = Object.entries(parameter.cmd)
        .map(([key, value]) => `${key}${value}`)
        .join('');

      // Find the specific command that contains this parameter
      const matchingCommand = commands.find(cmd => {
        const cmdKeyFormatted = Object.entries(cmd.cmd)
          .map(([key, value]) => `${key}${value}`)
          .join('');
        return cmdKeyFormatted === cmdFormatted && cmd.hdr === parameter.hdr;
      });

      if (matchingCommand) {
        setCommandData(matchingCommand);
        // Find this specific parameter in the command parameters
        const paramInCommand = matchingCommand.parameters.find(p => p.id === parameter.id);
        if (paramInCommand) {
          setSelectedSignal(paramInCommand);
        }
        setExpandedParameterId(parameter.id);
      } else {
        console.error('Could not find matching command for parameter', parameter.id);
      }
    } catch (err) {
      console.error('Error fetching command details', err);
    }
  };

  const handleSignalSelected = (signal) => {
    setSelectedSignal(signal);
  };

  // Group parameters by ECU for the ECU tab
  const paramsByEcu = ecuHeaders.reduce((acc, header) => {
    acc[header] = filteredParams.filter(param => param.hdr === header);
    return acc;
  }, {});

  // Group parameters by suggested metric for the metrics tab
  const paramsByMetric = filteredParams.reduce((acc, param) => {
    const metric = param.suggestedMetric || 'Other';
    if (!acc[metric]) acc[metric] = [];
    acc[metric].push(param);
    return acc;
  }, {});

  const metricGroups = Object.entries(paramsByMetric)
    .sort(([a], [b]) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link to="/vehicles" className="hover:text-primary-600">Vehicles</Link>
            <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{make} {model}</span>
          </div>

          <h1 className="text-2xl font-bold flex items-center">
            <span>{make} {model}</span>
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
            {parameters.length} parameters
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Filter by parameter ID or name..."
            className="input text-sm py-2 pl-9"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="md" centered={true} />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["All Parameters", "By ECU", "By Metric"].map((tab, index) => (
                <button
                  key={tab}
                  className={`${
                    tabValue === index
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* All Parameters Tab */}
          {tabValue === 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-compact">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ECU
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suggested Metric
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParams.map((param) => (
                    <React.Fragment key={`${param.hdr}_${param.id}`}>
                      <tr
                        className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === param.id ? 'bg-gray-50' : ''}`}
                        onClick={() => handleExpandParameter(param)}
                      >
                        <td className="px-3 py-1.5 text-xs font-mono text-gray-900">
                          {param.hdr}
                        </td>
                        <td className="px-3 py-1.5 text-xs font-medium text-gray-900">
                          {param.id}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-gray-900">{param.name}</td>
                        <td className="px-3 py-1.5">
                          {param.suggestedMetric ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {param.suggestedMetric}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-gray-900">
                          {param.unit || '—'}
                        </td>
                      </tr>
                      {expandedParameterId === param.id && commandData && (
                        <tr>
                          <td colSpan="5" className="px-0 py-0 border-t border-gray-100">
                            <CommandDetailsPanel
                              command={commandData}
                              highlightedParameterId={param.id}
                              onSignalSelected={handleSignalSelected}
                              showVehicles={false} // Hide vehicles since we're already on the vehicle page
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredParams.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-sm text-gray-500 text-center">
                        No parameters found matching "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* By ECU Tab */}
          {tabValue === 1 && (
            <div className="p-4">
              {Object.entries(paramsByEcu).map(([header, ecuParams]) => (
                ecuParams.length > 0 && (
                  <div key={header} className="mb-6">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700 font-mono">
                        {header}
                      </h3>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ecuParams.length} parameters
                      </span>
                    </div>
                    <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200 table-compact">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Parameter ID
                            </th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Suggested Metric
                            </th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ecuParams.map((param) => (
                            <React.Fragment key={`${header}_${param.id}`}>
                              <tr
                                className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === param.id ? 'bg-gray-50' : ''}`}
                                onClick={() => handleExpandParameter(param)}
                              >
                                <td className="px-3 py-1 text-xs font-medium text-gray-900">
                                  {param.id}
                                </td>
                                <td className="px-3 py-1 text-xs text-gray-900">{param.name}</td>
                                <td className="px-3 py-1 text-xs text-gray-900">
                                  {param.suggestedMetric || '—'}
                                </td>
                                <td className="px-3 py-1 text-xs text-gray-900">{param.unit || '—'}</td>
                              </tr>
                              {expandedParameterId === param.id && commandData && (
                                <tr>
                                  <td colSpan="4" className="px-0 py-0 border-t border-gray-100">
                                    <CommandDetailsPanel
                                      command={commandData}
                                      highlightedParameterId={param.id}
                                      onSignalSelected={handleSignalSelected}
                                      showVehicles={false}
                                    />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))}
              {Object.values(paramsByEcu).every(group => group.length === 0) && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500">
                    No parameters found matching the search criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* By Metric Tab */}
          {tabValue === 2 && (
            <div className="p-4">
              {metricGroups.map(([metric, metricParams]) => (
                <div key={metric} className="mb-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {metric}
                    </h3>
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {metricParams.length} parameters
                    </span>
                  </div>
                  <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200 table-compact">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ECU
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameter ID
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {metricParams.map((param) => (
                          <React.Fragment key={`${metric}_${param.hdr}_${param.id}`}>
                            <tr
                              className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === param.id ? 'bg-gray-50' : ''}`}
                              onClick={() => handleExpandParameter(param)}
                            >
                              <td className="px-3 py-1 text-xs font-mono text-gray-900">
                                {param.hdr}
                              </td>
                              <td className="px-3 py-1 text-xs font-medium text-gray-900">
                                {param.id}
                              </td>
                              <td className="px-3 py-1 text-xs text-gray-900">{param.name}</td>
                              <td className="px-3 py-1 text-xs text-gray-900">{param.unit || '—'}</td>
                            </tr>
                            {expandedParameterId === param.id && commandData && (
                              <tr>
                                <td colSpan="4" className="px-0 py-0 border-t border-gray-100">
                                  <CommandDetailsPanel
                                    command={commandData}
                                    highlightedParameterId={param.id}
                                    onSignalSelected={handleSignalSelected}
                                    showVehicles={false}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {metricGroups.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500">
                    No parameters found matching the search criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
