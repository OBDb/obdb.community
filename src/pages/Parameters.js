// src/pages/Parameters.js
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
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import dataService from '../services/dataService';

const Parameters = () => {
  const [parameters, setParameters] = useState([]);
  const [suggestedMetrics, setSuggestedMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    query: '',
    metric: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load matrix data
        const data = await dataService.loadMatrixData();
        setSuggestedMetrics(data.suggestedMetrics);

        // Search parameters with no filters initially
        const result = await dataService.searchParameters({});
        setParameters(result);

        setLoading(false);
      } catch (err) {
        setError('Failed to load parameter data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchParams = async () => {
      try {
        setLoading(true);
        const result = await dataService.searchParameters(filters);
        setParameters(result);
        setPage(0); // Reset to first page when filters change
        setLoading(false);
      } catch (err) {
        setError('Error searching parameters.');
        setLoading(false);
        console.error(err);
      }
    };

    searchParams();
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

  const openGitHubRepo = (param) => {
    if (param.instances && param.instances.length > 0) {
      const instance = param.instances[0];
      const url = `https://github.com/OBDb/${instance.make}-${instance.model}/blob/main/signalsets/v3/default.json`;
      window.open(url, '_blank');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        OBD Parameters Database
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Parameters"
              value={filters.query}
              onChange={handleFilterChange('query')}
              placeholder="Search by parameter ID or name..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="metric-label">Suggested Metric</InputLabel>
              <Select
                labelId="metric-label"
                value={filters.metric}
                onChange={handleFilterChange('metric')}
                label="Suggested Metric"
              >
                <MenuItem value="">
                  <em>All Metrics</em>
                </MenuItem>
                {suggestedMetrics.map(metric => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="parameters table">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Suggested Metric</TableCell>
                    <TableCell>Vehicles</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parameters
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((param) => (
                      <TableRow key={param.id} hover>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">
                            {param.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{param.name}</TableCell>
                        <TableCell>
                          {param.suggestedMetric ? (
                            <Chip
                              label={param.suggestedMetric}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${param.vehicleCount} vehicles`}
                            size="small"
                            color="default"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View on GitHub">
                            <IconButton
                              size="small"
                              onClick={() => openGitHubRepo(param)}
                              color="primary"
                            >
                              <GitHubIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Parameter Details">
                            <IconButton
                              size="small"
                              color="primary"
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {parameters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No parameters found matching the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={parameters.length}
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

export default Parameters;
