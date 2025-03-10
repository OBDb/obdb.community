// src/pages/Commands.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dataService from '../services/dataService';

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
  const [expandedCommand, setExpandedCommand] = useState(null);

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

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandCommand = (commandId) => {
    setExpandedCommand(expandedCommand === commandId ? null : commandId);
  };

  const formatCommand = (cmd) => {
    return Object.entries(cmd)
      .map(([key, value]) => `${key}${value}`)
      .join(' ');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        OBD Commands
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="header-label">ECU Header</InputLabel>
              <Select
                labelId="header-label"
                value={filters.hdr}
                onChange={handleFilterChange('hdr')}
                label="ECU Header"
              >
                <MenuItem value="">
                  <em>All Headers</em>
                </MenuItem>
                {headers.map(header => (
                  <MenuItem key={header} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Filter by Parameter ID"
              value={filters.parameterId}
              onChange={handleFilterChange('parameterId')}
              placeholder="Enter parameter ID..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {commands.length} commands found
          </Typography>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="commands table">
                <TableHead>
                  <TableRow>
                    <TableCell>ECU Header</TableCell>
                    <TableCell>Command</TableCell>
                    <TableCell>Vehicle Coverage</TableCell>
                    <TableCell>Parameters</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commands
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((command) => (
                      <React.Fragment key={command.id}>
                        <TableRow
                          hover
                          onClick={() => handleExpandCommand(command.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" sx={{ fontWeight: 'bold' }}>
                              {command.hdr}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {formatCommand(command.cmd)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${command.vehicleCount} vehicles`}
                              size="small"
                              color="primary"
                              variant={command.vehicleCount > 5 ? "default" : "outlined"}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${command.parameters.length} parameters`}
                              size="small"
                              color="secondary"
                              variant={command.parameters.length > 5 ? "default" : "outlined"}
                            />
                          </TableCell>
                        </TableRow>
                        {expandedCommand === command.id && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ py: 0 }}>
                              <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Vehicles using this command:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {command.vehicles.slice(0, 10).map(vehicle => {
                                    const [make, model] = vehicle.split('-');
                                    return (
                                      <Chip
                                        key={vehicle}
                                        label={`${make} ${model}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    );
                                  })}
                                  {command.vehicles.length > 10 && (
                                    <Chip
                                      label={`+${command.vehicles.length - 10} more`}
                                      size="small"
                                    />
                                  )}
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>
                                  Parameters:
                                </Typography>
                                <List dense>
                                  {command.parameters.slice(0, 8).map(param => (
                                    <ListItem key={`${param.make}-${param.model}-${param.id}`} disablePadding>
                                      <ListItemText
                                        primary={param.id}
                                        secondary={param.name}
                                        primaryTypographyProps={{
                                          variant: 'body2',
                                          fontWeight: 'medium'
                                        }}
                                        secondaryTypographyProps={{
                                          variant: 'body2'
                                        }}
                                      />
                                    </ListItem>
                                  ))}
                                  {command.parameters.length > 8 && (
                                    <ListItem>
                                      <ListItemText
                                        primary={`+ ${command.parameters.length - 8} more parameters...`}
                                        primaryTypographyProps={{
                                          variant: 'body2',
                                          fontStyle: 'italic',
                                          color: 'text.secondary'
                                        }}
                                      />
                                    </ListItem>
                                  )}
                                </List>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  {commands.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No commands found matching the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={commands.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Commands;
