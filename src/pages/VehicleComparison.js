import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import VehicleComparisonTable from '../components/VehicleComparisonTable';
import VehicleSelectionModal from '../components/VehicleSelectionModal';

const VehicleComparison = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [comparisonParameters, setComparisonParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVehicleSelectionModal, setShowVehicleSelectionModal] = useState(false);

  // Parse vehicles from URL query parameter
  const parseVehiclesFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const vehiclesParam = searchParams.get('vehicles');

    if (!vehiclesParam) return [];

    return vehiclesParam.split(',').map(vehicleString => {
      const parts = vehicleString.split('-');
      if (parts.length >= 2) {
        // The make is the first part, the model is the rest joined with '-'
        const make = parts[0];
        const model = parts.slice(1).join('-');
        return { make, model };
      }
      return null;
    }).filter(v => v !== null);
  };

  // Fetch vehicles and comparison data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First, get all vehicles
        const allVehicles = await dataService.getVehicles();
        setVehicles(allVehicles);

        // Parse vehicles from URL
        const urlVehicles = parseVehiclesFromUrl();

        // Validate that these vehicles exist
        const validVehicles = urlVehicles.filter(v =>
          allVehicles.some(existingVehicle =>
            existingVehicle.make === v.make && existingVehicle.model === v.model
          )
        );

        // If not enough valid vehicles, redirect
        if (validVehicles.length < 2) {
          navigate('/vehicles');
          return;
        }

        setSelectedVehicles(validVehicles);

        // Load parameters for each selected vehicle
        try {
          // Import utility functions for parameter processing
          const signalUtils = await import('../utils/signalUtils').then(module => module.default);

          // Load parameters for each selected vehicle
          const parametersPromises = validVehicles.map(vehicle =>
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
                vehicleMake: validVehicles[vehicleIndex].make,
                vehicleModel: validVehicles[vehicleIndex].model
              };
            });
          });

          setComparisonParameters(processedParameters);
          setLoading(false);
        } catch (parametersError) {
          setError('Failed to load vehicle parameters.');
          setLoading(false);
          console.error(parametersError);
        }
      } catch (err) {
        setError('Failed to load vehicle data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle adding more vehicles to comparison
  const handleAddVehicle = () => {
    if (selectedVehicles.length < 4) {
      setShowVehicleSelectionModal(true);
    }
  };

  // Handle vehicle selection confirmation
  const handleVehicleSelectConfirm = async (selectedVehiclesList) => {
    // Close the modal
    setShowVehicleSelectionModal(false);

    // Validate and update selected vehicles
    const updatedVehicles = [...selectedVehicles];

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

    // If vehicles changed, update URL and fetch new parameters
    if (updatedVehicles.length !== selectedVehicles.length) {
      // Update URL
      const compareParam = updatedVehicles.map(v => `${v.make}-${v.model}`).join(',');
      navigate(`/vehicles/compare?vehicles=${encodeURIComponent(compareParam)}`, { replace: true });

      // Reload data for new vehicles
      setLoading(true);
      try {
        // Import utility functions for parameter processing
        const signalUtils = await import('../utils/signalUtils').then(module => module.default);

        // Load parameters for each selected vehicle
        const parametersPromises = updatedVehicles.map(vehicle =>
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
              vehicleMake: updatedVehicles[vehicleIndex].make,
              vehicleModel: updatedVehicles[vehicleIndex].model
            };
          });
        });

        setSelectedVehicles(updatedVehicles);
        setComparisonParameters(processedParameters);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle parameters.');
        setLoading(false);
        console.error(err);
      }
    }
  };

  // Create a shareable link for the current comparison
  const getShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Create a comma-separated list of vehicles in Make-Model format
    const compareParam = selectedVehicles.map(v => `${v.make}-${v.model}`).join(',');
    // Ensure the entire compare parameter is properly URL encoded
    return `${baseUrl}#/vehicles/compare?vehicles=${encodeURIComponent(compareParam)}`;
  };

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  // Render comparison actions
  const comparisonActions = (
    <div className="flex space-x-2">
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
    </div>
  );

  // Handle ending comparison and returning to vehicle list
  const endComparison = () => {
    navigate('/vehicles');
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Comparison"
        description={`Comparing ${selectedVehicles.length} vehicles`}
        actions={comparisonActions}
      />

      {loading ? (
        <LoadingSpinner size="md" centered={true} />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <VehicleComparisonTable
          vehicles={selectedVehicles}
          parameters={comparisonParameters}
          onClose={endComparison}
          onAddVehicle={selectedVehicles.length < 4 ? handleAddVehicle : null}
          onChangeVehicles={() => setShowVehicleSelectionModal(true)}
        />
      )}

      {/* Vehicle Selection Modal */}
      {showVehicleSelectionModal && (
        <VehicleSelectionModal
          allVehicles={vehicles}
          currentSelection={selectedVehicles}
          mode="change"
          onConfirm={handleVehicleSelectConfirm}
          onCancel={() => setShowVehicleSelectionModal(false)}
          maxSelections={4}
        />
      )}
    </div>
  );
};

export default VehicleComparison;
