// src/services/dataService.js
import axios from 'axios';

// Cache for data
let cachedMatrixData = null;
let isLoading = false;
let loadPromise = null;

/**
 * Transforms raw matrix data into more usable formats
 */
const transformData = (rawData) => {
  // Extract unique values
  const makes = [...new Set(rawData.map(item => item.make))].sort();
  const models = [...new Set(rawData.map(item => item.model))].sort();
  const headers = [...new Set(rawData.map(item => item.hdr))].sort();
  const parameterIds = [...new Set(rawData.map(item => item.id))].sort();
  const suggestedMetrics = [...new Set(rawData.flatMap(item =>
    item.suggestedMetric ? [item.suggestedMetric] : []
  ))].sort();

  // Create vehicle matrix
  const vehicles = makes.flatMap(make => {
    const makeModels = rawData
      .filter(item => item.make === make)
      .map(item => item.model);

    return [...new Set(makeModels)].sort().map(model => ({
      make,
      model,
      id: `${make}-${model}`
    }));
  });

  // Add special cases (if they exist in the data)
  // This could be adapted based on the actual structure of your data
  const specialCases = ['SAEJ1979'];
  specialCases.forEach(specialCase => {
    if (!vehicles.some(v => v.make === specialCase)) {
      // Check if there's any data for this special case
      const hasData = rawData.some(item =>
        item.make === specialCase || // If it's stored directly as make
        (item.specialCase && item.specialCase === specialCase) // Or if there's a specialCase field
      );

      if (hasData) {
        vehicles.push({
          make: specialCase,
          model: '',
          id: specialCase,
          isSpecialCase: true
        });
      }
    }
  });

  // Create parameter lookup by vehicle
  const parametersByVehicle = {};
  vehicles.forEach(vehicle => {
    if (vehicle.isSpecialCase) {
      // For special cases like SAEJ1979
      parametersByVehicle[vehicle.id] = rawData.filter(
        item => item.make === vehicle.make ||
               (item.specialCase && item.specialCase === vehicle.make)
      );
    } else {
      // For regular make-model vehicles
      parametersByVehicle[vehicle.id] = rawData.filter(
        item => item.make === vehicle.make && item.model === vehicle.model
      );
    }
  });

  // Create parameter lookup by special case
  const parametersBySpecialCase = {};
  specialCases.forEach(specialCase => {
    parametersBySpecialCase[specialCase] = rawData.filter(
      item => item.make === specialCase ||
             (item.specialCase && item.specialCase === specialCase)
    );
  });

  // Create parameter lookup by suggested metric
  const parametersByMetric = {};
  suggestedMetrics.forEach(metric => {
    parametersByMetric[metric] = rawData.filter(
      item => item.suggestedMetric === metric
    );
  });

  // Create command lookup
  const commands = {};
  rawData.forEach(item => {
    const cmdKey = Object.entries(item.cmd)
      .map(([key, value]) => `${key}${value}`)
      .join('');

    const commandId = `${item.hdr}_${cmdKey}`;

    if (!commands[commandId]) {
      commands[commandId] = {
        id: commandId,
        hdr: item.hdr,
        cmd: item.cmd,
        vehicles: new Set(),
        parameters: []
      };
    }

    // Add vehicle ID, handling special cases
    if (item.specialCase) {
      commands[commandId].vehicles.add(item.specialCase);
    } else {
      commands[commandId].vehicles.add(`${item.make}-${item.model}`);
    }

    // Add parameter if not already added (avoid duplicates)
    const paramExists = commands[commandId].parameters.some(
      param => param.id === item.id &&
              param.make === item.make &&
              param.model === item.model
    );

    if (!paramExists) {
      commands[commandId].parameters.push(item);
    }
  });

  // Convert Sets to Arrays for serialization
  Object.values(commands).forEach(cmd => {
    cmd.vehicles = [...cmd.vehicles];
    cmd.vehicleCount = cmd.vehicles.length;
  });

  // Group parameters by name
  const parametersByName = {};
  rawData.forEach(item => {
    if (!parametersByName[item.id]) {
      parametersByName[item.id] = {
        id: item.id,
        name: item.name,
        vehicles: new Set(),
        instances: []
      };
    }

    // Add vehicle ID, handling special cases
    if (item.specialCase) {
      parametersByName[item.id].vehicles.add(item.specialCase);
    } else {
      parametersByName[item.id].vehicles.add(`${item.make}-${item.model}`);
    }

    parametersByName[item.id].instances.push(item);
  });

  // Convert Sets to Arrays
  Object.values(parametersByName).forEach(param => {
    param.vehicles = [...param.vehicles];
    param.vehicleCount = param.vehicles.length;
    param.suggestedMetric = param.instances[0].suggestedMetric || null;
  });

  return {
    rawData,
    makes,
    models,
    headers,
    parameterIds,
    suggestedMetrics,
    vehicles,
    parametersByVehicle,
    parametersBySpecialCase,
    parametersByMetric,
    commands: Object.values(commands),
    parameters: Object.values(parametersByName)
  };
};

