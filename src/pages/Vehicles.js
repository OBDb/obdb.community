// src/pages/Vehicles.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dataService from '../services/dataService';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const makes = await dataService.getMakes();
        setMakes(makes);

        const vehicles = await dataService.getVehicles();
        setVehicles(vehicles);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse Vehicles</h1>

      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <select
              id="make"
              name="make"
              value={filters.make}
              onChange={handleFilterChange}
              className="input text-sm py-1"
            >
              <option value="">All Makes</option>
              {makes.map(make => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Model
            </label>
            <div className="relative">
              <input
                type="text"
                id="model"
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                placeholder="Type to search..."
                className="input text-sm py-1 pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            {filteredVehicles.length} vehicles found
          </div>

          {Object.entries(vehiclesByMake).map(([make, makeVehicles]) => (
            <div key={make} className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                {make} <span className="text-gray-500 text-sm ml-2">({makeVehicles.length} models)</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {makeVehicles.map(vehicle => (
                  <Link
                    key={vehicle.id}
                    to={`/vehicles/${vehicle.make}/${vehicle.model}`}
                    className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
                      </svg>
                      <span className="text-sm font-medium">{vehicle.model}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredVehicles.length === 0 && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
              <p className="mt-1 text-sm text-gray-500">Try changing your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Vehicles;