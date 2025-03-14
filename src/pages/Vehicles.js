// src/pages/Vehicles.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import VehicleComparisonTable from '../components/VehicleComparisonTable';
import VehicleSelectionModal from '../components/VehicleSelectionModal';
import VehicleCard from '../components/VehicleCard';
import ModelYearBadge from '../components/ModelYearBadge';

const Vehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    yearRange: '',
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonParameters, setComparisonParameters] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [showVehicleSelectionModal, setShowVehicleSelectionModal] = useState(false);
  const [vehicleSelectionMode, setVehicleSelectionMode] = useState('add'); // 'add' or 'change'
  const [yearRanges, setYearRanges] = useState([]);

  // Parse URL query parameters
  const parseQueryString = () => {
    // For hash router, we need to parse the portion after the hash and route
    const hashPart = window.location.hash; // e.g., "/#/vehicles?compare=Honda-Accord,Honda-CR-V"

    // Extract the query string part (everything after the '?')
    const queryStringMatch = hashPart.match(/\?(.+)$/);
    if (!queryStringMatch) return {};

    const queryString = queryStringMatch[1];
    const pairs = queryString.split('&');
    const result = {};

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      // Ensure the key is properly decoded
      const key = decodeURIComponent(pair[0]);
      // Ensure the value is properly decoded - don't decode it again when processing
      const value = pair[1] ? decodeURIComponent(pair[1]) : '';
      result[key] = value;
    }

    return result;
  };

  // Clear comparison from URL
  const clearComparisonFromUrl = () => {
    navigate('/vehicles', { replace: true });
  };

  // Start comparison of selected vehicles
  // Wrap in useCallback to prevent unnecessary re-renders
  const startComparison = React.useCallback(async (vehiclesToCompare = null) => {
    const vehiclesToProcess = vehiclesToCompare || selectedVehicles;

    if (vehiclesToProcess.length < 2) return;

    try {
      setLoadingComparison(true);

      // Update URL with comparison parameters - moved inside the callback
      const compareParam = vehiclesToProcess.map(v => `${v.make}-${v.model}`).join(',');
      navigate(`/vehicles?compare=${encodeURIComponent(compareParam)}`, { replace: true });

      // Import utility functions for parameter processing
      const signalUtils = await import('../utils/signalUtils').then(module => module.default);

      // Load parameters for each selected vehicle
      const parametersPromises = vehiclesToProcess.map(vehicle =>
        dataService.getVehicleParameters(vehicle.make, vehicle.model)
      );

      const allParameters = await Promise.all(parametersPromises);

      // Process parameters to ensure they have the necessary information for comparison
      const processedParameters = allParameters.map((vehicleParams, vehicleIndex) => {
        return vehicleParams.map(param => {
          // Extract bit information
          const { bitOffset, bitLength } = signalUtils.extractBitInfo(param);

          // Enhance parameter with additional information needed for comparison
          return {
            ...param,
            bitOffset,
            bitLength,
            // Add vehicle information for display purposes
            vehicleMake: vehiclesToProcess[vehicleIndex].make,
            vehicleModel: vehiclesToProcess[vehicleIndex].model
          };
        });
      });

      setComparisonParameters(processedParameters);
      setIsComparing(true);
      setLoadingComparison(false);
    } catch (err) {
      setError('Failed to load parameters for comparison.');
      setLoadingComparison(false);
      console.error(err);
    }
  }, [selectedVehicles, navigate]);

  // State for model year data
  const [modelYearData, setModelYearData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const makes = await dataService.getMakes();
        setMakes(makes);

        const vehicles = await dataService.getVehicles();

        // Also fetch model year data if available
        try {
          const modelYearResponse = await fetch('/data/model_years_data.json');
          if (modelYearResponse.ok) {
            const modelYearData = await modelYearResponse.json();
            setModelYearData(modelYearData);

            // Extract all unique year ranges for filtering
            const uniqueYearRanges = new Set();
            const decades = new Set();

            // Also fetch matrix data to get signalset year ranges
            const matrixResponse = await fetch('/data/matrix_data.json');
            if (matrixResponse.ok) {
              const matrixData = await matrixResponse.json();

              // Process vehicle parameters to extract model year information
              vehicles.forEach(vehicle => {
                const vehicleParams = matrixData.filter(
                  param => param.make === vehicle.make && param.model === vehicle.model
                );

                // Extract year ranges and create structure
                const yearRangesMap = {};

                vehicleParams.forEach(param => {
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

                    // Add to unique year ranges for global filtering
                    uniqueYearRanges.add(key);

                    // Also track decades for filtering
                    const startDecade = Math.floor(startYear / 10) * 10;
                    const endDecade = Math.floor(endYear / 10) * 10;
                    decades.add(startDecade);
                    if (endDecade !== startDecade) {
                      decades.add(endDecade);
                    }
                  }
                });

                // Add year ranges to vehicle object
                vehicle.yearRanges = Object.values(yearRangesMap);

                // Also extract flat list of years this vehicle supports
                const allYears = [];
                vehicle.yearRanges.forEach(range => {
                  for (let year = range.startYear; year <= range.endYear; year++) {
                    if (!allYears.includes(year)) {
                      allYears.push(year);
                    }
                  }
                });
                vehicle.supportedYears = allYears.sort();
              });

              // Format filtered year ranges for dropdown
              const sortedDecades = [...decades].sort((a, b) => a - b);
              const formattedRanges = [
                ...sortedDecades.map(decade => ({
                  key: `${decade}s`,
                  label: `${decade}s`
                })),
                ...[...uniqueYearRanges].sort().map(range => {
                  const [start, end] = range.split('-');
                  return {
                    key: range,
                    label: start === end ? start : range
                  };
                })
              ];

              setYearRanges(formattedRanges);
            }

            // Enhance vehicles with model year information
            vehicles.forEach(vehicle => {
              const vehicleYearData = modelYearData.find(
                item => item.make === vehicle.make && item.model === vehicle.model
              );

              if (vehicleYearData) {
                // Add model year info to vehicle object
                vehicle.modelYears = Object.keys(vehicleYearData.modelYears).sort();

                // Get total count of unique PIDs across all years and ECUs
                const uniquePids = new Set();
                Object.values(vehicleYearData.modelYears).forEach(yearData => {
                  Object.values(yearData).forEach(pids => {
                    pids.forEach(pid => uniquePids.add(pid));
                  });
                });
                vehicle.totalPids = uniquePids.size;
              }
            });
          }
        } catch (err) {
          console.warn('Failed to load model year data:', err);
          // Not setting an error state as this is non-critical
        }

        setVehicles(vehicles);

        // Check if URL has comparison parameters
        const queryParams = parseQueryString();
        if (queryParams.compare) {
          // Split by ',' to get individual vehicle IDs, avoid re-decoding
          const vehiclesToCompare = queryParams.compare.split(',').map(id => {
            // Split by '-' to get make and model
            const parts = id.split('-');
            if (parts.length >= 2) {
              // The make is the first part, the model is the rest joined with '-'
              // This handles cases where model names might contain hyphens
              const make = parts[0];
              const model = parts.slice(1).join('-');
              // Only include make and model - removed id to be consistent with the rest of the app
              return { make, model };
            }
            return null;
          }).filter(v => v !== null); // Filter out any invalid entries

          // Validate that these vehicles exist
          const validVehicles = vehiclesToCompare.filter(v =>
            vehicles.some(existingVehicle =>
              existingVehicle.make === v.make && existingVehicle.model === v.model
            )
          );

          if (validVehicles.length >= 2) {
            setSelectedVehicles(validVehicles);
            // Trigger comparison (will be executed after loading is complete)
            setTimeout(() => startComparison(validVehicles), 0);
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [startComparison]);

  // Also listen for hash changes to handle direct navigation to comparison URLs
  useEffect(() => {
    const handleHashChange = () => {
      const queryParams = parseQueryString();
      if (queryParams.compare && vehicles.length > 0) {
        const vehiclesToCompare = queryParams.compare.split(',').map(vehicleString => {
          // Split by '-' instead of ':' to match how the URL is generated
          const parts = vehicleString.split('-');
          if (parts.length >= 2) {
            // The make is the first part, the model is the rest joined with '-'
            // This handles cases where model names might contain hyphens
            const make = parts[0];
            const model = parts.slice(1).join('-');
            return { make, model };
          }
          return null;
        }).filter(v => v !== null); // Filter out any invalid entries

        // Make sure we have valid vehicles to compare
        if (vehiclesToCompare.length >= 2) {
          startComparison(vehiclesToCompare);
        }
      }
    };

    // Set up listener
    window.addEventListener('hashchange', handleHashChange);
    // Also check on first mount
    handleHashChange();

    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [vehicles, startComparison]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Filter vehicles based on the current filters
  const filteredVehicles = vehicles.filter(vehicle => {
    // Filter by make
    if (filters.make && vehicle.make !== filters.make) {
      return false;
    }

    // Filter by model (partial match)
    if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
    }

    // Filter by year range
    if (filters.yearRange) {
      // Handle decade filter (e.g., "2010s")
      if (filters.yearRange.endsWith('s')) {
        const decade = parseInt(filters.yearRange.slice(0, -1));
        const decadeEnd = decade + 9;

        // Check if any of the vehicle's supported years fall within this decade
        const hasYearsInDecade = vehicle.supportedYears && vehicle.supportedYears.some(
          year => year >= decade && year <= decadeEnd
        );

        if (!hasYearsInDecade) {
          return false;
        }
      }
      // Handle specific year range (e.g., "2010-2015")
      else if (filters.yearRange.includes('-')) {
        const [startYearStr, endYearStr] = filters.yearRange.split('-');
        const startYear = parseInt(startYearStr);
        const endYear = parseInt(endYearStr);

        // Check if this vehicle supports any year in the selected range
        const hasYearsInRange = vehicle.supportedYears && vehicle.supportedYears.some(
          year => year >= startYear && year <= endYear
        );

        if (!hasYearsInRange) {
          return false;
        }
      }
      // Handle specific year (e.g., "2010")
      else {
        const year = parseInt(filters.yearRange);
        if (!vehicle.supportedYears || !vehicle.supportedYears.includes(year)) {
          return false;
        }
      }
    }

    return true;
  });

  // Group vehicles by make for more compact display
  const vehiclesByMake = filteredVehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.make]) {
      acc[vehicle.make] = [];
    }
    acc[vehicle.make].push(vehicle);
    return acc;
  }, {});

  // Toggle selection of a vehicle
  const toggleVehicleSelection = (make, model) => {
    // Create a vehicle object with make and model only to be consistent
    const newVehicle = { make, model };

    // Check if this vehicle is already selected
    const isSelected = selectedVehicles.some(v =>
      v.make === make && v.model === model
    );

    if (isSelected) {
      setSelectedVehicles(selectedVehicles.filter(v =>
        !(v.make === make && v.model === model)
      ));
    } else {
      if (selectedVehicles.length < 4) {  // Limit to 4 vehicles for comparison
        setSelectedVehicles([...selectedVehicles, newVehicle]);
      }
    }
  };

  // Open vehicle selection modal
  const openVehicleSelectionModal = (mode) => {
    setVehicleSelectionMode(mode);
    setShowVehicleSelectionModal(true);
  };

  // Handle adding a vehicle to comparison
  const handleAddVehicle = () => {
    // Only allow adding if we're under the 4 vehicle limit
    if (selectedVehicles.length < 4) {
      openVehicleSelectionModal('add');
    }
  };

  // Handle changing vehicles in comparison
  const handleChangeVehicles = () => {
    openVehicleSelectionModal('change');
  };

  // Handle vehicle selection from modal
  const handleVehicleSelectConfirm = async (selectedVehiclesList) => {
    // Close the modal
    setShowVehicleSelectionModal(false);

    // Process differently based on mode
    if (vehicleSelectionMode === 'add') {
      // Add new vehicles to the current selection
      const updatedVehicles = [...selectedVehicles];

      // Only add vehicles that aren't already in the comparison
      selectedVehiclesList.forEach(newVehicle => {
        // Check if this vehicle is already in the comparison
        const alreadySelected = updatedVehicles.some(v =>
          v.make === newVehicle.make && v.model === newVehicle.model
        );

        if (!alreadySelected && updatedVehicles.length < 4) {
          // Add vehicle with consistent structure (just make and model)
          updatedVehicles.push({
            make: newVehicle.make,
            model: newVehicle.model
          });
        }
      });

      // Update state and trigger comparison
      if (updatedVehicles.length !== selectedVehicles.length) {
        setSelectedVehicles(updatedVehicles);
        startComparison(updatedVehicles);
      }
    } else if (vehicleSelectionMode === 'change') {
      // Replace current vehicles with new selection
      if (selectedVehiclesList.length >= 2) {
        // Create vehicle objects with consistent structure
        const newVehicles = selectedVehiclesList.map(vehicle => ({
          make: vehicle.make,
          model: vehicle.model
        }));

        setSelectedVehicles(newVehicles);
        startComparison(newVehicles);
      }
    }
  };

  // End comparison mode
  const endComparison = () => {
    setIsComparing(false);
    setComparisonParameters([]);
    clearComparisonFromUrl();
  };

  // Define filter fields for the SearchFilter component
  const filterFields = [
    {
      name: 'make',
      label: 'Make',
      type: 'select',
      options: makes,
      className: 'flex-1 min-w-[200px]'
    },
    {
      name: 'model',
      label: 'Search by Model',
      type: 'text',
      placeholder: 'Type to search...',
      className: 'flex-1 min-w-[200px]'
    },
    {
      name: 'yearRange',
      label: 'Model Year',
      type: 'select',
      options: yearRanges.map(yr => yr.label),
      className: 'flex-1 min-w-[200px]'
    }
  ];

  // Create a shareable link for the current comparison
  const getShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Create a comma-separated list of vehicles in Make-Model format
    const compareParam = selectedVehicles.map(v => `${v.make}-${v.model}`).join(',');
    // Ensure the entire compare parameter is properly URL encoded
    return `${baseUrl}#/vehicles?compare=${encodeURIComponent(compareParam)}`;
  };

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  // Actions for the page header (comparison button)
  const pageActions = (
    <>
      {selectedVehicles.length > 0 && (
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => startComparison()}
            disabled={selectedVehicles.length < 2 || loadingComparison}
            className={`btn ${selectedVehicles.length >= 2 && !loadingComparison ? 'btn-primary' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {loadingComparison ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Compare Selected'
            )}
          </button>
        </div>
      )}
      {selectedVehicles.length > 0 && (
        <button
          onClick={() => setSelectedVehicles([])}
          className="ml-2 btn btn-secondary"
        >
          Clear Selection
        </button>
      )}
    </>
  );

  // Comparison view actions
  const comparisonActions = (
    <button
      onClick={copyShareableLink}
      className="btn btn-secondary flex items-center"
      title="Copy shareable link to clipboard"
    >
      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      Share Comparison
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Browse Vehicles"
        description={!loading && !error &&
          `${filteredVehicles.length} vehicles found. ${
            selectedVehicles.length > 0
              ? `Select up to ${4 - selectedVehicles.length} more to compare.`
              : 'Select up to 4 vehicles to compare parameters.'
          }`
        }
        actions={isComparing ? comparisonActions : pageActions}
      />

      {isComparing ? (
        <VehicleComparisonTable
          vehicles={selectedVehicles}
          parameters={comparisonParameters}
          onClose={endComparison}
          onAddVehicle={selectedVehicles.length < 4 ? handleAddVehicle : null}
          onChangeVehicles={handleChangeVehicles}
        />
      ) : (
        <>
          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            fields={filterFields}
            className="mb-6"
          />

          {loading ? (
            <LoadingSpinner size="md" centered={true} />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : (
            <div>
              {filteredVehicles.length === 0 ? (
                <EmptyState
                  title="No vehicles found"
                  message="Try changing your search criteria."
                />
              ) : (
                Object.entries(vehiclesByMake).map(([make, makeVehicles]) => (
                  <div key={make} className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                      {make} <span className="text-gray-500 text-sm ml-2">({makeVehicles.length} models)</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {makeVehicles.map(vehicle => (
                        <VehicleCard
                          key={`${vehicle.make}-${vehicle.model}`}
                          make={vehicle.make}
                          model={vehicle.model}
                          modelYears={vehicle.yearRanges?.map(range => [range.startYear, range.endYear])}
                          totalPids={vehicle.totalPids}
                          isSelected={selectedVehicles.some(v =>
                            v.make === vehicle.make && v.model === vehicle.model
                          )}
                          onSelect={toggleVehicleSelection}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Vehicle Selection Modal */}
      {showVehicleSelectionModal && (
        <VehicleSelectionModal
          allVehicles={vehicles}
          currentSelection={vehicleSelectionMode === 'change' ? [] : selectedVehicles}
          mode={vehicleSelectionMode}
          onConfirm={handleVehicleSelectConfirm}
          onCancel={() => setShowVehicleSelectionModal(false)}
          maxSelections={4}
        />
      )}
    </div>
  );
};

export default Vehicles;
