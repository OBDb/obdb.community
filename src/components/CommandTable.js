// src/components/CommandTable.js
import React, { useState } from 'react';
import CommandDetailsPanel from './CommandDetailsPanel';

const CommandTable = ({
  commands,
  page,
  rowsPerPage,
  onCommandClick = null,
  expandedCommandId = null,
  showActions = true
}) => {
  const [expandedCommand, setExpandedCommand] = useState(expandedCommandId);
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Update internal state when props change
  React.useEffect(() => {
    if (expandedCommandId !== null) {
      setExpandedCommand(expandedCommandId);
    }
  }, [expandedCommandId]);

  const handleExpandCommand = (command) => {
    const commandId = command.id;
    if (onCommandClick) {
      onCommandClick(command);
    } else {
      setExpandedCommand(expandedCommand === commandId ? null : commandId);
      setSelectedSignal(null); // Reset selected signal when toggling command
    }
  };

  const handleSignalSelected = (signal) => {
    setSelectedSignal(signal);
  };

  const formatCommand = (cmd) => {
    return Object.entries(cmd)
      .map(([key, value]) => `${key}${value}`)
      .join(' ');
  };

  // Define columns for the table
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.vehicleCount} vehicles
        </span>
      )
    },
    {
      key: 'parameters',
      header: 'Parameters',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.parameters.length} parameters
        </span>
      )
    }
  ];

  return (
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
                    onClick={() => handleExpandCommand(command)}
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
                        <CommandDetailsPanel
                          command={command}
                          onSignalSelected={handleSignalSelected}
                          showVehicles={true}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            {commands.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-4 text-sm text-gray-500 text-center">
                  No commands found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommandTable;
