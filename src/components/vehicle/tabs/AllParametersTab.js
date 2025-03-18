// src/components/vehicle/tabs/AllParametersTab.js
import React from 'react';
import ParameterTable from '../../ParameterTable';
import ModelYearBadge from '../../ModelYearBadge';
import Card from '../../Card';

const AllParametersTab = ({
  filteredParams,
  expandedParameterId,
  commandData,
  handleExpandParameter,
  isBMW,
  groupedParameterIds = new Set(),
  onSignalGroupTabSelect,
  hasSignalGroups = false
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

  // Filter out parameters that belong to signal groups
  const ungroupedParams = filteredParams.filter(param => !groupedParameterIds.has(param.id));

  // Count the grouped parameters
  const groupedParamsCount = filteredParams.length - ungroupedParams.length;

  return (
    <div className="space-y-4">
      {/* Signal Groups Placeholder Card */}
      {hasSignalGroups && groupedParamsCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div>
            <div className="flex items-center">
              <svg className="h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-md font-medium text-blue-700">Signal Groups</h3>
            </div>
            <p className="mt-2 text-sm text-blue-600">
              {groupedParamsCount} parameter{groupedParamsCount !== 1 ? 's' : ''} {groupedParamsCount !== 1 ? 'are' : 'is'} part of signal groups.
              View them in the <button
                className="font-medium underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onSignalGroupTabSelect}
              >By Signal Group</button> tab.
            </p>
          </div>
        </Card>
      )}

      {/* Regular Parameter Table */}
      <ParameterTable
        parameters={ungroupedParams}
        columns={allParamsColumns}
        expandedParameterId={expandedParameterId}
        commandData={commandData}
        onParameterClick={handleExpandParameter}
        showPagination={false}
        showVehicles={false}
      />
    </div>
  );
};

export default AllParametersTab;
