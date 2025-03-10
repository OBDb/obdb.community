// src/components/CommandDetailsPanel.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BitMappingVisualizer from './BitMappingVisualizer';
import StatusBadge from './StatusBadge';

const CommandDetailsPanel = ({
  command,
  highlightedParameterId = null,
  showVehicles = true,
  onSignalSelected = null
}) => {
  const [selectedSignal, setSelectedSignal] = useState(null);

  const handleSignalSelected = (signal) => {
    // Update local state
    setSelectedSignal(signal.id === selectedSignal?.id ? null : signal);

    // Call parent handler if provided
    if (onSignalSelected) {
      onSignalSelected(signal.id === selectedSignal?.id ? null : signal);
    }
  };

  // If a parameter ID is highlighted (e.g., when coming from Parameters page)
  // initialize the selected signal
  React.useEffect(() => {
    if (highlightedParameterId && command.parameters.length > 0) {
      const paramToHighlight = command.parameters.find(p => p.id === highlightedParameterId);
      if (paramToHighlight) {
        setSelectedSignal(paramToHighlight);
      }
    }
  }, [highlightedParameterId, command.parameters]);

  return (
    <div className="p-3 bg-gray-50">
      {/* Bit Mapping Visualization */}
      {command.parameters.length > 0 && (
        <BitMappingVisualizer
          command={command}
          onBitSelected={handleSignalSelected}
        />
      )}

      {/* Vehicles using this command - conditionally shown based on prop */}
      {showVehicles && command.vehicles && command.vehicles.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            Vehicles using this command:
          </h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {command.vehicles.slice(0, 12).map(vehicle => {
              const [make, model] = vehicle.split('-');
              return (
                <Link to={`/vehicles/${make}/${model}`} key={vehicle}>
                  <StatusBadge
                    text={`${make} ${model}`}
                    variant="default"
                    rounded="md"
                  />
                </Link>
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
      )}

      {/* Parameters section */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2">
          Parameters:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {command.parameters.map(param => (
            <div
              key={`${param.make}-${param.model}-${param.id}`}
              className={`text-xs p-2 rounded cursor-pointer
                ${selectedSignal?.id === param.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSignalSelected(param);
              }}
            >
              <span className="font-medium">{param.id}:</span> {param.name}
              <div className="text-gray-500 text-xs">
                Bits: {param.bitOffset}-{param.bitOffset + param.bitLength - 1}
              </div>
              {param.suggestedMetric && (
                <div className="mt-1">
                  <StatusBadge
                    text={param.suggestedMetric}
                    variant="primary"
                    size="sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandDetailsPanel;
