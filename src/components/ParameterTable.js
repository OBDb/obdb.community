// src/components/ParameterTable.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CommandDetailsPanel from './CommandDetailsPanel';
import SignalDetails from './SignalDetails';

const ParameterTable = ({
  parameters,
  page,
  rowsPerPage,
  columns: propColumns,
  expandedParameterId: propExpandedId = null,
  commandData: propCommandData = null,
  onParameterClick = null,
  showPagination = true,
  showVehicles = true
}) => {
  // Use prop values if provided, otherwise manage state internally
  const [expandedParameterId, setExpandedParameterId] = useState(propExpandedId);
  const [commandData, setCommandData] = useState(propCommandData);

  // Update internal state when props change
  React.useEffect(() => {
    if (propExpandedId !== undefined) {
      setExpandedParameterId(propExpandedId);
    }
    if (propCommandData !== undefined) {
      setCommandData(propCommandData);
    }
  }, [propExpandedId, propCommandData]);

  // Define default columns for the table
  const defaultColumns = [
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
        if (showVehicles && row.vehicles && row.vehicles.length > 0 && row.vehicles[0]) {
          const [make, model] = row.vehicles[0].split('-');
          return (
            <Link
              to={`/vehicles/${make}/${model}`}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-primary-100 hover:text-primary-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
              </svg>
              {make} {model}
            </Link>
          );
        } else {
          return <span className="text-xs text-gray-500">—</span>;
        }
      }
    }
  ];

  // Use the provided columns or the default ones
  const columns = propColumns || defaultColumns;

  const handleExpandParameter = (parameter) => {
    if (onParameterClick) {
      onParameterClick(parameter);
    } else {
      // If we don't have external control, manage state internally
      setExpandedParameterId(expandedParameterId === parameter.id ? null : parameter.id);

      // If we have command data passed in, use it, otherwise reset it
      if (!propCommandData) {
        setCommandData(null);
      }
    }
  };

  const displayParameters = showPagination && page !== undefined && rowsPerPage !== undefined
    ? parameters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : parameters;

  return (
    <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-compact">
          <thead>
            <tr className="bg-gray-50">
              {columns.map(column => (
                <th key={column.key} className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayParameters.map((parameter) => (
              <React.Fragment key={parameter.id}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === parameter.id ? 'bg-gray-50' : ''}`}
                  onClick={() => handleExpandParameter(parameter)}
                >
                  {columns.map((column) => (
                    <td key={`${parameter.id}-${column.key}`} className={`px-3 py-1.5 text-xs ${column.cellClassName || ''}`}>
                      {column.render ? column.render(parameter) : parameter[column.key]}
                    </td>
                  ))}
                </tr>
                {expandedParameterId === parameter.id && (
                  <tr>
                    <td colSpan={columns.length} className="px-0 py-0 border-t border-gray-100">
                      {/* If we have detailed command data, show the CommandDetailsPanel */}
                      {commandData ? (
                        <CommandDetailsPanel
                          command={commandData}
                          highlightedParameterId={parameter.id}
                          showVehicles={showVehicles}
                        />
                      ) : (
                        /* Otherwise just show the basic signal details */
                        <div className="p-3 bg-gray-50">
                          {parameter.hdr && parameter.cmd && (
                            <SignalDetails signal={{
                              ...parameter,
                              hdr: parameter.hdr,
                              cmd: parameter.cmd
                            }} />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {parameters.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-4 text-sm text-gray-500 text-center">
                  No parameters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParameterTable;
