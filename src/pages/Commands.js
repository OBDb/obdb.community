// src/pages/Commands.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import BitMappingVisualizer from '../components/BitMappingVisualizer';

const Commands = () => {
  const [commands, setCommands] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    hdr: '',
    parameterId: '',
  });
  const [expandedCommand, setExpandedCommand] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load matrix data
        const data = await dataService.loadMatrixData();
        setHeaders(data.headers);

        // Get commands with no filters initially
        const result = await dataService.getCommands({});
        setCommands(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load command data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchCommands = async () => {
      try {
        setLoading(true);
        const result = await dataService.getCommands(filters);
        setCommands(result);
        setPage(0); // Reset to first page when filters change
        setLoading(false);
      } catch (err) {
        setError('Error searching commands.');
        setLoading(false);
        console.error(err);
      }
    };

    searchCommands();
  }, [filters]);

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

  const handleExpandCommand = (commandId) => {
    setExpandedCommand(expandedCommand === commandId ? null : commandId);
    setSelectedSignal(null); // Reset selected signal when toggling command
  };

  const handleSignalSelected = (signal) => {
    setSelectedSignal(signal.id === selectedSignal?.id ? null : signal);
  };

  const formatCommand = (cmd) => {
    return Object.entries(cmd)
      .map(([key, value]) => `${key}${value}`)
      .join(' ');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">OBD Commands</h1>

      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-64">
            <label htmlFor="hdr" className="block text-sm font-medium text-gray-700 mb-1">
              ECU Header
            </label>
            <select
              id="hdr"
              name="hdr"
              value={filters.hdr}
              onChange={handleFilterChange}
              className="input text-sm py-1"
            >
              <option value="">All Headers</option>
              {headers.map(header => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            <label htmlFor="parameterId" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Parameter ID
            </label>
            <div className="relative">
              <input
                type="text"
                id="parameterId"
                name="parameterId"
                value={filters.parameterId}
                onChange={handleFilterChange}
                placeholder="Enter parameter ID..."
                className="input text-sm py-1 pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
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
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {commands.length} commands found
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-compact">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ECU Header
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Command
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Coverage
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameters
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commands
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((command) => (
                      <React.Fragment key={command.id}>
                        <tr
                          className={`hover:bg-gray-50 cursor-pointer ${expandedCommand === command.id ? 'bg-gray-50' : ''}`}
                          onClick={() => handleExpandCommand(command.id)}
                        >
                          <td className="px-3 py-2 text-xs font-mono font-medium text-gray-900">
                            {command.hdr}
                          </td>
                          <td className="px-3 py-2 text-xs font-mono text-gray-900">
                            {formatCommand(command.cmd)}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              command.vehicleCount > 5
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                              {command.vehicleCount} vehicles
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              command.parameters.length > 5
                              ? 'bg-secondary-100 text-secondary-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                              {command.parameters.length} parameters
                            </span>
                          </td>
                        </tr>
                        {expandedCommand === command.id && (
                          <tr>
                            <td colSpan="4" className="px-0 py-0 border-t border-gray-100">
                              <div className="p-3 bg-gray-50">
                                {/* Bit Mapping Visualization */}
                                {command.parameters.length > 0 && (
                                  <BitMappingVisualizer
                                    command={command}
                                    onBitSelected={handleSignalSelected}
                                  />
                                )}

                                <div className="mb-3">
                                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                                    Vehicles using this command:
                                  </h4>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {command.vehicles.slice(0, 12).map(vehicle => {
                                      const [make, model] = vehicle.split('-');
                                      return (
                                        <span key={vehicle} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                          {make} {model}
                                        </span>
                                      );
                                    })}
                                    {command.vehicles.length > 12 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                        +{command.vehicles.length - 12} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                                    Parameters:
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {command.parameters.map(param => (
                                      <div
                                        key={`${param.make}-${param.model}-${param.id}`}
                                        className={`text-xs p-1 rounded ${selectedSignal?.id === param.id ? 'bg-blue-50 border border-blue-200' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSignalSelected(param);
                                        }}
                                      >
                                        <span className="font-medium">{param.id}:</span> {param.name}
                                        <div className="text-gray-500 text-xs">
                                          Bits: {param.bitOffset}-{param.bitOffset + param.bitLength - 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  {commands.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-sm text-gray-500 text-center">
                        No commands found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {commands.length > 0 && (
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
                    disabled={page >= Math.ceil(commands.length / rowsPerPage) - 1}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page >= Math.ceil(commands.length / rowsPerPage) - 1
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
                        {Math.min((page + 1) * rowsPerPage, commands.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{commands.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div>
                      <label htmlFor="rows-per-page-desktop" className="text-xs text-gray-600">
                        Rows:
                      </label>
                      <select
                        id="rows-per-page-desktop"
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        className="ml-1 text-xs border-gray-300 rounded py-1"
                      >
                        {[10, 25, 50, 100].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

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
                      <button
                        onClick={() => handleChangePage(page + 1)}
                        disabled={page >= Math.ceil(commands.length / rowsPerPage) - 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page >= Math.ceil(commands.length / rowsPerPage) - 1
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

export default Commands;