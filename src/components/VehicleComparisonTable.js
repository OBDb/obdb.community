// src/components/VehicleComparisonTable.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import signalUtils from '../utils/signalUtils';

const VehicleComparisonTable = ({ vehicles, parameters, onClose, onChangeVehicles, onAddVehicle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParameterId, setExpandedParameterId] = useState(null);
  const [filterByCommon, setFilterByCommon] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // Whether to show parameter IDs under badges
  const [showParamTransferModal, setShowParamTransferModal] = useState(false);
  const [selectedParamsForTransfer, setSelectedParamsForTransfer] = useState([]);
  const [targetVehiclesForTransfer, setTargetVehiclesForTransfer] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const [selectedVehicleTab, setSelectedVehicleTab] = useState(null);

  // Convert a scaling string to a proper fmt object
  const convertScalingStringToFmtObject = (scalingString) => {
    if (!scalingString || typeof scalingString !== 'string') {
      return { len: 8 }; // Default format
    }

    // Initialize the fmt object with default length
    const fmt = { len: 8 };

    // Parse the scaling string
    // Example: "raw*100 /255 clamped to [100]"
    // Example: "raw/58 +-0.5 clamped to [4]"
    // Example: "raw*1.28 clamped to [326]"

    if (scalingString.includes('*')) {
      const mulMatch = scalingString.match(/raw\s*\*\s*([\d.]+)/);
      if (mulMatch) {
        fmt.mul = parseFloat(mulMatch[1]);
      }
    }

    if (scalingString.includes('/')) {
      const divMatch = scalingString.match(/raw\s*\/\s*([\d.]+)/);
      if (divMatch) {
        fmt.div = parseFloat(divMatch[1]);
      }
    }

    // Check for clamping to derive max value
    const clampMatch = scalingString.match(/clamped to \[([\d.]+)\]/);
    if (clampMatch) {
      fmt.max = parseFloat(clampMatch[1]);
    }

    // Check for unit
    const unitMatch = scalingString.match(/\b(kph|mph|percent|celsius|volts|degrees|ohms|amps|grams)\b/i);
    if (unitMatch) {
      fmt.unit = unitMatch[1].toLowerCase();
    }

    return fmt;
  };

  // Get all unique parameters across all vehicles
  const allParams = new Map();

  // Group parameters by signal signature
  parameters.forEach((vehicleParams, vehicleIndex) => {
    // Add safety check to ensure vehicle exists at this index
    if (vehicles[vehicleIndex]) {
      vehicleParams.forEach(param => {
        const signature = signalUtils.generateSignalSignature(param);
        const normalizedName = signalUtils.normalizeParameterName(
          param.name,
          vehicles[vehicleIndex].make,
          vehicles[vehicleIndex].model
        );

        if (!allParams.has(signature)) {
          // Create a new entry with a representative ID and name
          allParams.set(signature, {
            signature,
            id: param.id, // Use the first found ID as representative
            name: normalizedName,
            vehicles: Array(vehicles.length).fill(null),
            // Store original parameters for each vehicle for reference
            originalParams: Array(vehicles.length).fill(null)
          });
        }

        // Store parameter for this vehicle
        allParams.get(signature).vehicles[vehicleIndex] = param;
        allParams.get(signature).originalParams[vehicleIndex] = param;
      });
    }
  });

  // Convert map to array and apply filters
  let displayParams = Array.from(allParams.values()).filter(param => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      // Search in representative ID and name
      if (param.id.toLowerCase().includes(query) || param.name.toLowerCase().includes(query)) {
        return true;
      }

      // Also search in all vehicle-specific parameter IDs and names
      for (const vehicleParam of param.vehicles) {
        if (vehicleParam && (
            vehicleParam.id.toLowerCase().includes(query) ||
            vehicleParam.name.toLowerCase().includes(query)
          )) {
          return true;
        }
      }

      return false;
    }
    return true;
  });

  // Apply common parameters filter
  if (filterByCommon) {
    displayParams = displayParams.filter(param =>
      param.vehicles.every(vehicle => vehicle !== null)
    );
  }

  // Sort parameters
  displayParams.sort((a, b) => {
    // Sort by availability (common parameters first)
    const aAvailableCount = a.vehicles.filter(v => v !== null).length;
    const bAvailableCount = b.vehicles.filter(v => v !== null).length;

    if (bAvailableCount !== aAvailableCount) {
      return bAvailableCount - aAvailableCount;
    }

    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Toggle parameter expansion
  const toggleParameter = (paramSignature) => {
    setExpandedParameterId(expandedParameterId === paramSignature ? null : paramSignature);
  };

  // Open parameter transfer modal for multiple parameters
  const openParamTransferModal = () => {
    setShowParamTransferModal(true);
    setTargetVehiclesForTransfer([]);
    setGeneratedCode('');
    setShowGeneratedCode(false);
    setSelectedVehicleTab(null);
  };

  // Close parameter transfer modal
  const closeParamTransferModal = () => {
    setShowParamTransferModal(false);
    setSelectedParamsForTransfer([]);
    setTargetVehiclesForTransfer([]);
    setGeneratedCode('');
    setShowGeneratedCode(false);
    setSelectedVehicleTab(null);
  };

  // Toggle parameter selection for transfer
  const toggleParamSelection = (param) => {
    const paramSignature = param.signature;
    if (selectedParamsForTransfer.some(p => p.signature === paramSignature)) {
      setSelectedParamsForTransfer(selectedParamsForTransfer.filter(p => p.signature !== paramSignature));
    } else {
      setSelectedParamsForTransfer([...selectedParamsForTransfer, param]);
    }
  };

  // Toggle target vehicle selection for parameter transfer
  const toggleTargetVehicle = (index) => {
    if (targetVehiclesForTransfer.includes(index)) {
      setTargetVehiclesForTransfer(targetVehiclesForTransfer.filter(i => i !== index));
    } else {
      setTargetVehiclesForTransfer([...targetVehiclesForTransfer, index]);
    }
  };

  // Generate formatted parameter data based on user's selection
  const handleGenerateParameterData = () => {
    if (selectedParamsForTransfer.length === 0 || targetVehiclesForTransfer.length === 0) {
      return;
    }

    // Track which parameters are new for color highlighting
    const newParameterIds = new Set();

    // Process each target vehicle
    const vehicleData = targetVehiclesForTransfer.map(vehicleIndex => {
      // Get the actual vehicle object using the index
      const targetVehicle = vehicles[vehicleIndex];
      const targetMake = targetVehicle.make;
      const targetModel = targetVehicle.model;

      // Group parameters by command to maintain OBDb structure
      const commandGroups = {};

      // First, add all existing parameters for this vehicle
      parameters[vehicleIndex]?.forEach(existingParam => {
        // Get command key to group parameters
        const paramHdr = existingParam.hdr || '';
        const paramCmd = typeof existingParam.cmd === 'object' ? Object.entries(existingParam.cmd)[0].join('-') : '';
        const groupKey = `${paramHdr}-${paramCmd}`;

        // Create new command group if doesn't exist
        if (!commandGroups[groupKey]) {
          const commandProps = {
            hdr: paramHdr,
            cmd: existingParam.cmd,
            freq: existingParam.freq || 0.5
          };

          // Add any extra command-level properties that exist
          if (existingParam.rax) commandProps.rax = existingParam.rax;
          if (existingParam.eax) commandProps.eax = existingParam.eax;
          if (existingParam.tst) commandProps.tst = existingParam.tst;
          if (existingParam.fcm1) commandProps.fcm1 = existingParam.fcm1;
          if (existingParam.dbg) commandProps.dbg = existingParam.dbg;

          commandGroups[groupKey] = {
            ...commandProps,
            signals: []
          };
        }

        // Clean up the parameter for JSON
        const {
          // Remove metadata
          vehicleMake, vehicleModel, bitOffset, bitLength,
          // Remove command-level properties
          hdr: signalHdr, cmd: signalCmd, freq: signalFreq,
          rax: signalRax, eax: signalEax, tst: signalTst, fcm1: signalFcm1, dbg: signalDbg,
          // Remove non-standard properties
          make, model, pid, scaling,
          ...signalProps
        } = existingParam;

        // Add to appropriate command group
        commandGroups[groupKey].signals.push(signalProps);
      });

      // Then, process each selected parameter to add
      selectedParamsForTransfer.forEach(param => {
        // Skip if the parameter already exists for this vehicle
        if (param.vehicles[vehicleIndex] !== null) return;

        // Find the original parameter data from a vehicle that has it
        const sourceVehicleIndex = param.vehicles.findIndex(p => p !== null);
        if (sourceVehicleIndex === -1) return; // Skip if no source vehicle has this parameter

        const originalParam = param.originalParams[sourceVehicleIndex];
        if (!originalParam) return;

        // Create a copy of the parameter to manipulate
        let paramData = JSON.parse(JSON.stringify(originalParam));

        // Get command key to group parameters
        const paramHdr = paramData.hdr || '';
        const paramCmd = typeof paramData.cmd === 'object' ? Object.entries(paramData.cmd)[0].join('-') : '';
        const groupKey = `${paramHdr}-${paramCmd}`;

        // Mark this parameter as new for highlighting
        const adjustedParamId = paramData.id.replace(/^[^_]+/, targetModel);
        newParameterIds.add(adjustedParamId);

        // Change the parameter ID to match the target vehicle's model
        paramData.id = adjustedParamId;

        // Create new command group if doesn't exist
        if (!commandGroups[groupKey]) {
          // We don't need to use these variables, but we're extracting them to show what properties we're preserving
          // eslint-disable-next-line no-unused-vars
          const { hdr, cmd, freq, rax, eax, tst, fcm1, dbg } = paramData;

          const commandProps = {
            hdr: paramHdr,
            cmd: paramData.cmd,
            freq: paramData.freq || 0.5
          };

          // Add any extra command-level properties that exist
          if (rax) commandProps.rax = rax;
          if (eax) commandProps.eax = eax;
          if (tst) commandProps.tst = tst;
          if (fcm1) commandProps.fcm1 = fcm1;
          if (dbg) commandProps.dbg = dbg;

          commandGroups[groupKey] = {
            ...commandProps,
            signals: []
          };
        }

        // Clean up the parameter for JSON
        const {
          // Remove metadata
          __isNewParameter, __targetMake, __targetModel, __sourceMake, __sourceModel, __sourceId,
          vehicleMake, vehicleModel, bitOffset, bitLength,
          // Remove command-level properties
          hdr: signalHdr, cmd: signalCmd, freq: signalFreq,
          rax: signalRax, eax: signalEax, tst: signalTst, fcm1: signalFcm1, dbg: signalDbg,
          // Remove non-standard properties
          make, model, pid, scaling,
          ...signalProps
        } = paramData;

        // Remove any properties that start with __ (metadata markers)
        const cleanSignalProps = Object.entries(signalProps).reduce((acc, [key, value]) => {
          if (!key.startsWith('__')) {
            acc[key] = value;
          }
          return acc;
        }, {});

        // Add marker for new parameters
        const signalWithMarker = {
          ...cleanSignalProps,
          __isNewParameter: true
        };

        // Add to appropriate command group
        commandGroups[groupKey].signals.push(signalWithMarker);
      });

      return {
        vehicle: {
          make: targetMake,
          model: targetModel
        },
        parameters: commandGroups
      };
    });

    // Generate the formatted code output
    if (vehicleData.length > 0) {
      const generatedCodes = {};

      // Generate code for each vehicle
      vehicleData.forEach(({ vehicle, parameters }) => {
        const key = `${vehicle.make}_${vehicle.model}`;

        if (Object.keys(parameters).length > 0) {
          // Build the complete JSON structure
          const codeString = `// For ${vehicle.make} ${vehicle.model}:
// Replace the content of signalsets/v3/default.json with this:

{ "commands": [
${Object.values(parameters).map(command => {
  // We can use this to add special styling for entirely new commands if needed in the future
  // const isEntireCommandNew = command.signals.every(s => newParameterIds.has(s.id));

  // Format command properties
  const commandProps = Object.entries(command)
    .filter(([key]) => key !== 'signals')
    .map(([key, value]) => {
      // Format the value based on type
      let formattedValue = value;
      if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      } else if (typeof value === 'number') {
        formattedValue = value;
      } else if (typeof value === 'boolean') {
        formattedValue = value ? 'true' : 'false';
      } else {
        formattedValue = `"${value}"`;
      }
      return `    "${key}": ${formattedValue}`;
    })
    .join(',\n');

  // Format signals
  const signalsString = command.signals.map((signal, index) => {
    // Check if this is a new parameter
    const isNew = signal.__isNewParameter === true;
    return formatSignalForOutput(signal, isNew, index, command.signals);
  }).join('\n');

  return `  {\n${commandProps},\n    "signals": [\n${signalsString}\n    ]\n  }`;
}).join(',\n')}
]}`;

          generatedCodes[key] = codeString;
        }
      });

      setGeneratedCode(generatedCodes);
      setSelectedVehicleTab(Object.keys(generatedCodes)[0]);
      setShowGeneratedCode(true);
    } else {
      alert('No parameters to transfer. Please select parameters and target vehicles.');
    }
  };

  // Copy generated code to clipboard
  const copyToClipboard = () => {
    const codeToCopy = selectedVehicleTab ? generatedCode[selectedVehicleTab] : '';

    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          alert('Parameter data copied to clipboard! Paste it into your vehicle JSON file.');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Copy all generated code to clipboard
  const copyAllToClipboard = () => {
    const allCode = Object.values(generatedCode).join('\n\n// ========================================\n\n');

    navigator.clipboard.writeText(allCode)
      .then(() => {
        alert('All parameter data copied to clipboard! The data is separated by dividers for each vehicle.');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Format the signal with proper JSON structure
  const formatSignalForOutput = (signal, isNew, index, array) => {
    // Create a copy of the signal to manipulate
    const cleanSignal = { ...signal };

    // Remove the __isNewParameter property
    delete cleanSignal.__isNewParameter;

    // Convert scaling string to fmt object if needed
    if (cleanSignal.scaling && typeof cleanSignal.scaling === 'string') {
      cleanSignal.fmt = convertScalingStringToFmtObject(cleanSignal.scaling);
      delete cleanSignal.scaling;
    }

    // Apply correct indentation for the RAV4 format
    const signalString = JSON.stringify(cleanSignal, null, 2);

    // The actual syntax highlighting will be applied in the CSS, here we just return the plain JSON
    // We don't use highlightClass here as it's handled by the renderCodeWithHighlighting function
    return `    ${signalString.replace(/\n {2}/g, '\n    ')}${index < array.length - 1 ? ',' : ''}`;
  };

  // Render the JSON code with syntax highlighting for new parameters
  const renderCodeWithHighlighting = (codeString, newParameterIds) => {
    // Create HTML content with syntax highlighting
    let highlightedCode = '';
    let inNewParameter = false;

    // Split the code into lines for processing
    const lines = codeString.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line contains a parameter ID that's new
      const idMatch = line.match(/"id":\s*"([^"]+)"/);
      if (!inNewParameter && idMatch) {
        // Get the parameter ID
        const paramId = idMatch[1];

        // Check if this is a new parameter by checking if it's in the target vehicle's model format
        // and if it's in our list of new parameters
        const modelPrefix = paramId.split('_')[0];
        if (newParameterIds.has(paramId) || selectedParamsForTransfer.some(p => {
          // Check if this parameter was selected for transfer and matches the ID pattern
          const adjustedId = p.id.replace(/^[^_]+/, modelPrefix);
          return adjustedId === paramId;
        })) {
          inNewParameter = true;
          highlightedCode += `<span class="new-parameter">${line}\n`;
          continue;
        }
      }

      // Check if we're in a new parameter and need to end the highlighting
      if (inNewParameter) {
        highlightedCode += line + '\n';

        // Check if this line closes the parameter object (has matching indentation and closing bracket)
        if (line.match(/^\s*}/) && line.endsWith(',')) {
          highlightedCode += '</span>';
          inNewParameter = false;
        } else if (line.match(/^\s*}/) && !line.endsWith(',')) {
          // Last item in the array doesn't have a comma
          highlightedCode += '</span>';
          inNewParameter = false;
        }
      } else {
        highlightedCode += line + '\n';
      }
    }

    return highlightedCode;
  };

  return (
    <div className="flex flex-col">
      <style jsx="true">{`
        .new-parameter {
          color: #15803d; /* A nice green color */
          font-weight: 500;
        }

        pre code .new-parameter {
          display: inline-block;
          width: 100%;
          background-color: rgba(21, 128, 61, 0.1); /* Light green background */
        }

        /* Add more specific styling for the comment */
        .new-parameter:first-line {
          font-weight: bold;
          color: #33cc59; /* Brighter green for better visibility */
        }
      `}</style>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Parameter Comparison</h3>
          <div className="flex items-center gap-2">
            {onAddVehicle && (
              <button
                onClick={onAddVehicle}
                className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                title="Add vehicle to comparison"
                disabled={vehicles.length >= 4}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Vehicle
              </button>
            )}
            {onChangeVehicles && (
              <button
                onClick={onChangeVehicles}
                className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                title="Change vehicles being compared"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
                Change Vehicles
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close comparison"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center mb-4 gap-3 px-4 py-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter parameters..."
              className="input text-sm py-2 pl-9 w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6 ml-2">
            <div className="inline-flex items-center">
              <input
                id="filter-common"
                type="checkbox"
                checked={filterByCommon}
                onChange={() => setFilterByCommon(!filterByCommon)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="filter-common" className="ml-2 text-sm text-gray-700">
                Common parameters only
              </label>
            </div>

            <div className="inline-flex items-center">
              <input
                id="show-details"
                type="checkbox"
                checked={showDetails}
                onChange={() => setShowDetails(!showDetails)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="show-details" className="ml-2 text-sm text-gray-700">
                Show parameter IDs
              </label>
            </div>
          </div>
        </div>

        {/* Add a selection counter and button for multi-parameter selection */}
        {selectedParamsForTransfer.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedParamsForTransfer.length} parameter{selectedParamsForTransfer.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={openParamTransferModal}
              className="btn btn-primary btn-sm"
            >
              Transfer Selected Parameters
            </button>
          </div>
        )}

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center bg-gray-50 p-2 rounded-md">
                <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
                </svg>
                <span className="text-sm font-medium flex-grow">
                  {vehicle.make} {vehicle.model}
                </span>
                <Link
                  to={`/vehicles/${vehicle.make}/${vehicle.model}`}
                  className="text-xs text-primary-600 hover:text-primary-800 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {displayParams.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No matching parameters found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-compact comparison-table">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <div className="flex items-center justify-center">
                    <span className="sr-only">Select</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '180px', maxWidth: '180px' }}>
                  Parameter
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px', maxWidth: '120px' }}>
                  Command
                </th>
                {vehicles.map((vehicle, index) => {
                  // Generate image URLs for make and model
                  const makeImageUrl = `https://raw.githubusercontent.com/ClutchEngineering/sidecar.clutch.engineering/main/site/gfx/make/${vehicle.make.toLowerCase()}.svg`;
                  // Update the model image URL to use the correct filename format from the repo
                  const modelSanitized = vehicle.model.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
                  const modelImageUrl = `https://raw.githubusercontent.com/ClutchEngineering/sidecar.clutch.engineering/main/site/gfx/model/${modelSanitized}.svg`;

                  return (
                    <th
                      key={`${vehicle.make}-${vehicle.model}`}
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: '120px', minWidth: '120px' }}
                    >
                      <div className="flex flex-col items-center">
                        <img
                          src={makeImageUrl}
                          alt={vehicle.make}
                          className="h-6 mb-2 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="hidden">{vehicle.make}</span>

                        <div className="h-16 flex items-center justify-center mb-2 w-full">
                          <img
                            src={modelImageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="max-h-16 max-w-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>

                        <span className="font-medium text-center w-full truncate">{vehicle.model}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayParams.map((param) => (
                <React.Fragment key={param.signature}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${expandedParameterId === param.signature ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleParameter(param.signature)}
                  >
                    <td className="px-3 py-2 text-xs text-center" onClick={(e) => e.stopPropagation()}>
                      {/* Only show checkbox if parameter is available in at least one vehicle but not all */}
                      {param.vehicles.some(v => v !== null) && param.vehicles.some(v => v === null) && (
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedParamsForTransfer.some(p => p.signature === param.signature)}
                            onChange={() => toggleParamSelection(param)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-900" style={{ width: '180px', maxWidth: '180px' }}>
                      <div className="truncate">
                        {param.name}
                        {param.vehicles.filter(v => v !== null).length === vehicles.length && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Common
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono" style={{ width: '120px', maxWidth: '120px' }}>
                      {(() => {
                        // Find the first available parameter to show command info
                        const firstParam = param.vehicles.find(v => v !== null);
                        if (firstParam) {
                          const cmdStr = firstParam.cmd ?
                            Object.entries(firstParam.cmd)
                              .map(([key, value]) => `${key}${value}`)
                              .join(' ') : '';

                          return (
                            <div className="flex flex-col">
                              <span className="text-primary-700 truncate">{firstParam.hdr || ''}</span>
                              {cmdStr && <span className="text-gray-600 truncate">{cmdStr}</span>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    {param.vehicles.map((vehicleParam, index) => (
                      <td key={`${param.signature}-${index}`} className="px-3 py-2 text-xs text-center" style={{ width: '120px', minWidth: '120px' }}>
                        {vehicleParam ? (
                          <div className="flex flex-col items-center">
                            <StatusBadge
                              text={vehicleParam.debug ? "Debugging" : "Available"}
                              variant={vehicleParam.debug ? "debugging" : "success"}
                              size="sm"
                              icon={vehicleParam.debug ? (
                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6.56 1.14a.75.75 0 01.177 1.045 3.989 3.989 0 00-.464.86c.185.17.382.329.59.473A3.993 3.993 0 0110 2c1.272 0 2.405.594 3.137 1.518.208-.144.405-.302.59-.473a3.989 3.989 0 00-.464-.86.75.75 0 011.222-.869c.369.519.65 1.105.822 1.736a.75.75 0 01-.174.707 7.03 7.03 0 01-1.299 1.098A4 4 0 0114 6c0 .52-.301.963-.723 1.187a6.961 6.961 0 01-1.158.486c.13.208.231.436.296.679 1.413-.174 2.779-.5 4.081-.96a.75.75 0 01.501 1.415c-1.409.499-2.886.835-4.408 1.007-.107.487-.307.913-.581 1.268.47.258.934.538 1.376.845a.75.75 0 11-.874 1.218 15.53 15.53 0 00-1.561-.959l-.2.493a6.98 6.98 0 01-.174 3.1 1.917 1.917 0 00-1.114-.333c-.425 0-.813.155-1.114.333A6.98 6.98 0 019.4 13.29l-.2-.493a15.53 15.53 0 00-1.56.959.75.75 0 01-.875-1.218c.442-.307.906-.587 1.376-.845a3.24 3.24 0 01-.58-1.268 14.557 14.557 0 01-4.41-1.007.75.75 0 01.501-1.415c1.303.46 2.67.786 4.083.96.064-.243.165-.47.296-.679a6.961 6.961 0 01-1.158-.486C6.301 6.963 6 6.52 6 6a4 4 0 01.166-1.143 7.03 7.03 0 01-1.3-1.098.75.75 0 01-.173-.707 5.483 5.483 0 01.822-1.736.75.75 0 011.046-.176z" clipRule="evenodd" />
                                </svg>
                              ) : null}
                            />
                            {showDetails && (
                              <span className="mt-1 text-xs text-gray-500 font-mono truncate max-w-full">
                                {vehicleParam.id}
                              </span>
                            )}
                          </div>
                        ) : (
                          null
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedParameterId === param.signature && (
                    <tr>
                      <td colSpan={3 + vehicles.length} className="px-0 py-0 border-t border-gray-100">
                        <div className="p-4 bg-gray-50">
                          <h4 className="text-sm font-medium mb-3">Signal Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {param.vehicles.map((vehicleParam, index) =>
                              vehicleParam ? (
                                <div key={index} className="bg-white p-3 rounded-md border border-gray-200 text-xs">
                                  <div className="font-medium mb-2 text-primary-700">
                                    {vehicles[index].make} {vehicles[index].model}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">ID:</span> {vehicleParam.id}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">Name:</span> {vehicleParam.name}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">ECU:</span> {vehicleParam.hdr || '-'}
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-gray-500">Command:</span>{' '}
                                    {vehicleParam.cmd ?
                                      Object.entries(vehicleParam.cmd)
                                        .map(([key, value]) => `${key}${value}`)
                                        .join(' ') : '-'}
                                  </div>
                                  {vehicleParam.bitOffset !== undefined && vehicleParam.bitLength !== undefined && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Bit Range:</span>{' '}
                                      {vehicleParam.bitOffset}-{vehicleParam.bitOffset + vehicleParam.bitLength - 1}
                                    </div>
                                  )}
                                  {vehicleParam.suggestedMetric && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Metric:</span> {vehicleParam.suggestedMetric}
                                    </div>
                                  )}
                                  {vehicleParam.unit && (
                                    <div className="mb-1">
                                      <span className="text-gray-500">Unit:</span> {vehicleParam.unit}
                                    </div>
                                  )}
                                  {vehicleParam.fmt && (
                                    <div className="mt-2">
                                      <div className="text-gray-500 mb-1">Scaling Info:</div>
                                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                        {JSON.stringify(vehicleParam.fmt, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Parameter Transfer Modal */}
      {showParamTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              {showGeneratedCode ? 'Generated Parameter Data' : 'Add Parameters to Other Models'}
            </h3>

            {!showGeneratedCode ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Select which vehicles you want to add {selectedParamsForTransfer.length} parameter{selectedParamsForTransfer.length !== 1 ? 's' : ''} to:
                </p>

                <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-md p-3">
                  <div className="space-y-3">
                    {vehicles.map((vehicle, index) => (
                      // Only show vehicles that are missing at least one of the selected parameters
                      selectedParamsForTransfer.some(param => !param.vehicles[index]) && (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`vehicle-${index}`}
                            checked={targetVehiclesForTransfer.includes(index)}
                            onChange={() => toggleTargetVehicle(index)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 mr-2"
                          />
                          <label htmlFor={`vehicle-${index}`} className="text-sm">
                            {vehicle.make} {vehicle.model}
                          </label>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <h4 className="text-sm font-medium mb-2">Selected Parameters:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                    {selectedParamsForTransfer.map(param => (
                      <li key={param.signature} className="flex items-start">
                        <svg className="h-4 w-4 text-primary-500 mr-1 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{param.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm text-blue-600 mb-4">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    The generated parameters will be formatted for easy addition to your vehicle JSON files.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={closeParamTransferModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateParameterData}
                    disabled={targetVehiclesForTransfer.length === 0}
                  >
                    Generate Parameter Data
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                  {Object.keys(generatedCode).map(key => (
                    <button
                      key={key}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                        selectedVehicleTab === key
                          ? 'text-primary-600 border-b-2 border-primary-500'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedVehicleTab(key)}
                    >
                      {key.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="mb-4 border border-gray-200 rounded-md overflow-auto">
                  <pre
                    className="p-3 text-xs bg-gray-50 max-h-96 overflow-y-auto whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: selectedVehicleTab
                        ? renderCodeWithHighlighting(
                            generatedCode[selectedVehicleTab],
                            new Set(selectedParamsForTransfer.map(p => p.id))
                          )
                        : ''
                    }}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">How to use this data:</h4>
                  <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                    <li>
                      This is a complete OBDb vehicle signal definition formatted to match the official standard.
                    </li>
                    <li>
                      Copy the entire JSON content and replace your <code className="bg-blue-100 px-1 rounded">signalsets/v3/default.json</code> file.
                    </li>
                    <li>
                      New parameters are highlighted in <span className="text-green-600 font-medium">green</span> for easy identification.
                    </li>
                    <li>
                      Signal definitions use the proper <code className="bg-blue-100 px-1 rounded">fmt</code> object format with properties like <code className="bg-blue-100 px-1 rounded">len</code>, <code className="bg-blue-100 px-1 rounded">max</code>, <code className="bg-blue-100 px-1 rounded">mul</code>, <code className="bg-blue-100 px-1 rounded">div</code>, etc.
                    </li>
                    <li>
                      All command-level properties like <code className="bg-blue-100 px-1 rounded">hdr</code>, <code className="bg-blue-100 px-1 rounded">cmd</code>, <code className="bg-blue-100 px-1 rounded">freq</code>, <code className="bg-blue-100 px-1 rounded">rax</code>, etc. are preserved in the correct positions.
                    </li>
                    <li>
                      Parameters are organized by commands and parameter IDs have been adjusted to match each target vehicle's model.
                    </li>
                    <li>
                      Switch between tabs to see parameters for different vehicles.
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowGeneratedCode(false)}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={copyToClipboard}
                  >
                    Copy Current Vehicle
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={copyAllToClipboard}
                  >
                    Copy All Vehicles
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleComparisonTable;
