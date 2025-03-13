// src/pages/VehicleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dataService from '../services/dataService';
import ParameterTable from '../components/ParameterTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import TabPanel from '../components/TabPanel';

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
  // New state to handle special cases
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  // Check if this is a BMW vehicle
  const isBMW = make && make.toLowerCase() === 'bmw';

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);

        // Handle the special case like SAEJ1979 that doesn't have a model
        if (make && !model) {
          setIsSpecialCase(true);

          // For SAEJ1979 or other special cases, we'll fetch data differently
          // This would need to be adapted based on your actual data structure
          const params = await dataService.getSpecialCaseParameters(make);

          if (params && params.length > 0) {
            setParameters(params);

            // Extract unique ECU headers or extended addresses for BMW
            const ecuIdentifiers = isBMW
              ? [...new Set(params.map(param => param.eax || param.hdr))].sort()
              : [...new Set(params.map(param => param.hdr))].sort();
            setEcuHeaders(ecuIdentifiers);

            setFilteredParams(params);
          } else {
            setError(`No data found for ${make}`);
          }
        } else {
          // Standard make/model case
          const params = await dataService.getVehicleParameters(make, model);
          setParameters(params);

          // Extract unique ECU headers or extended addresses for BMW
          const ecuIdentifiers = isBMW
            ? [...new Set(params.map(param => param.eax || param.hdr))].sort()
            : [...new Set(params.map(param => param.hdr))].sort();
          setEcuHeaders(ecuIdentifiers);

          setFilteredParams(params);
        }

        setLoading(false);
      } catch (err) {
        const errorMsg = model
          ? `Failed to load data for ${make} ${model}.`
          : `Failed to load data for ${make}.`;
        setError(errorMsg);
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicleData();
  }, [make, model, isBMW]);

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

  const handleExpandParameter = async (parameter) => {
    if (expandedParameterId === parameter.id) {
      // Collapse if already expanded
      setExpandedParameterId(null);
      setCommandData(null);
      return;
    }

    // Always set the expanded parameter ID immediately for better UX
    setExpandedParameterId(parameter.id);

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
      } else {
        console.error('Could not find matching command for parameter', parameter.id);
        // If we can't find a matching command, create a simple command object with the parameter
        setCommandData({
          id: parameter.id,
          hdr: parameter.hdr,
          eax: parameter.eax, // Include extended address
          cmd: parameter.cmd,
          parameters: [parameter],
          vehicles: []
        });
      }
    } catch (err) {
      console.error('Error fetching command details', err);
      // Still provide basic parameter details if command data fetch fails
      setCommandData({
        id: parameter.id,
        hdr: parameter.hdr,
        eax: parameter.eax, // Include extended address
        cmd: parameter.cmd,
        parameters: [parameter],
        vehicles: []
      });
    }
  };

  // Function to get ECU display value for BMW or non-BMW vehicles
  const getEcuValue = (param) => {
    if (isBMW && param.eax) {
      return param.eax;
    }
    return param.hdr || '';
  };

  // Group parameters by ECU for the ECU tab
  const paramsByEcu = ecuHeaders.reduce((acc, ecuId) => {
    // For BMW, group by extended address, for others group by header
    const paramsForEcu = isBMW
      ? filteredParams.filter(param => (param.eax || param.hdr) === ecuId)
      : filteredParams.filter(param => param.hdr === ecuId);

    if (paramsForEcu.length > 0) {
      acc[ecuId] = paramsForEcu;
    }
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

  // Columns for the All Parameters tab
  const allParamsColumns = [
    {
      key: 'hdr',
      header: 'ECU',
      cellClassName: 'font-mono text-gray-900',
      render: (row) => getEcuValue(row)
    },
    {
      key: 'id',
      header: 'Parameter ID',
      cellClassName: 'font-medium text-gray-900'
    },
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'text-gray-900'
    },
    {
      key: 'suggestedMetric',
      header: 'Suggested Metric',
      render: (row) => row.suggestedMetric ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {row.suggestedMetric}
        </span>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (row) => row.unit || '—'
    }
  ];

  // Columns for the ECU tab (no ECU column needed)
  const ecuParamsColumns = [
    {
      key: 'id',
      header: 'Parameter ID',
      cellClassName: 'font-medium text-gray-900'
    },
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'text-gray-900'
    },
    {
      key: 'suggestedMetric',
      header: 'Suggested Metric',
      render: (row) => row.suggestedMetric || '—'
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (row) => row.unit || '—'
    }
  ];

  // Columns for the Metric tab
  const metricParamsColumns = [
    {
      key: 'hdr',
      header: 'ECU',
      cellClassName: 'font-mono text-gray-900',
      render: (row) => getEcuValue(row)
    },
    {
      key: 'id',
      header: 'Parameter ID',
      cellClassName: 'font-medium text-gray-900'
    },
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'text-gray-900'
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (row) => row.unit || '—'
    }
  ];

  // Get appropriate title based on whether it's a special case or regular make/model
  const getTitle = () => {
    if (isSpecialCase) {
      return make;  // Just use the make for special cases
    }
    return `${make} ${model}`;  // Use make + model for regular cases
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
    <div>
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
        <TabPanel
          tabs={["All Parameters", "By ECU", "By Metric"]}
          activeTab={tabValue}
          onTabChange={handleTabChange}
        >
          {/* All Parameters Tab */}
          {tabValue === 0 && (
            <ParameterTable
              parameters={filteredParams}
              columns={allParamsColumns}
              expandedParameterId={expandedParameterId}
              commandData={commandData}
              onParameterClick={handleExpandParameter}
              showPagination={false}
              showVehicles={false}
            />
          )}

          {/* By ECU Tab */}
          {tabValue === 1 && (
            <div>
              {Object.entries(paramsByEcu).map(([ecuId, ecuParams]) => (
                ecuParams.length > 0 && (
                  <div key={ecuId} className="mb-6">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700 font-mono">
                        {ecuId}
                      </h3>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ecuParams.length} parameters
                      </span>
                    </div>
                    <ParameterTable
                      parameters={ecuParams}
                      columns={ecuParamsColumns}
                      expandedParameterId={expandedParameterId}
                      commandData={commandData}
                      onParameterClick={handleExpandParameter}
                      showPagination={false}
                      showVehicles={false}
                    />
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
            <div>
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
                  <ParameterTable
                    parameters={metricParams}
                    columns={metricParamsColumns}
                    expandedParameterId={expandedParameterId}
                    commandData={commandData}
                    onParameterClick={handleExpandParameter}
                    showPagination={false}
                    showVehicles={false}
                  />
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
        </TabPanel>
      )}
    </div>
  );
};

export default VehicleDetail;
