// src/pages/Commands.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import CommandTable from '../components/CommandTable';
import DataPageLayout from '../components/DataPageLayout';

const Commands = () => {
  const [commands, setCommands] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    hdr: '',
    parameterId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load matrix data
        const data = await dataService.loadMatrixData();
        setHeaders(data.headers);

        // Get commands with no filters initially
        const result = await dataService.getCommands({});
        setCommands(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load command data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchCommands = async () => {
      try {
        setLoading(true);
        const result = await dataService.getCommands(filters);
        setCommands(result);
        setPage(0); // Reset to first page when filters change
        setLoading(false);
      } catch (err) {
        setError('Error searching commands.');
        setLoading(false);
        console.error(err);
      }
    };

    searchCommands();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Define filter fields for the SearchFilter component
  const filterFields = [
    {
      name: 'hdr',
      label: 'ECU Header',
      type: 'select',
      options: headers,
      className: 'w-full sm:w-64'
    },
    {
      name: 'parameterId',
      label: 'Filter by Parameter ID',
      type: 'text',
      placeholder: 'Enter parameter ID...',
      className: 'flex-grow'
    }
  ];

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Render the command table
  const renderCommandTable = (data) => (
    <CommandTable
      commands={data}
      page={page}
      rowsPerPage={rowsPerPage}
    />
  );

  return (
    <DataPageLayout
      title="OBD Commands"
      description={`${commands.length} commands found`}
      filters={filters}
      onFilterChange={handleFilterChange}
      filterFields={filterFields}
      loading={loading}
      error={error}
      data={commands}
      emptyTitle="No commands found"
      emptyMessage="No commands found matching the current filters."
      renderData={renderCommandTable}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
};

export default Commands;
