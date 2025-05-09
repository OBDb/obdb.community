// src/components/SignalDetails.js
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import BugIcon from './icons/BugIcon';

const SignalDetails = ({ signal }) => {
  if (!signal) return null;

  const renderProperty = (label, value, isCode = false) => {
    if (value === undefined || value === null) return null;

    return (
      <div className="mb-2">
        <span className="text-xs font-medium text-gray-700">{label}:</span>
        {isCode ? (
          <pre className="mt-1 text-xs bg-gray-50 p-1 rounded font-mono overflow-auto">
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
          </pre>
        ) : (
          <div className="text-xs text-gray-900">
            {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
          </div>
        )}
      </div>
    );
  };

  // Format the command for display
  const formatCommand = () => {
    if (!signal.cmd) return null;

    return Object.entries(signal.cmd)
      .map(([key, value]) => `${key}${value}`)
      .join('');
  };

  // Format scaling information in a readable way
  const formatScaling = () => {
    if (!signal.fmt) return null;

    const { min, max, mul, div, add, unit } = signal.fmt;

    const parts = [];
    if (min !== undefined && max !== undefined) {
      parts.push(`Range: ${min} to ${max}`);
    }

    const scaleParts = [];
    if (mul !== undefined) scaleParts.push(`× ${mul}`);
    if (div !== undefined) scaleParts.push(`÷ ${div}`);
    if (add !== undefined) scaleParts.push(`+ ${add}`);

    if (scaleParts.length) {
      parts.push(`Scaling: ${scaleParts.join(' ')}`);
    }

    if (unit) {
      parts.push(`Unit: ${unit}`);
    }

    return parts.join(' | ');
  };

  // Determine if this is a BMW vehicle
  const isBMW = signal.make && signal.make.toLowerCase() === 'bmw';

  // Get the appropriate ECU identifier
  const getEcuIdentifier = () => {
    if (isBMW && signal.eax) {
      return signal.eax;
    }
    return signal.hdr || '';
  };

  // Check if this parameter belongs to any signal groups
  const hasSignalGroups = signal.signalGroups && Array.isArray(signal.signalGroups) && signal.signalGroups.length > 0;

  return (
    <Card title="Signal Details" className="mb-4">
      <div className="p-4">
        <div className="flex flex-wrap items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900 mr-2">{signal.name}</h3>
          <div className="text-sm font-mono text-gray-600">{signal.id}</div>

          {signal.suggestedMetric && (
            <div className="ml-auto">
              <StatusBadge
                text={signal.suggestedMetric}
                variant="primary"
                size="md"
              />
            </div>
          )}
          {signal.debug && (
            <div className="ml-2">
              <StatusBadge
                text="Debugging"
                variant="debugging"
                size="sm"
                icon={<BugIcon className="h-3 w-3" />}
              />
            </div>
          )}
        </div>

        {signal.description && (
          <p className="text-sm text-gray-600 mb-4">{signal.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Signal Properties</h4>

            {renderProperty("Signal Type", signal.fmt?.unit)}
            {renderProperty("Bit Position", `${signal.bitOffset} to ${signal.bitOffset + signal.bitLength - 1}`)}
            {renderProperty("Bit Length", signal.bitLength)}
            {renderProperty("Scaling", formatScaling())}

            {signal.hidden && (
              <div className="mb-2">
                <StatusBadge
                  text="Hidden Signal"
                  variant="warning"
                  size="sm"
                />
              </div>
            )}

            {/* Signal Group Information */}
            {hasSignalGroups && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Signal Groups:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {signal.signalGroups.map((group, idx) => (
                    <div key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {group.name || group.id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Display ECU header and command information */}
            {(signal.hdr || signal.eax) && (
              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Command Invocation</h5>
                <div className="flex flex-col">
                  <div className="mb-1">
                    <span className="text-xs text-gray-500">ECU:</span>
                    <span className="text-xs font-mono font-medium ml-1">{getEcuIdentifier()}</span>
                    {isBMW && signal.eax && signal.hdr && (
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="font-medium">BMW Note:</span> Using extended address (eax) instead of header
                      </div>
                    )}
                  </div>
                  {signal.cmd && (
                    <div>
                      <span className="text-xs text-gray-500">Command:</span>
                      <span className="text-xs font-mono font-medium ml-1">{formatCommand()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SignalDetails;
