// src/components/vehicle/tabs/ByEcuTab.js
import React from 'react';
import ParameterTable from '../../ParameterTable';
import ModelYearBadge from '../../ModelYearBadge';

const ByEcuTab = ({
  paramsByEcu,
  expandedParameterId,
  commandData,
  handleExpandParameter
}) => {
  // Columns for the ECU tab (no ECU column needed)
  const ecuParamsColumns = [
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
      render: (row) => row.suggestedMetric || '—'
    }
  ];

  return (
    <div>
      {Object.entries(paramsByEcu).map(([ecuId, ecuParams]) => (
        ecuParams.length > 0 && (
          <div key={ecuId} className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 font-mono">
                {ecuId}
              </h3>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {ecuParams.length} parameters
              </span>
            </div>
            <ParameterTable
              parameters={ecuParams}
              columns={ecuParamsColumns}
              expandedParameterId={expandedParameterId}
              commandData={commandData}
              onParameterClick={handleExpandParameter}
              showPagination={false}
              showVehicles={false}
            />
          </div>
        )
      ))}
      {Object.values(paramsByEcu).every(group => group.length === 0) && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">
            No parameters found matching the search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ByEcuTab;
