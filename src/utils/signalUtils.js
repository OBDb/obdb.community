// src/utils/signalUtils.js

/**
 * Generates a signature for a parameter based on its command definition
 * This helps identify the "same" signal across different vehicles
 */
export const generateSignalSignature = (param) => {
  if (!param) return '';

  // Start with ECU header
  let signature = param.hdr || '';

  // Add command details if available
  if (param.cmd) {
    signature += '|CMD:' + Object.entries(param.cmd)
      .map(([key, value]) => `${key}${value}`)
      .join('_');
  }

  // Add bit position information if available
  if (param.bitOffset !== undefined && param.bitLength !== undefined) {
    signature += `|BIT:${param.bitOffset}-${param.bitOffset + param.bitLength - 1}`;
  } else if (param.fmt && param.fmt.bix !== undefined && param.fmt.len !== undefined) {
    // Alternative bit location from fmt object
    signature += `|BIT:${param.fmt.bix}-${param.fmt.bix + param.fmt.len - 1}`;
  }

  // Add suggested metric if available (helps match semantically equivalent parameters)
  if (param.suggestedMetric) {
    signature += `|METRIC:${param.suggestedMetric}`;
  }

  return signature;
};

/**
 * Extracts bit information from a parameter
 */
export const extractBitInfo = (param) => {
  if (!param) return { bitOffset: undefined, bitLength: undefined };

  let bitOffset, bitLength;

  // Try to get from direct properties
  if (param.bitOffset !== undefined && param.bitLength !== undefined) {
    bitOffset = param.bitOffset;
    bitLength = param.bitLength;
  }
  // Try to get from fmt object
  else if (param.fmt && param.fmt.bix !== undefined && param.fmt.len !== undefined) {
    bitOffset = param.fmt.bix;
    bitLength = param.fmt.len;
  }

  return { bitOffset, bitLength };
};

/**
 * Normalizes a parameter name by removing vehicle-specific prefixes
 */
export const normalizeParameterName = (name, make, model) => {
  if (!name) return '';

  // Create patterns for common prefixes based on make/model
  const prefixes = [
    make,
    model,
    `${make}_${model}`,
    `${make}-${model}`,
    `${make}${model}`
  ].filter(Boolean)
   .map(prefix => prefix.toLowerCase());

  // Create a single regex to match any of the prefixes followed by a separator
  const prefixPattern = new RegExp(`^(${prefixes.join('|')})[\\_\\s\\-\\.]`, 'i');

  // Remove the prefix and separator if found
  return name.replace(prefixPattern, '');
};

// Create a named export
const signalUtils = {
  generateSignalSignature,
  extractBitInfo,
  normalizeParameterName
};

export default signalUtils;
