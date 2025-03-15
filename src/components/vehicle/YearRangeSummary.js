// src/components/vehicle/YearRangeSummary.js
import React from 'react';
import Card from '../Card';
import ModelYearBadge from '../ModelYearBadge';
import StatusBadge from '../StatusBadge';

const YearRangeSummary = ({ yearRanges, ecuHeaders, isBMW }) => {
  if (yearRanges.length === 0) {
    return null;
  }

  return (
    <Card title="Available Signalsets">
      <div className="p-4">
        <div className="space-y-4">
          {yearRanges.map((yearRange, idx) => (
            <div key={idx} className="border-b pb-3 last:border-b-0">
              <div className="flex items-center">
                <ModelYearBadge
                  years={[yearRange.startYear, yearRange.endYear]}
                  variant="primary"
                  className="mr-2"
                />
                <StatusBadge
                  text={`${yearRange.parameters.length} parameters`}
                  variant="secondary"
                  size="sm"
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ecuHeaders.filter(ecuId => {
                    // For BMW, filter by extended address, for others filter by header
                    const ecuParams = isBMW
                      ? yearRange.parameters.filter(param => (param.eax || param.hdr) === ecuId)
                      : yearRange.parameters.filter(param => param.hdr === ecuId);
                    return ecuParams.length > 0;
                  }).slice(0, 5).map(ecuId => (
                    <div key={ecuId} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      <span className="font-mono">{ecuId}</span>
                    </div>
                  ))}
                  {ecuHeaders.length > 5 && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      +{ecuHeaders.length - 5} more ECUs
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default YearRangeSummary;
