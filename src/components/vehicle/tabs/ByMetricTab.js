// src/components/vehicle/tabs/ByMetricTab.js
import React from 'react';
import ParameterTable from '../../ParameterTable';
import ModelYearBadge from '../../ModelYearBadge';

const ByMetricTab = ({
  metricGroups,
  expandedParameterId,
  commandData,
  handleExpandParameter,
  isBMW
}) => {
  // Function to get ECU display value for BMW or non-BMW vehicles
  const getEcuValue = (param) => {
    if (isBMW && param.eax) {
      return param.eax;
    }
    return param.hdr || '';
  };

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
      key: 'modelYears',
      header: 'Years',
      render: (row) => row.modelYears ? (
        <ModelYearBadge years={row.modelYears} variant="primary" />
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

  return (
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
  );
};

export default ByMetricTab;
