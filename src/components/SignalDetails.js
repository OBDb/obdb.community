// src/components/SignalDetails.js
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';

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
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Technical Details</h4>
            {renderProperty("Format Configuration", signal.fmt, true)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SignalDetails;
