// src/components/ModelYearPidSupport.js
import React, { useState, useEffect } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import StatusBadge from './StatusBadge';
import TabPanel from './TabPanel';

const ModelYearPidSupport = ({ make, model }) => {
  const [modelYearData, setModelYearData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [yearTabs, setYearTabs] = useState([]);
  const [commandDescriptions, setCommandDescriptions] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch model year data
        const response = await fetch('/data/model_years_data.json');
        if (!response.ok) {
          throw new Error(`Failed to load model year data: ${response.statusText}`);
        }
        const data = await response.json();

        // Find data for this vehicle
        const vehicleData = data.find(
          v => v.make.toLowerCase() === make.toLowerCase() &&
               v.model.toLowerCase() === model.toLowerCase()
        );

        if (vehicleData) {
          setModelYearData(vehicleData);
          // Create tabs for each year
          const years = Object.keys(vehicleData.modelYears).sort();
          setYearTabs(years);
          setActiveTab(0); // Reset to first tab
        } else {
          // Not an error, just no data for this vehicle
          setModelYearData(null);
        }

        // Also fetch SAEJ1979 command descriptions
        try {
          const commandResponse = await fetch('/data/saej1979_commands.json');
          if (commandResponse.ok) {
            const commandData = await commandResponse.json();
            setCommandDescriptions(commandData);
          }
        } catch (err) {
          console.warn('Failed to load SAEJ1979 command descriptions', err);
          // Don't set error state - this is a non-critical failure
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading model year data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (make && model) {
      fetchData();
    }
  }, [make, model]);

  // Get a friendly description for a PID if available
  const getCommandDescription = (pid) => {
    if (commandDescriptions && commandDescriptions[pid]) {
      return commandDescriptions[pid];
    }
    return null;
  };

  // Function to get the count of PIDs for a given year
  const getPidCountForYear = (year) => {
    if (!modelYearData || !modelYearData.modelYears[year]) return 0;

    // Count unique PIDs across all ECUs
    const uniquePids = new Set();
    Object.values(modelYearData.modelYears[year]).forEach(pids => {
      pids.forEach(pid => uniquePids.add(pid));
    });

    return uniquePids.size;
  };

  // Render PID list for a specific year and ECU
  const renderPidList = (pids, year, ecu) => {
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {pids.map(pid => (
          <div
            key={`${year}-${ecu}-${pid}`}
            className="group relative cursor-help"
            title={getCommandDescription(pid) || `PID ${pid}`}
          >
            <StatusBadge
              text={pid}
              variant="primary"
              size="sm"
              rounded="md"
            />
            {getCommandDescription(pid) && (
              <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                {getCommandDescription(pid)}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="Model Year PID Support">
        <div className="p-4">
          <LoadingSpinner size="sm" centered={true} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Model Year PID Support">
        <div className="p-4">
          <ErrorAlert message={error} />
        </div>
      </Card>
    );
  }

  if (!modelYearData) {
    return (
      <Card title="Model Year PID Support">
        <div className="p-4 text-sm text-gray-500">
          No model year PID data available for this vehicle.
        </div>
      </Card>
    );
  }

  return (
    <div>
        {yearTabs.length > 0 ? (
          <TabPanel
            tabs={yearTabs.map(year => `${year} (${getPidCountForYear(year)} PIDs)`)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {/* Display ECUs and PIDs for the selected year */}
            <div className="space-y-4">
              {Object.entries(modelYearData.modelYears[yearTabs[activeTab]] || {}).map(([ecu, pids]) => (
                <div key={`${yearTabs[activeTab]}-${ecu}`} className="border-b pb-3 last:border-0">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">ECU: <span className="font-mono">{ecu}</span></h4>
                    <StatusBadge
                      text={`${pids.length} PIDs`}
                      variant="secondary"
                      size="sm"
                      className="ml-2"
                    />
                  </div>
                  {renderPidList(pids, yearTabs[activeTab], ecu)}
                </div>
              ))}
            </div>
          </TabPanel>
        ) : (
          <div className="text-sm text-gray-500">
            No model year data available.
          </div>
        )}
    </div>
  );
};

export default ModelYearPidSupport;
