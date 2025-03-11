// src/pages/Vehicles.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import VehicleComparisonTable from '../components/VehicleComparisonTable';

const Vehicles = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonParameters, setComparisonParameters] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

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
      result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }

    return result;
  };

  // Update URL with comparison parameters
  const updateUrlWithComparison = (selectedVehiclesList) => {
    const compareParam = selectedVehiclesList.map(v => `${v.make}-${v.model}`).join(',');
    navigate(`/vehicles?compare=${encodeURIComponent(compareParam)}`, { replace: true });
  };

  // Clear comparison from URL
  const clearComparisonFromUrl = () => {
    navigate('/vehicles', { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const makes = await dataService.getMakes();
        setMakes(makes);

        const vehicles = await dataService.getVehicles();
        setVehicles(vehicles);

        // Check if URL has comparison parameters
        const queryParams = parseQueryString();
        if (queryParams.compare) {
          const vehiclesToCompare = queryParams.compare.split(',').map(id => {
            const [make, model] = id.split('-');
            return { make, model, id };
          });

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
  }, []);

  // Also listen for hash changes to handle direct navigation to comparison URLs
  useEffect(() => {
    const handleHashChange = () => {
      const queryParams = parseQueryString();
      if (queryParams.compare && vehicles.length > 0) {
        const vehiclesToCompare = queryParams.compare.split(',').map(id => {
          const [make, model] = id.split('-');
          return { make, model, id };
        });

        // Validate that these vehicles exist
        const validVehicles = vehiclesToCompare.filter(v =>
          vehicles.some(existingVehicle =>
            existingVehicle.make === v.make && existingVehicle.model === v.model
          )
        );

        if (validVehicles.length >= 2) {
          setSelectedVehicles(validVehicles);
          // Trigger comparison
          startComparison(validVehicles);
        }
      }
    };

    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initial check on mount if we already have vehicles loaded
    if (vehicles.length > 0) {
      handleHashChange();
    }

    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [vehicles]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Filter vehicles based on the current filters
  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.make && vehicle.make !== filters.make) {
      return false;
    }
    if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
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
    const vehicleId = `${make}-${model}`;

    if (selectedVehicles.some(v => v.id === vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
    } else {
      if (selectedVehicles.length < 4) {  // Limit to 4 vehicles for comparison
        setSelectedVehicles([...selectedVehicles, { make, model, id: vehicleId }]);
      }
    }
  };

  // Start comparison of selected vehicles
  const startComparison = async (vehiclesToCompare = null) => {
    const vehiclesToProcess = vehiclesToCompare || selectedVehicles;

    if (vehiclesToProcess.length < 2) return;

    try {
      setLoadingComparison(true);

      // Update URL with comparison parameters
      updateUrlWithComparison(vehiclesToProcess);

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
    }
  ];

  // Create a shareable link for the current comparison
  const getShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const compareParam = selectedVehicles.map(v => `${v.make}-${v.model}`).join(',');
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

  // Vehicle card component
  const VehicleCard = ({ make, model }) => {
    const isSelected = selectedVehicles.some(v => v.make === make && v.model === model);
    const navigate = useNavigate();

    const handleCardClick = () => {
      navigate(`/vehicles/${make}/${model}`);
    };

    return (
      <div
        className={`bg-white border rounded-md p-3 transition-colors cursor-pointer ${
          isSelected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50 hover:border-primary-300'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
            </svg>
            <span className="text-sm font-medium">{model}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleVehicleSelection(make, model);
              }}
              className={`h-5 w-5 rounded-full border flex items-center justify-center focus:outline-none ${
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-300 text-transparent hover:border-primary-500'
              }`}
            >
              {isSelected && (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                        <VehicleCard key={vehicle.id} make={vehicle.make} model={vehicle.model} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Vehicles;
