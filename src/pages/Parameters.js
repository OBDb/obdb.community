// src/pages/Parameters.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">OBD Parameters Database</h1>

      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[250px]">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Search Parameters
            </label>
            <div className="relative">
              <input
                type="text"
                id="query"
                name="query"
                value={filters.query}
                onChange={handleFilterChange}
                placeholder="Search by parameter ID or name..."
                className="input text-sm py-1 pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
              Suggested Metric
            </label>
            <select
              id="metric"
              name="metric"
              value={filters.metric}
              onChange={handleFilterChange}
              className="input text-sm py-1"
            >
              <option value="">All Metrics</option>
              {suggestedMetrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-compact">
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleRequestSort('id')}
                    >
                      <div className="flex items-center">
                        Parameter ID
                        {orderBy === 'id' && (
                          <span className="ml-1">
                            {order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleRequestSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {orderBy === 'name' && (
                          <span className="ml-1">
                            {order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suggested Metric
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleRequestSort('vehicleCount')}
                    >
                      <div className="flex items-center">
                        Vehicles
                        {orderBy === 'vehicleCount' && (
                          <span className="ml-1">
                            {order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedParameters
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((param) => (
                      <tr key={param.id} className="hover:bg-gray-50">
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
                        <td className="px-3 py-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {param.vehicleCount}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <button
                            onClick={() => openGitHubRepo(param)}
                            className="text-gray-600 hover:text-primary-600"
                            title="View on GitHub"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  {displayedParameters.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-sm text-gray-500 text-center">
                        No parameters found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {displayedParameters.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === 0
                        ? 'text-gray-300 bg-gray-50'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= Math.ceil(displayedParameters.length / rowsPerPage) - 1}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page >= Math.ceil(displayedParameters.length / rowsPerPage) - 1
                        ? 'text-gray-300 bg-gray-50'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {page * rowsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min((page + 1) * rowsPerPage, displayedParameters.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{displayedParameters.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handleChangePage(page - 1)}
                        disabled={page === 0}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 0
                            ? 'text-gray-300'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {/* Page number buttons - show up to 5 pages */}
                      {[...Array(Math.min(5, Math.ceil(displayedParameters.length / rowsPerPage))).keys()]
                        .map(i => {
                          // Show pages around current page
                          let pageNum = page;
                          if (page < 2) pageNum = i; // At start
                          else if (page >= Math.ceil(displayedParameters.length / rowsPerPage) - 3)
                            pageNum = Math.ceil(displayedParameters.length / rowsPerPage) - 5 + i; // At end
                          else pageNum = page - 2 + i; // In the middle

                          // Ensure page is in range
                          if (pageNum < 0 || pageNum >= Math.ceil(displayedParameters.length / rowsPerPage))
                            return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleChangePage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                page === pageNum
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } text-sm font-medium`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                      <button
                        onClick={() => handleChangePage(page + 1)}
                        disabled={page >= Math.ceil(displayedParameters.length / rowsPerPage) - 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page >= Math.ceil(displayedParameters.length / rowsPerPage) - 1
                            ? 'text-gray-300'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Parameters;