// src/pages/Commands.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import BitMappingVisualizer from '../components/BitMappingVisualizer';
import TablePagination from '../components/TablePagination';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';

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

  // Define filter fields for the SearchFilter component
  const filterFields = [
    {
      name: 'hdr',
      label: 'ECU Header',
      type: 'select',
      options: headers,
      className: 'w-full sm:w-64'
    },
    {
      name: 'parameterId',
      label: 'Filter by Parameter ID',
      type: 'text',
      placeholder: 'Enter parameter ID...',
      className: 'flex-grow'
    }
  ];

  // Define columns for the DataTable component
  const columns = [
    {
      key: 'hdr',
      header: 'ECU Header',
      cellClassName: 'font-mono font-medium text-gray-900'
    },
    {
      key: 'cmd',
      header: 'Command',
      render: (row) => formatCommand(row.cmd),
      cellClassName: 'font-mono text-gray-900'
    },
    {
      key: 'vehicleCount',
      header: 'Vehicle Coverage',
      render: (row) => (
        <StatusBadge
          text={`${row.vehicleCount} vehicles`}
          variant={row.vehicleCount > 5 ? 'primary' : 'default'}
        />
      )
    },
    {
      key: 'parameters',
      header: 'Parameters',
      render: (row) => (
        <StatusBadge
          text={`${row.parameters.length} parameters`}
          variant={row.parameters.length > 5 ? 'secondary' : 'default'}
        />
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="OBD Commands"
        description={!loading && !error && `${commands.length} commands found`}
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
          {commands.length === 0 ? (
            <EmptyState
              title="No commands found"
              message="No commands found matching the current filters."
            />
          ) : (
            <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-compact">
                  <thead>
                    <tr className="bg-gray-50">
                      {columns.map(column => (
                        <th key={column.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.header}
                        </th>
                      ))}
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
                            {columns.map((column) => (
                              <td key={column.key} className={`px-3 py-2 text-xs ${column.cellClassName || ''}`}>
                                {column.render ? column.render(command) : command[column.key]}
                              </td>
                            ))}
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
                                          <StatusBadge
                                            key={vehicle}
                                            text={`${make} ${model}`}
                                            variant="default"
                                            rounded="md"
                                          />
                                        );
                                      })}
                                      {command.vehicles.length > 12 && (
                                        <StatusBadge
                                          text={`+${command.vehicles.length - 12} more`}
                                          variant="default"
                                          rounded="md"
                                        />
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
                  </tbody>
                </table>
              </div>

              {commands.length > 0 && (
                <TablePagination
                  totalItems={commands.length}
                  itemsPerPage={rowsPerPage}
                  currentPage={page}
                  onPageChange={setPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Commands;
