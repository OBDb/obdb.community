// src/pages/Vehicles.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dataService from '../services/dataService';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

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

  // Vehicle card component
  const VehicleCard = ({ make, model }) => (
    <Link
      to={`/vehicles/${make}/${model}`}
      className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 hover:border-primary-300 transition-colors"
    >
      <div className="flex items-center">
        <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
        </svg>
        <span className="text-sm font-medium">{model}</span>
      </div>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Browse Vehicles"
        description={!loading && !error && `${filteredVehicles.length} vehicles found`}
      />

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
    </div>
  );
};

export default Vehicles;