import React, { useState, useEffect } from 'react';

const VehicleSelectionModal = ({ 
  allVehicles, 
  currentSelection, 
  mode,
  onConfirm, 
  onCancel, 
  maxSelections = 4
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMake, setFilterMake] = useState('');
  
  // Group vehicles by make for better organization
  const vehiclesByMake = allVehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.make]) {
      acc[vehicle.make] = [];
    }
    acc[vehicle.make].push(vehicle);
    return acc;
  }, {});
  
  // Get unique makes for filter dropdown
  const makes = Object.keys(vehiclesByMake).sort();
  
  // Initialize selected vehicles from current selection if in add mode
  useEffect(() => {
    if (mode === 'add') {
      setSelectedVehicles(currentSelection.map(v => ({ make: v.make, model: v.model })));
    } else {
      setSelectedVehicles([]);
    }
  }, [currentSelection, mode]);
  
  // Toggle vehicle selection
  const toggleVehicleSelection = (make, model) => {
    const vehicleIndex = selectedVehicles.findIndex(
      v => v.make === make && v.model === model
    );
    
    if (vehicleIndex >= 0) {
      // Remove from selection
      setSelectedVehicles(
        selectedVehicles.filter((_, index) => index !== vehicleIndex)
      );
    } else {
      // Add to selection if under max limit
      if (selectedVehicles.length < maxSelections) {
        setSelectedVehicles([...selectedVehicles, { make, model }]);
      }
    }
  };
  
  // Check if a vehicle is selected
  const isVehicleSelected = (make, model) => {
    return selectedVehicles.some(v => v.make === make && v.model === model);
  };
  
  // Filter vehicles based on search query and make filter
  const filteredVehicles = {};
  Object.entries(vehiclesByMake).forEach(([make, models]) => {
    // Apply make filter
    if (filterMake && make !== filterMake) {
      return;
    }
    
    // Apply search filter to models
    const filteredModels = models.filter(vehicle => 
      !searchQuery || 
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredModels.length > 0) {
      filteredVehicles[make] = filteredModels;
    }
  });
  
  // Handle confirmation with selected vehicles
  const handleConfirm = () => {
    // In change mode, require at least 2 vehicles
    if (mode === 'change' && selectedVehicles.length < 2) {
      alert('Please select at least 2 vehicles for comparison');
      return;
    }
    
    onConfirm(selectedVehicles);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {mode === 'add' ? 'Add Vehicles to Comparison' : 'Change Comparison Vehicles'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles..."
                className="input text-sm py-2 pl-9 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="input text-sm py-2 w-full sm:w-auto"
              >
                <option value="">All Makes</option>
                {makes.map(make => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {selectedVehicles.length} of {maxSelections} vehicles selected
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {Object.keys(filteredVehicles).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No vehicles found. Try changing your search criteria.
            </div>
          ) : (
            Object.entries(filteredVehicles).map(([make, models]) => (
              <div key={make} className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">
                  {make} <span className="text-gray-500 text-sm ml-2">({models.length} models)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {models.map(vehicle => (
                    <div
                      key={`${vehicle.make}-${vehicle.model}`}
                      className={`p-3 rounded-md border cursor-pointer transition-colors
                        ${isVehicleSelected(vehicle.make, vehicle.model)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      onClick={() => toggleVehicleSelection(vehicle.make, vehicle.model)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className={`h-5 w-5 ${
                            isVehicleSelected(vehicle.make, vehicle.model)
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
                          </svg>
                        </div>
                        <div className="ml-2 flex-grow">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.model}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`btn btn-primary ${
              (mode === 'change' && selectedVehicles.length < 2) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={mode === 'change' && selectedVehicles.length < 2}
          >
            {mode === 'add' ? 'Add to Comparison' : 'Update Comparison'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSelectionModal; 