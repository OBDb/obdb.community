// src/pages/VehicleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dataService from '../services/dataService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import ModelYearPidSupport from '../components/ModelYearPidSupport';
import TabPanel from '../components/TabPanel';

import {
  VehicleHeader,
  SearchFilter,
  YearRangeSummary,
  AllParametersTab,
  ByEcuTab,
  ByMetricTab,
  BySignalGroupTab
} from '../components/vehicle';

import {
  groupParametersByEcu,
  groupParametersByMetric,
  groupParametersBySignalGroup,
  filterParameters,
  processYearRanges
} from '../utils/parameterUtils';

const VehicleDetail = () => {
  const { make, model } = useParams();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filteredParams, setFilteredParams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ecuHeaders, setEcuHeaders] = useState([]);
  const [expandedParameterId, setExpandedParameterId] = useState(null);
  const [commandData, setCommandData] = useState(null);
  // State for year range filters
  const [yearRangeFilter, setYearRangeFilter] = useState('all');
  const [yearRanges, setYearRanges] = useState([]);
  // State to track parameters by year range
  const [paramsByYearRange, setParamsByYearRange] = useState({});
  // State for special cases
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  // Check if this is a BMW vehicle
  const isBMW = make && make.toLowerCase() === 'bmw';
  // State for signal groups
  const [signalGroups, setSignalGroups] = useState({});

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);

        // Handle the special case like SAEJ1979 that doesn't have a model
        if (make && !model) {
          setIsSpecialCase(true);

          // For SAEJ1979 or other special cases, we'll fetch data differently
          const params = await dataService.getSpecialCaseParameters(make);

          if (params && params.length > 0) {
            setParameters(params);

            // Extract unique ECU headers or extended addresses for BMW
            const ecuIdentifiers = isBMW
              ? [...new Set(params.map(param => param.eax || param.hdr))].sort()
              : [...new Set(params.map(param => param.hdr))].sort();
            setEcuHeaders(ecuIdentifiers);

            // Group parameters by signal group
            const groups = groupParametersBySignalGroup(params);
            setSignalGroups(groups);

            setFilteredParams(params);
          } else {
            setError(`No data found for ${make}`);
          }
        } else {
          // Standard make/model case
          const params = await dataService.getVehicleParameters(make, model);

          // Process year ranges
          const { yearRanges: processedRanges, paramsByYearRange: processedParams } =
            processYearRanges(params);

          setYearRanges(processedRanges);
          setParamsByYearRange(processedParams);
          setParameters(params);

          // Extract unique ECU headers or extended addresses for BMW
          const ecuIdentifiers = isBMW
            ? [...new Set(params.map(param => param.eax || param.hdr))].sort()
            : [...new Set(params.map(param => param.hdr))].sort();
          setEcuHeaders(ecuIdentifiers);

          // Group parameters by signal group
          const groups = groupParametersBySignalGroup(params);
          setSignalGroups(groups);

          setFilteredParams(params);
        }

        setLoading(false);
      } catch (err) {
        const errorMsg = model
          ? `Failed to load data for ${make} ${model}.`
          : `Failed to load data for ${make}.`;
        setError(errorMsg);
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicleData();
  }, [make, model, isBMW]);

  useEffect(() => {
    // Apply search and year range filters
    const filtered = filterParameters(parameters, searchQuery, yearRangeFilter, paramsByYearRange);
    setFilteredParams(filtered);

    // Reset expanded state when filters change
    setExpandedParameterId(null);
    setCommandData(null);
  }, [searchQuery, yearRangeFilter, parameters, paramsByYearRange]);

  const handleTabChange = (index) => {
    setTabValue(index);
    // Reset expanded state when changing tabs
    setExpandedParameterId(null);
    setCommandData(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleYearRangeFilterChange = (e) => {
    setYearRangeFilter(e.target.value);
  };

  const handleExpandParameter = async (parameter) => {
    if (expandedParameterId === parameter.id) {
      // Collapse if already expanded
      setExpandedParameterId(null);
      setCommandData(null);
      return;
    }

    // Always set the expanded parameter ID immediately for better UX
    setExpandedParameterId(parameter.id);

    try {
      // Find the command details for this parameter
      const commands = await dataService.getCommands({
        hdr: parameter.hdr
      });

      // Format the command to match
      const cmdFormatted = Object.entries(parameter.cmd)
        .map(([key, value]) => `${key}${value}`)
        .join('');

      // Find the specific command that contains this parameter
      const matchingCommand = commands.find(cmd => {
        const cmdKeyFormatted = Object.entries(cmd.cmd)
          .map(([key, value]) => `${key}${value}`)
          .join('');
        return cmdKeyFormatted === cmdFormatted && cmd.hdr === parameter.hdr;
      });

      if (matchingCommand) {
        setCommandData(matchingCommand);
      } else {
        console.error('Could not find matching command for parameter', parameter.id);
        // If we can't find a matching command, create a simple command object with the parameter
        setCommandData({
          id: parameter.id,
          hdr: parameter.hdr,
          eax: parameter.eax, // Include extended address
          cmd: parameter.cmd,
          parameters: [parameter],
          vehicles: []
        });
      }
    } catch (err) {
      console.error('Error fetching command details', err);
      // Still provide basic parameter details if command data fetch fails
      setCommandData({
        id: parameter.id,
        hdr: parameter.hdr,
        eax: parameter.eax, // Include extended address
        cmd: parameter.cmd,
        parameters: [parameter],
        vehicles: []
      });
    }
  };

  // Create required data structures for tabs
  const paramsByEcu = groupParametersByEcu(filteredParams, ecuHeaders, isBMW);
  const metricGroups = groupParametersByMetric(filteredParams);

  // Filter signal groups based on the current search/filter
  const filteredSignalGroups = {};
  if (searchQuery || yearRangeFilter !== 'all') {
    // Recompute signal groups using only the filtered parameters
    const filtered = groupParametersBySignalGroup(filteredParams);
    Object.assign(filteredSignalGroups, filtered);
  } else {
    // Use all signal groups when no filtering is applied
    Object.assign(filteredSignalGroups, signalGroups);
  }

  // Identify parameters that belong to signal groups
  const groupedParameterIds = new Set();
  Object.values(filteredSignalGroups).forEach(group => {
    group.parameters.forEach(param => {
      groupedParameterIds.add(param.id);
    });
  });

  // Render loading spinner or error message if needed
  if (loading) {
    return <LoadingSpinner size="md" centered={true} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  // Check if we have any signal groups
  const hasSignalGroups = Object.keys(signalGroups).length > 0;

  // Define tab options based on available data
  const tabOptions = ["All Parameters", "By ECU", "By Metric"];
  if (hasSignalGroups) {
    tabOptions.push("By Signal Group");
  }

  return (
    <div>
      {/* Vehicle Header Component */}
      <VehicleHeader
        make={make}
        model={model}
        isSpecialCase={isSpecialCase}
        parameterCount={parameters.length}
      />

      {/* Model Year Info Section - Only show for regular vehicles */}
      {!isSpecialCase && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModelYearPidSupport make={make} model={model} />
          <YearRangeSummary
            yearRanges={yearRanges}
            ecuHeaders={ecuHeaders}
            isBMW={isBMW}
          />
        </div>
      )}

      {/* Search and Filters Component */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        yearRangeFilter={yearRangeFilter}
        onYearRangeFilterChange={handleYearRangeFilterChange}
        yearRanges={yearRanges}
      />

      {/* Tab Panel with Content Components */}
      <TabPanel
        tabs={tabOptions}
        activeTab={tabValue}
        onTabChange={handleTabChange}
      >
        {/* All Parameters Tab */}
        {tabValue === 0 && (
          <AllParametersTab
            filteredParams={filteredParams}
            expandedParameterId={expandedParameterId}
            commandData={commandData}
            handleExpandParameter={handleExpandParameter}
            isBMW={isBMW}
            groupedParameterIds={groupedParameterIds}
            hasSignalGroups={hasSignalGroups}
            onSignalGroupTabSelect={() => setTabValue(3)}
          />
        )}

        {/* By ECU Tab */}
        {tabValue === 1 && (
          <ByEcuTab
            paramsByEcu={paramsByEcu}
            expandedParameterId={expandedParameterId}
            commandData={commandData}
            handleExpandParameter={handleExpandParameter}
          />
        )}

        {/* By Metric Tab */}
        {tabValue === 2 && (
          <ByMetricTab
            metricGroups={metricGroups}
            expandedParameterId={expandedParameterId}
            commandData={commandData}
            handleExpandParameter={handleExpandParameter}
            isBMW={isBMW}
          />
        )}

        {/* By Signal Group Tab */}
        {tabValue === 3 && hasSignalGroups && (
          <BySignalGroupTab
            signalGroups={filteredSignalGroups}
            expandedParameterId={expandedParameterId}
            commandData={commandData}
            handleExpandParameter={handleExpandParameter}
            isBMW={isBMW}
          />
        )}
      </TabPanel>
    </div>
  );
};

export default VehicleDetail;
