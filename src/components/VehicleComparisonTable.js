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

  // Get all unique parameters across all vehicles
  const allParams = new Map();

  // Group parameters by signal signature
  parameters.forEach((vehicleParams, vehicleIndex) => {
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

  // Generate updated parameter data for target vehicles
  const handleGenerateParameterData = () => {
    try {
      // Create a mapping of vehicle indices to parameters that should be transferred
      const transferMapping = {};
      
      // Initialize with empty arrays for each target vehicle
      targetVehiclesForTransfer.forEach(targetIndex => {
        transferMapping[targetIndex] = [];
      });
      
      // For each selected parameter, find where it exists and where it should be transferred
      selectedParamsForTransfer.forEach(selectedParam => {
        // Find the source vehicle index with this parameter
        const sourceVehicleIndex = selectedParam.vehicles.findIndex(param => param !== null);
        if (sourceVehicleIndex === -1) return;
        
        const sourceParam = selectedParam.vehicles[sourceVehicleIndex];
        const sourceVehicle = vehicles[sourceVehicleIndex];
        
        // For each target vehicle, collect parameters to be transferred
        targetVehiclesForTransfer.forEach(targetIndex => {
          // Only transfer if the parameter doesn't already exist for this vehicle
          if (!selectedParam.vehicles[targetIndex]) {
            // Clean up the parameter for transfer
            const { vehicleMake, vehicleModel, bitOffset, bitLength, ...baseParam } = sourceParam;
            
            const targetVehicle = vehicles[targetIndex];
            
            // Create a clean parameter object with adjusted ID for the target vehicle
            const cleanParam = {
              ...baseParam,
              // Modify the ID to reflect the target vehicle's model
              id: adjustParameterIdForVehicle(baseParam.id, sourceVehicle, targetVehicle),
            };
            
            // Store target vehicle info for reference
            const paramWithMetadata = {
              ...cleanParam,
              __targetMake: targetVehicle.make,
              __targetModel: targetVehicle.model,
              __isNewParameter: true,
              __sourceMake: sourceVehicle.make,
              __sourceModel: sourceVehicle.model,
              __sourceId: baseParam.id
            };
            
            // Add to transfer mapping
            transferMapping[targetIndex].push(paramWithMetadata);
          }
        });
      });
      
      // Helper function to adjust parameter ID for the target vehicle
      function adjustParameterIdForVehicle(originalId, sourceVehicle, targetVehicle) {
        // Common patterns for OBDb: MODELNAME_PARAMETER_TYPE
        
        // Convert model names to uppercase with no spaces or special chars
        const sourceModelPrefix = sourceVehicle.model.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const targetModelPrefix = targetVehicle.model.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Check if the original ID starts with the source model prefix
        if (originalId.startsWith(`${sourceModelPrefix}_`)) {
          // Replace source model prefix with target model prefix
          return originalId.replace(`${sourceModelPrefix}_`, `${targetModelPrefix}_`);
        }
        
        // For other formats, try to parse the ID parts and replace the model reference
        const parts = originalId.split('_');
        
        if (parts.length > 1) {
          // Check if first part matches the source model
          if (parts[0] === sourceModelPrefix) {
            parts[0] = targetModelPrefix;
            return parts.join('_');
          }
        }
        
        // If we can't identify a clear pattern, prefix with the target model
        return `${targetModelPrefix}_${originalId}`;
      }
      
      // Create output organized by vehicle
      const vehicleOutputs = {};
      
      Object.entries(transferMapping).forEach(([targetIndex, params]) => {
        const targetVehicle = vehicles[parseInt(targetIndex)];
        const key = `${targetVehicle.make}_${targetVehicle.model}`;
        
        if (params.length > 0) {
          vehicleOutputs[key] = {
            vehicle: targetVehicle,
            parameters: params
          };
        }
      });
      
      // Generate the formatted code output
      if (Object.keys(vehicleOutputs).length > 0) {
        const generatedCodes = {};
        
        // Generate code for each vehicle
        Object.entries(vehicleOutputs).forEach(([key, data]) => {
          const { vehicle, parameters } = data;
          
          // Get existing parameters for this vehicle (from the comparison data)
          const vehicleIndex = vehicles.findIndex(v => 
            v.make === vehicle.make && v.model === vehicle.model);
          
          // Extract existing parameters by command from the comparison data
          const commandGroups = {};
          
          // Group existing parameters by hdr/cmd combination
          displayParams.forEach(param => {
            if (param.vehicles[vehicleIndex]) {
              const paramData = param.vehicles[vehicleIndex];
              
              // Skip parameters without hdr/cmd
              if (!paramData.hdr || !paramData.cmd) return;
              
              const paramHdr = paramData.hdr;
              const paramCmd = JSON.stringify(paramData.cmd);
              const groupKey = `${paramHdr}:${paramCmd}`;
              
              if (!commandGroups[groupKey]) {
                // Collect all command-level properties
                const { 
                  hdr, cmd, freq,
                  rax, eax, tst, fcm1, dbg, // Preserve special command-level properties
                  ...rest
                } = paramData;

                const commandProps = {
                  hdr,
                  cmd,
                  freq: freq || 0.5
                };

                // Add any extra command-level properties that exist
                if (rax) commandProps.rax = rax;
                if (eax) commandProps.eax = eax;
                if (tst) commandProps.tst = tst;
                if (fcm1) commandProps.fcm1 = fcm1;
                if (dbg) commandProps.dbg = dbg;
                
                // Add any other command properties that might exist
                Object.entries(rest).forEach(([key, value]) => {
                  // Skip vehicle-specific metadata and signal-specific properties
                  if (key !== 'vehicleMake' && key !== 'vehicleModel' && 
                      key !== 'bitOffset' && key !== 'bitLength' && 
                      !key.startsWith('__') &&
                      key !== 'id' && key !== 'name' && key !== 'path' && 
                      key !== 'fmt' && key !== 'unit' && key !== 'suggestedMetric') {
                    commandProps[key] = value;
                  }
                });

                commandGroups[groupKey] = {
                  ...commandProps,
                  signals: []
                };
              }
              
              // Clean up the parameter for JSON - only keep signal-level properties
              const {
                // Remove command-level properties
                hdr: signalHdr, cmd: signalCmd, freq: signalFreq,
                rax: signalRax, eax: signalEax, tst: signalTst, fcm1: signalFcm1, dbg: signalDbg,
                // Remove metadata
                vehicleMake, vehicleModel, bitOffset, bitLength, 
                // Remove other metadata properties
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
              
              // Add to appropriate command group
              commandGroups[groupKey].signals.push(cleanSignalProps);
            }
          });
          
          // Check each new parameter and place it in the correct command group
          parameters.forEach(param => {
            const paramHdr = param.hdr;
            const paramCmd = JSON.stringify(param.cmd);
            const groupKey = `${paramHdr}:${paramCmd}`;
            
            // Create new command group if doesn't exist
            if (!commandGroups[groupKey]) {
              // Extract command-level properties
              const {
                hdr, cmd, freq,
                rax, eax, tst, fcm1, dbg, // Preserve special command-level properties
                ...rest
              } = param;

              const commandProps = {
                hdr: paramHdr,
                cmd: param.cmd,
                freq: param.freq || 0.5
              };

              // Add any extra command-level properties that exist
              if (param.rax) commandProps.rax = param.rax;
              if (param.eax) commandProps.eax = param.eax;
              if (param.tst) commandProps.tst = param.tst;
              if (param.fcm1) commandProps.fcm1 = param.fcm1;
              if (param.dbg) commandProps.dbg = param.dbg;

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
            } = param;

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
          
          // Format the commands array
          const commands = Object.values(commandGroups);
          
          // Format as a complete JSON structure for signalsets/v3/default.json
          const formattedCommands = commands.map(command => {
            // Extract __isNewParameter flag if the entire command is new
            const isEntireCommandNew = command.signals.every(signal => signal.__isNewParameter === true);
            
            // Format signals in this command
            const formattedSignals = command.signals.map((signal, index) => {
              const isNew = signal.__isNewParameter === true;
              
              // Remove metadata
              const { __isNewParameter, ...cleanSignal } = signal;
              
              // Convert any string-based formatting into proper fmt objects if needed
              if (typeof cleanSignal.scaling === 'string' && !cleanSignal.fmt) {
                cleanSignal.fmt = convertScalingStringToFmtObject(cleanSignal.scaling);
                delete cleanSignal.scaling;
              }
              
              // Apply correct indentation for the RAV4 format
              const signalString = JSON.stringify(cleanSignal, null, 2);
              
              // Add marker for new parameters with proper indentation
              if (isNew) {
                return `    // === NEW PARAMETER ===\n    ${signalString.replace(/\n  /g, '\n    ')}${index < command.signals.length - 1 ? ',' : ''}`;
              }
              
              return `    ${signalString.replace(/\n  /g, '\n    ')}${index < command.signals.length - 1 ? ',' : ''}`;
            }).join('\n');
            
            // Format the command properly
            let commandString = '  {\n';
            
            // Add new command marker if needed
            if (isEntireCommandNew) {
              commandString = '  // === NEW COMMAND ===\n  {\n';
            }
            
            // Extract command properties (excluding signals)
            const { signals, ...commandProps } = command;
            
            // Add command properties with proper formatting
            Object.entries(commandProps).forEach(([key, value], idx, arr) => {
              const comma = idx < arr.length - 1 ? ',' : '';
              if (typeof value === 'object') {
                commandString += `    "${key}": ${JSON.stringify(value)}${comma}\n`;
              } else if (typeof value === 'number') {
                commandString += `    "${key}": ${value}${comma}\n`;
              } else if (typeof value === 'boolean') {
                commandString += `    "${key}": ${value}${comma}\n`;
              } else {
                commandString += `    "${key}": "${value}"${comma}\n`;
              }
            });
            
            // Add signals array
            commandString += `    "signals": [\n${formattedSignals}\n    ]\n  }`;
            
            return commandString;
          }).join(',\n');
          
          // Helper function to convert scaling string to fmt object
          function convertScalingStringToFmtObject(scalingString) {
            const fmt = {};
            
            // Default length
            fmt.len = 8;
            
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
            
            if (scalingString.includes('+-')) {
              const addMatch = scalingString.match(/\+-\s*([\d.]+)/);
              if (addMatch) {
                fmt.add = parseFloat(addMatch[1]) * (scalingString.includes('+-') ? -1 : 1);
              }
            }
            
            if (scalingString.includes('clamped to')) {
              const maxMatch = scalingString.match(/clamped to \[([\d.]+)\]/);
              if (maxMatch) {
                fmt.max = parseFloat(maxMatch[1]);
              }
            }
            
            return fmt;
          }
          
          // Build the complete JSON structure
          const code = `// For ${vehicle.make} ${vehicle.model}:
// Replace the content of signalsets/v3/default.json with this:

{ "commands": [
${formattedCommands}
]
}`;
          
          generatedCodes[key] = code;
        });
        
        setGeneratedCode(generatedCodes);
        setSelectedVehicleTab(Object.keys(generatedCodes)[0]);
        setShowGeneratedCode(true);
      } else {
        alert('No parameters to transfer. Please select parameters and target vehicles.');
      }
    } catch (error) {
      console.error('Failed to generate parameter data:', error);
      alert('Failed to generate parameter data');
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Parameter Comparison</h2>
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

        <div className="flex flex-col sm:flex-row items-center mb-4 gap-3">
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

          <div className="flex items-center gap-4">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signal Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Command
                </th>
                {vehicles.map((vehicle) => (
                  <th key={vehicle.id} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    {vehicle.model}
                  </th>
                ))}
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
                    <td className="px-3 py-2 text-xs font-medium text-gray-900">
                      {param.name}
                      {param.vehicles.filter(v => v !== null).length === vehicles.length && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Common
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">
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
                              <span className="text-primary-700">{firstParam.hdr || ''}</span>
                              {cmdStr && <span className="text-gray-600">{cmdStr}</span>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    {param.vehicles.map((vehicleParam, index) => (
                      <td key={`${param.signature}-${index}`} className="px-3 py-2 text-xs text-center">
                        {vehicleParam ? (
                          <div className="flex flex-col items-center">
                            <StatusBadge
                              text="Available"
                              variant="success"
                              size="sm"
                            />
                            {showDetails && (
                              <span className="mt-1 text-xs text-gray-500 font-mono">
                                {vehicleParam.id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <StatusBadge
                            text="Not Available"
                            variant="default"
                            size="sm"
                          />
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
                  <pre className="p-3 text-xs bg-gray-50 max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {selectedVehicleTab ? generatedCode[selectedVehicleTab] : ''}
                  </pre>
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
                      New parameters are marked with <code className="bg-blue-100 px-1 rounded">// === NEW PARAMETER ===</code> for easy identification.
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
