// src/utils/parameterUtils.js

/**
 * Group parameters by ECU
 * @param {Array} parameters - List of parameters
 * @param {Array} ecuHeaders - List of ECU headers
 * @param {Boolean} isBMW - Whether the vehicle is a BMW
 * @returns {Object} Parameters grouped by ECU
 */
export const groupParametersByEcu = (parameters, ecuHeaders, isBMW) => {
  return ecuHeaders.reduce((acc, ecuId) => {
    // For BMW, group by extended address, for others group by header
    const paramsForEcu = isBMW
      ? parameters.filter(param => (param.eax || param.hdr) === ecuId)
      : parameters.filter(param => param.hdr === ecuId);

    if (paramsForEcu.length > 0) {
      acc[ecuId] = paramsForEcu;
    }
    return acc;
  }, {});
};

/**
 * Group parameters by suggested metric
 * @param {Array} parameters - List of parameters
 * @returns {Array} Array of [metricName, parameters] pairs
 */
export const groupParametersByMetric = (parameters) => {
  // Group parameters by suggested metric
  const paramsByMetric = parameters.reduce((acc, param) => {
    const metric = param.suggestedMetric || 'Other';
    if (!acc[metric]) acc[metric] = [];
    acc[metric].push(param);
    return acc;
  }, {});

  // Sort metrics (Other goes last)
  const metricGroups = Object.entries(paramsByMetric)
    .sort(([a], [b]) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

  return metricGroups;
};

/**
 * Filter parameters based on search query and year range
 * @param {Array} parameters - All parameters
 * @param {String} searchQuery - Search query string
 * @param {String} yearRangeFilter - Selected year range filter
 * @param {Object} paramsByYearRange - Parameters grouped by year range
 * @returns {Array} Filtered parameters
 */
export const filterParameters = (parameters, searchQuery, yearRangeFilter, paramsByYearRange) => {
  let filtered = parameters;

  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filtered = filtered.filter(param => {
      // Check if parameter ID matches
      if (param.id.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check if parameter name matches
      if (param.name.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check if command ID matches (if available)
      if (param.cmd) {
        const cmdFormatted = Object.entries(param.cmd)
          .map(([key, value]) => `${key}${value}`)
          .join('');
        const commandId = `${param.hdr}_${cmdFormatted}`;

        if (commandId.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      // Check if ECU header or extended address matches
      if (param.hdr && param.hdr.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (param.eax && param.eax.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check if unit or suggestedMetric matches
      if (param.unit && param.unit.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (param.suggestedMetric && param.suggestedMetric.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check for description match if available
      if (param.description && param.description.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    });
  }

  // Apply year range filter
  if (yearRangeFilter !== 'all' && paramsByYearRange[yearRangeFilter]) {
    // When filtering by year range, we use the pre-grouped parameters
    filtered = paramsByYearRange[yearRangeFilter];
  }

  return filtered;
};

/**
 * Process year ranges from parameters
 * @param {Array} parameters - List of parameters
 * @returns {Object} Processed year ranges and parameters by year range
 */
export const processYearRanges = (parameters) => {
  // Process model year data from parameters
  const yearRangesMap = {};
  parameters.forEach(param => {
    if (param.modelYears && param.modelYears.length === 2) {
      const startYear = param.modelYears[0];
      const endYear = param.modelYears[1];
      const key = `${startYear}-${endYear}`;

      if (!yearRangesMap[key]) {
        yearRangesMap[key] = {
          startYear,
          endYear,
          parameters: []
        };
      }

      yearRangesMap[key].parameters.push(param);
    }
  });

  // Convert to array and sort by start year
  const sortedYearRanges = Object.values(yearRangesMap)
    .sort((a, b) => a.startYear - b.startYear);

  // Also create a lookup of parameters by year range for filtering
  const paramsByYearRange = {};
  sortedYearRanges.forEach(range => {
    const key = `${range.startYear}-${range.endYear}`;
    paramsByYearRange[key] = range.parameters;
  });

  return {
    yearRanges: sortedYearRanges,
    paramsByYearRange
  };
};
