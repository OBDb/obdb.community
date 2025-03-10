// src/pages/Parameters.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dataService from '../services/dataService';
import TablePagination from '../components/TablePagination';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';

const Parameters = () => {
  const [parameters, setParameters] = useState([]);
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
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load matrix data
        const data = await dataService.loadMatrixData();
        setSuggestedMetrics(data.suggestedMetrics);

        // Search parameters with no filters initially
        const result = await dataService.searchParameters({});
        setParameters(result);

        // Sort the parameters by ID initially
        const sortedResult = sortParameters(result, 'id', 'asc');
        setDisplayedParameters(sortedResult);

        setLoading(false);
      } catch (err) {
        setError('Failed to load parameter data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchParams = async () => {
      try {
        setLoading(true);
        const result = await dataService.searchParameters(filters);
        setParameters(result);

        // Apply current sorting to the filtered results
        const sortedResult = sortParameters(result, orderBy, order);
        setDisplayedParameters(sortedResult);

        setPage(0); // Reset to first page when filters change
        setLoading(false);
      } catch (err) {
        setError('Error searching parameters.');
        setLoading(false);
        console.error(err);
      }
    };

    searchParams();
  }, [filters]);

  const sortParameters = (params, property, direction) => {
    const stabilizedThis = params.map((item, index) => [item, index]);
    const sortedArray = stabilizedThis.sort((a, b) => {
      const aValue = a[0][property];
      const bValue = b[0][property];

      const compareResult =
        typeof aValue === 'string' && typeof bValue === 'string'
          ? aValue.localeCompare(bValue)
          : (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);

      return direction === 'asc' ? compareResult : -compareResult;
    });

    return stabilizedThis.map((el) => el[0]);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);

    // Apply sorting to parameters
    const sortedParams = sortParameters(parameters, property, newOrder);
    setDisplayedParameters(sortedParams);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
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

  // Define columns for the DataTable component
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
        <StatusBadge
          text={row.suggestedMetric}
          variant="primary"
        />
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )
    },
    {
      key: 'vehicleCount',
      header: 'Vehicles',
      sortable: true,
      render: (row) => {
        if (row.vehicles.length > 0 && row.vehicles[0]) {
          const [make, model] = row.vehicles[0].split('-');
          return (
            <Link
              to={`/vehicles/${make}/${model}`}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-primary-100 hover:text-primary-800 transition-colors"
            >
              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
              </svg>
              {make} {model}
            </Link>
          );
        } else {
          return <span className="text-xs text-gray-500">No vehicle</span>;
        }
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <button
          onClick={() => openGitHubRepo(row)}
          className="text-gray-600 hover:text-primary-600"
          title="View on GitHub"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="OBD Parameters Database"
        description={!loading && !error && `${displayedParameters.length} parameters found`}
      />

      <SearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        className="mb-6"
      />

      {loading ? (
        <LoadingSpinner size="md" centered={true} />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div>
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
              <div className="text-sm text-gray-600">
                {displayedParameters.length} parameters found
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="rows-per-page" className="text-xs text-gray-600">
                  Rows per page:
                </label>
                <select
                  id="rows-per-page"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="text-xs border-gray-300 rounded"
                >
                  {[10, 25, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={displayedParameters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
              emptyMessage="No parameters found matching the current filters."
              sortConfig={{ key: orderBy, direction: order }}
              onSort={handleRequestSort}
              isCompact={true}
            />

            {displayedParameters.length > 0 && (
              <TablePagination
                totalItems={displayedParameters.length}
                itemsPerPage={rowsPerPage}
                currentPage={page}
                onPageChange={setPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Parameters;
