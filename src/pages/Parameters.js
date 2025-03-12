// src/pages/Parameters.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import ParameterTable from '../components/ParameterTable';
import DataPageLayout from '../components/DataPageLayout';

const Parameters = () => {
  const [displayedParameters, setDisplayedParameters] = useState([]);
  const [suggestedMetrics, setSuggestedMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    query: '',
    metric: '',
  });
  const [orderBy] = useState('id');
  const [order] = useState('asc');
  const [expandedParameterId, setExpandedParameterId] = useState(null);
  const [commandData, setCommandData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Search parameters with no filters initially
        const result = await dataService.searchParameters({});

        // Sort the parameters by ID initially
        const sortedParams = sortParameters(result, orderBy, order);
        setDisplayedParameters(sortedParams);

        // Extract suggested metrics for filtering
        const metrics = [...new Set(result
          .filter(p => p.suggestedMetric)
          .map(p => p.suggestedMetric))]
          .sort((a, b) => a.localeCompare(b));
        setSuggestedMetrics(metrics);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching parameters:", err);
        setError(err.toString());
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();
  }, [orderBy, order]);

  // Apply filtering and sorting when filters change
  useEffect(() => {
    const searchParams = async () => {
      try {
        setLoading(true);
        const result = await dataService.searchParameters(filters);

        // Apply current sorting to the filtered results
        const sortedParams = sortParameters(result, orderBy, order);
        setDisplayedParameters(sortedParams);
        setLoading(false);
      } catch (err) {
        console.error("Error searching parameters:", err);
        setError(err.toString());
        setLoading(false);
      }
    };

    searchParams();
  }, [filters, orderBy, order]);

  const sortParameters = (params, property, direction) => {
    return [...params].sort((a, b) => {
      let aValue = a[property];
      let bValue = b[property];

      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      // For numeric values
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openGitHubRepo = (param) => {
    if (param.instances && param.instances.length > 0) {
      const instance = param.instances[0];
      const url = `https://github.com/OBDb/${instance.make}-${instance.model}/blob/main/signalsets/v3/default.json`;
      window.open(url, '_blank');
    }
  };

  const handleExpandParameter = async (parameter) => {
    if (expandedParameterId === parameter.id) {
      // Collapse if already expanded
      setExpandedParameterId(null);
      setCommandData(null);
      return;
    }

    try {
      // We need to get the command details for this parameter
      if (parameter.instances && parameter.instances.length > 0) {
        const instance = parameter.instances[0];

        // Set expanded parameter ID early for better UX
        setExpandedParameterId(parameter.id);

        // Fetch all commands for the header/command combination
        const commands = await dataService.getCommands({
          hdr: instance.hdr
        });

        // Format the command for matching
        const cmdFormatted = Object.entries(instance.cmd)
          .map(([key, value]) => `${key}${value}`)
          .join('');

        // Find the specific command that contains this parameter
        const matchingCommand = commands.find(cmd => {
          const cmdKeyFormatted = Object.entries(cmd.cmd)
            .map(([key, value]) => `${key}${value}`)
            .join('');
          return cmdKeyFormatted === cmdFormatted && cmd.hdr === instance.hdr;
        });

        if (matchingCommand) {
          setCommandData(matchingCommand);
        } else {
          console.error('Could not find matching command for parameter', parameter.id);
          // Create a simple command object with the parameter's instance data
          setCommandData({
            id: parameter.id,
            hdr: instance.hdr,
            cmd: instance.cmd,
            parameters: [instance],
            vehicles: parameter.vehicles || []
          });
        }
      } else {
        // If no instances, just set the parameter ID
        setExpandedParameterId(parameter.id);
      }
    } catch (err) {
      console.error('Error fetching command details', err);
      // Still expand the parameter even if command lookup fails
      setExpandedParameterId(parameter.id);
    }
  };

  // Define filter fields for the SearchFilter component
  const filterFields = [
    {
      name: 'query',
      label: 'Search Parameters',
      type: 'text',
      placeholder: 'Search by parameter ID or name...',
      className: 'flex-grow min-w-[250px]'
    },
    {
      name: 'metric',
      label: 'Suggested Metric',
      type: 'select',
      options: suggestedMetrics,
      className: 'w-full sm:w-auto'
    }
  ];

  // Custom columns with GitHub link action
  const columns = [
    {
      key: 'id',
      header: 'Parameter ID',
      sortable: true,
      cellClassName: 'font-medium text-gray-900'
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cellClassName: 'text-gray-900'
    },
    {
      key: 'suggestedMetric',
      header: 'Suggested Metric',
      render: (row) => row.suggestedMetric ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {row.suggestedMetric}
        </span>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )
    },
    {
      key: 'vehicleCount',
      header: 'Vehicles',
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            openGitHubRepo(row);
          }}
          className="text-gray-600 hover:text-primary-600"
          title="View on GitHub"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.606-.015 2.896-.015 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </button>
      )
    }
  ];

  // Render the parameter table with command details
  const renderParameterTable = (data) => (
    <ParameterTable
      parameters={data}
      page={page}
      rowsPerPage={rowsPerPage}
      columns={columns}
      expandedParameterId={expandedParameterId}
      commandData={commandData}
      onParameterClick={handleExpandParameter}
      showVehicles={true}
    />
  );

  return (
    <DataPageLayout
      title="OBD Parameters Database"
      description={`${displayedParameters.length} parameters found`}
      filters={filters}
      onFilterChange={handleFilterChange}
      filterFields={filterFields}
      loading={loading}
      error={error}
      data={displayedParameters}
      emptyTitle="No parameters found"
      emptyMessage="No parameters found matching the current filters."
      renderData={renderParameterTable}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
};

export default Parameters;
