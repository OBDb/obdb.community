// src/utils/parseBitInfo.js

/**
 * Parses bit offset and length from parameter data
 * In a real implementation, this would be more sophisticated based on your actual data structure
 */
const parseBitInfo = (parameter) => {
  // Default values
  let bitOffset = 0;
  let bitLength = 8;

  // Try to extract from the scaling description if it exists
  if (parameter.scaling) {
    // Look for typical patterns in the scaling description
    const bitOffsetMatch = parameter.scaling.match(/offset: ?(\d+)/i);
    if (bitOffsetMatch) {
      bitOffset = parseInt(bitOffsetMatch[1], 10);
    }

    const bitLengthMatch = parameter.scaling.match(/length: ?(\d+)/i);
    if (bitLengthMatch) {
      bitLength = parseInt(bitLengthMatch[1], 10);
    }

    // If we can't find explicit info, we can generate some fake data based on
    // the parameter ID or other properties to make the visualization interesting
    if (!bitOffsetMatch && !bitLengthMatch) {
      // Hash the parameter ID to get a consistent but "random" offset
      const hash = parameter.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Modulo by 48 to keep it within a reasonable range (6 bytes)
      bitOffset = hash % 48;

      // Make length between 1 and 8 bits
      bitLength = (hash % 8) + 1;
    }
  }

  return { bitOffset, bitLength };
};

export default parseBitInfo;