/**
 * Loads matrix data from the server or returns cached data
 */
const loadMatrixData = async () => {
  // If already loading, return the existing promise
  if (isLoading) {
    return loadPromise;
  }

  // If cached data exists, return it
  if (cachedMatrixData) {
    return cachedMatrixData;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // In a real implementation, we would load this from an API
      // For now, we'll simulate it with a short timeout
      const response = await axios.get('/data/matrix_data.json');
      const transformedData = transformData(response.data);

      // Cache the data
      cachedMatrixData = transformedData;
      isLoading = false;

      resolve(transformedData);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
};

/**
 * Searches parameters based on the given filters
 */
const searchParameters = async (filters) => {
  const data = await loadMatrixData();

  return data.parameters.filter(param => {
    // Filter by parameter ID/name
    if (filters.query && !param.id.toLowerCase().includes(filters.query.toLowerCase()) &&
        !param.name.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }

    // Filter by vehicle
    if (filters.vehicleId && !param.vehicles.includes(filters.vehicleId)) {
      return false;
    }

    // Filter by suggested metric
    if (filters.metric && param.suggestedMetric !== filters.metric) {
      return false;
    }

    return true;
  });
};

/**
 * Gets vehicles matching the given filters
 */
const getVehicles = async (filters = {}) => {
  const data = await loadMatrixData();

  return data.vehicles.filter(vehicle => {
    // Filter by make
    if (filters.make && vehicle.make !== filters.make) {
      return false;
    }

    // Filter by model (partial match)
    if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
    }

    return true;
  });
};

/**
 * Gets commands matching the given filters
 */
const getCommands = async (filters = {}) => {
  const data = await loadMatrixData();

  return data.commands.filter(command => {
    // Filter by header
    if (filters.hdr && command.hdr !== filters.hdr) {
      return false;
    }

    // Filter by vehicle
    if (filters.vehicleId && !command.vehicles.includes(filters.vehicleId)) {
      return false;
    }

    // Filter by parameter ID
    if (filters.parameterId) {
      const hasParameter = command.parameters.some(param =>
        param.id.toLowerCase().includes(filters.parameterId.toLowerCase())
      );
      if (!hasParameter) return false;
    }

    return true;
  });
};

/**
 * Gets all available makes
 */
const getMakes = async () => {
  const data = await loadMatrixData();
  return data.makes;
};

/**
 * Gets all parameters for a specific vehicle
 */
const getVehicleParameters = async (make, model) => {
  const data = await loadMatrixData();
  const vehicleId = `${make}-${model}`;

  return data.parametersByVehicle[vehicleId] || [];
};

/**
 * Gets parameters for special cases like SAEJ1979
 */
const getSpecialCaseParameters = async (specialCase) => {
  const data = await loadMatrixData();

  // First check if it's in our dedicated special case data structure
  if (data.parametersBySpecialCase && data.parametersBySpecialCase[specialCase]) {
    return data.parametersBySpecialCase[specialCase];
  }

  // As a fallback, check if there are any parameters with this make directly
  const makeParams = data.rawData.filter(item => item.make === specialCase);
  if (makeParams.length > 0) {
    return makeParams;
  }

  // If we can't find any parameters, return an empty array
  return [];
};

// Create a named export
const dataService = {
  loadMatrixData,
  searchParameters,
  getVehicles,
  getCommands,
  getMakes,
  getVehicleParameters,
  getSpecialCaseParameters
};

export default dataService;
