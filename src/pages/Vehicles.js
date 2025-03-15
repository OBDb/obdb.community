import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import VehicleCard from '../components/VehicleCard';
import LoadingIcon from '../components/icons/LoadingIcon';

const Vehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    query: '',
    yearRange: '',
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [yearRanges, setYearRanges] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const makes = await dataService.getMakes();
        setMakes(makes);

        const vehicles = await dataService.getVehicles();

        try {
          const matrixResponse = await fetch('/data/matrix_data.json');
          if (matrixResponse.ok) {
            const matrixData = await matrixResponse.json();

            // Process vehicle parameters to extract model year information
            const uniqueYearRanges = new Set();
            const decades = new Set();

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
        } catch (err) {
          console.warn('Failed to load matrix data:', err);
        }

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
    // Filter by make
    if (filters.make && vehicle.make !== filters.make) {
      return false;
    }

    // Filter by query (searching both make and model with case-insensitive partial match)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const makeMatch = vehicle.make.toLowerCase().includes(query);
      const modelMatch = vehicle.model.toLowerCase().includes(query);

      if (!makeMatch && !modelMatch) {
        return false;
      }
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
      if (selectedVehicles.length < 5) {
        setSelectedVehicles([...selectedVehicles, newVehicle]);
      }
    }
  };

  // Define filter fields for the SearchFilter component
  const filterFields = [
    {
      name: 'query',
      label: 'Search',
      type: 'text',
      placeholder: 'Search makes and models...',
      className: 'flex-1 min-w-[200px]'
    },
    {
      name: 'make',
      label: 'Make',
      type: 'select',
      options: makes,
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

  // Start comparison of selected vehicles
  const startComparison = () => {
    if (selectedVehicles.length >= 2) {
      // Create comparison URL with vehicles
      const compareParam = selectedVehicles.map(v => `${v.make}-${v.model}`).join(',');
      navigate(`/vehicles/compare?vehicles=${encodeURIComponent(compareParam)}`);
    }
  };

  // Actions for the page header
  const pageActions = (
    <>
      {selectedVehicles.length > 0 && (
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={startComparison}
            disabled={selectedVehicles.length < 2}
            className={`btn ${selectedVehicles.length >= 2 ? 'btn-primary' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Compare Selected
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

  return (
    <div>
      <PageHeader
        title="Browse Vehicles"
        description={!loading && !error &&
          `${filteredVehicles.length} vehicles found. ${
            selectedVehicles.length > 0
              ? `Select up to ${5 - selectedVehicles.length} more to compare.`
              : 'Select up to 5 vehicles to compare parameters.'
          }`
        }
        actions={pageActions}
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
    </div>
  );
};

export default Vehicles;
