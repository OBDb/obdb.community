// src/components/vehicle/tabs/BySignalGroupTab.js
import React, { useState } from 'react';
import ParameterTable from '../../ParameterTable';
import StatusBadge from '../../StatusBadge';
import Card from '../../Card';

const BySignalGroupTab = ({
  signalGroups,
  expandedParameterId,
  commandData,
  handleExpandParameter,
  isBMW
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Function to get ECU display value for BMW or non-BMW vehicles
  const getEcuValue = (param) => {
    if (isBMW && param.eax) {
      return param.eax;
    }
    return param.hdr || '';
  };

  // Toggle a group's expanded state
  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Columns for the Signal Group tab
  const groupParamsColumns = [
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {row.modelYears[0]}-{row.modelYears[1]}
        </span>
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

  // If there are no signal groups, show a message
  if (Object.keys(signalGroups).length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500">
          No signal groups defined for this vehicle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(signalGroups).map(([groupId, group]) => (
        <Card key={groupId} className="overflow-hidden">
          {/* Group Header with toggle */}
          <div
            className="p-4 bg-blue-50 border-b border-blue-200 cursor-pointer hover:bg-blue-100"
            onClick={() => toggleGroupExpanded(groupId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 text-gray-500 mr-2 transition-transform ${expandedGroups[groupId] ? 'transform rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h3 className="text-lg font-medium">{group.name || groupId}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {group.suggestedMetricGroup && (
                  <StatusBadge
                    text={group.suggestedMetricGroup}
                    variant="primary"
                    size="sm"
                    className="mr-2"
                  />
                )}
                <StatusBadge
                  text={`${group.parameters.length} parameters`}
                  variant="secondary"
                  size="sm"
                />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {group.path && <div>Path: {group.path}</div>}
              {group.matchingRegex && <div>Pattern: {group.matchingRegex}</div>}
            </div>
          </div>

          {/* Group Parameters (conditionally rendered) */}
          {expandedGroups[groupId] && (
            <div className="p-4">
              <ParameterTable
                parameters={group.parameters}
                columns={groupParamsColumns}
                expandedParameterId={expandedParameterId}
                commandData={commandData}
                onParameterClick={handleExpandParameter}
                showPagination={false}
                showVehicles={false}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default BySignalGroupTab;
