// src/utils/vehicleSymbolMap.js

/**
 * Maps vehicle make/model names to their corresponding SVG filenames
 * Used when the standard naming convention doesn't match the actual SVG files
 */

// Default mappings that will be used if the JSON file can't be loaded
let makeSymbolMap = {
  "bmw": "bmw",
  "mercedes-benz": "mercedes",
  "chevrolet": "chevy",
  "vw": "volkswagen"
};

let modelSymbolMap = {
  "bmw:330i": "3series",
  "tesla:model 3": "model3"
};

// Load mappings from JSON file
const loadMappingsFromJson = async () => {
  try {
    const response = await fetch('/data/vehicle_symbols.json');
    if (!response.ok) {
      console.warn('Could not load vehicle symbol mappings. Using defaults.');
      return;
    }

    const data = await response.json();

    if (data.makeSymbols && Object.keys(data.makeSymbols).length > 0) {
      makeSymbolMap = data.makeSymbols;
    }

    if (data.modelSymbols && Object.keys(data.modelSymbols).length > 0) {
      modelSymbolMap = data.modelSymbols;
    }

    console.log('Loaded vehicle symbol mappings successfully.');
  } catch (error) {
    console.warn('Error loading vehicle symbol mappings:', error);
  }
};

// Call this immediately to load mappings as soon as possible
loadMappingsFromJson();

// Export the maps for external use
export { makeSymbolMap, modelSymbolMap };

/**
 * Gets the correct SVG filename for a vehicle make
 * @param {string} make - The vehicle make (e.g., "BMW", "Mercedes-Benz")
 * @returns {string} - The correct filename for the SVG
 */
export const getMakeSvgFilename = (make) => {
  if (!make) return '';

  const makeLower = make.toLowerCase();
  return makeSymbolMap[makeLower] || makeLower;
};

/**
 * Gets the correct SVG filename for a vehicle model
 * @param {string} make - The vehicle make (e.g., "BMW", "Mercedes-Benz")
 * @param {string} model - The vehicle model (e.g., "330i", "Model 3")
 * @returns {string} - The correct filename for the SVG
 */
export const getModelSvgFilename = (make, model) => {
  if (!make || !model) return '';

  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();

  // Check if we have a specific mapping for this make:model combination
  const mapKey = `${makeLower}:${modelLower}`;
  if (modelSymbolMap[mapKey]) {
    return modelSymbolMap[mapKey];
  }

  // Default sanitization (same as current logic)
  return modelLower.replace(/\s+/g, '').replace(/-/g, '');
};

/**
 * Gets the full SVG URL for a vehicle make
 * @param {string} make - The vehicle make
 * @returns {string} - The full URL to the SVG
 */
export const getMakeSvgUrl = (make) => {
  const filename = getMakeSvgFilename(make);
  return `https://raw.githubusercontent.com/ClutchEngineering/sidecar.clutch.engineering/main/site/gfx/make/${filename}.svg`;
};

/**
 * Gets the full SVG URL for a vehicle model
 * @param {string} make - The vehicle make
 * @param {string} model - The vehicle model
 * @returns {string} - The full URL to the SVG
 */
export const getModelSvgUrl = (make, model) => {
  const filename = getModelSvgFilename(make, model);
  return `https://raw.githubusercontent.com/ClutchEngineering/sidecar.clutch.engineering/main/site/gfx/model/${filename}.svg`;
};

// Export as default object for convenience
export default {
  makeSymbolMap,
  modelSymbolMap,
  getMakeSvgFilename,
  getModelSvgFilename,
  getMakeSvgUrl,
  getModelSvgUrl
};
