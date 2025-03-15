// src/components/vehicle/tabs/AllParametersTab.js
import React from 'react';
import ParameterTable from '../../ParameterTable';
import ModelYearBadge from '../../ModelYearBadge';

const AllParametersTab = ({
  filteredParams,
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
      key: 'modelYears',
      header: 'Years',
      render: (row) => row.modelYears ? (
        <ModelYearBadge years={row.modelYears} variant="primary" />
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )
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
    }
  ];

  return (
    <ParameterTable
      parameters={filteredParams}
      columns={allParamsColumns}
      expandedParameterId={expandedParameterId}
      commandData={commandData}
      onParameterClick={handleExpandParameter}
      showPagination={false}
      showVehicles={false}
    />
  );
};

export default AllParametersTab;
