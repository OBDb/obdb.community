// src/pages/VehicleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import dataService from '../services/dataService';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VehicleDetail = () => {
  const { make, model } = useParams();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filteredParams, setFilteredParams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ecuHeaders, setEcuHeaders] = useState([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        const params = await dataService.getVehicleParameters(make, model);
        setParameters(params);

        // Extract unique ECU headers
        const headers = [...new Set(params.map(param => param.hdr))].sort();
        setEcuHeaders(headers);

        setFilteredParams(params);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load data for ${make} ${model}.`);
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicleData();
  }, [make, model]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = parameters.filter(param =>
        param.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParams(filtered);
    } else {
      setFilteredParams(parameters);
    }
  }, [searchQuery, parameters]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const openGitHubRepo = () => {
    const url = `https://github.com/OBDb/${make}-${model}/blob/main/signalsets/v3/default.json`;
    window.open(url, '_blank');
  };

  // Group parameters by ECU for the ECU tab
  const paramsByEcu = ecuHeaders.reduce((acc, header) => {
    acc[header] = filteredParams.filter(param => param.hdr === header);
    return acc;
  }, {});

  // Group parameters by suggested metric for the metrics tab
  const paramsByMetric = filteredParams.reduce((acc, param) => {
    const metric = param.suggestedMetric || 'Other';
    if (!acc[metric]) acc[metric] = [];
    acc[metric].push(param);
    return acc;
  }, {});

  const metricGroups = Object.entries(paramsByMetric)
    .sort(([a], [b]) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

  return (
    <Container maxWidth="lg">
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/vehicles">
          Vehicles
        </Link>
        <Typography color="text.primary">{make} {model}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {make} {model}
        </Typography>
        <Tooltip title="View on GitHub">
          <IconButton onClick={openGitHubRepo} color="primary">
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search Parameters"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Filter by parameter ID or name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

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
          <Paper sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="vehicle tabs"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="All Parameters" />
                <Tab label="By ECU" />
                <Tab label="By Metric" />
              </Tabs>
            </Box>

            {/* All Parameters Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {filteredParams.length} parameters found
              </Typography>
              <TableContainer>
                <Table aria-label="parameters table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ECU</TableCell>
                      <TableCell>Parameter ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Suggested Metric</TableCell>
                      <TableCell>Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredParams.map((param) => (
                      <TableRow key={`${param.hdr}_${param.id}`} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {param.hdr}
                          </Typography>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>{param.unit || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {filteredParams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No parameters found matching "{searchQuery}".
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* By ECU Tab */}
            <TabPanel value={tabValue} index={1}>
              {Object.entries(paramsByEcu).map(([header, ecuParams]) => (
                ecuParams.length > 0 && (
                  <Box key={header} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        ECU: {header}
                      </Typography>
                      <Chip
                        label={`${ecuParams.length} parameters`}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Parameter ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Suggested Metric</TableCell>
                            <TableCell>Unit</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ecuParams.map((param) => (
                            <TableRow key={param.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {param.id}
                                </Typography>
                              </TableCell>
                              <TableCell>{param.name}</TableCell>
                              <TableCell>
                                {param.suggestedMetric || '—'}
                              </TableCell>
                              <TableCell>{param.unit || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )
              ))}
              {Object.values(paramsByEcu).every(group => group.length === 0) && (
                <Typography sx={{ textAlign: 'center', my: 4 }}>
                  No parameters found matching the search criteria.
                </Typography>
              )}
            </TabPanel>

            {/* By Metric Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {metricGroups.map(([metric, metricParams]) => (
                  <Grid item xs={12} key={metric}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" component="h3">
                            {metric}
                          </Typography>
                          <Chip
                            label={`${metricParams.length} parameters`}
                            size="small"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>ECU</TableCell>
                                <TableCell>Parameter ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Unit</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {metricParams.map((param) => (
                                <TableRow key={`${param.hdr}_${param.id}`} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                      {param.hdr}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      {param.id}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{param.name}</TableCell>
                                  <TableCell>{param.unit || '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {metricGroups.length === 0 && (
                  <Grid item xs={12}>
                    <Typography sx={{ textAlign: 'center', my: 4 }}>
                      No parameters found matching the search criteria.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default VehicleDetail;
