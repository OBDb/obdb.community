// src/components/VehicleChips.js
import React from 'react';
import { Link } from 'react-router-dom';

const VehicleChips = ({
  vehicles
}) => {
  // Helper function to parse vehicle ID into make and model
  const parseVehicleId = (vehicleId) => {
    // Handle special cases that don't follow make-model format
    if (!vehicleId.includes('-')) {
      return {
        make: vehicleId,
        model: '',
        displayName: vehicleId
      };
    }

    const [make, ...modelParts] = vehicleId.split('-');
    const model = modelParts.join('-'); // Rejoin in case model contains hyphens
    return {
      make,
      model,
      displayName: `${make} ${model}`
    };
  };

  const handleChipClick = (e, vehicle) => {
    e.stopPropagation(); // Prevent parent element clicks
  };

  return (
    <div className="flex flex-wrap gap-1">
      {vehicles.map((vehicleId) => {
        const vehicle = parseVehicleId(vehicleId);
        return (
          <Link
            key={vehicleId}
            to={`/vehicles/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
            onClick={(e) => handleChipClick(e, { id: vehicleId, ...vehicle })}
          >
            {vehicle.displayName}
          </Link>
        );
      })}
    </div>
  );
};

export default VehicleChips;
