// src/pages/Home.js
import React from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CodeIcon from '@mui/icons-material/Code';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to OBDb Explorer
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Explore vehicle OBD parameters, commands, and vehicle-specific mappings
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Browse Vehicles
              </Typography>
              <Typography>
                Explore all available vehicles and see which OBD parameters are mapped for each make and model.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button size="large" component={RouterLink} to="/vehicles" variant="contained">
                View Vehicles
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <ListAltIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Parameters Database
              </Typography>
              <Typography>
                Search and filter through all OBD parameters across all vehicles to find specific signals.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button size="large" component={RouterLink} to="/parameters" variant="contained">
                Explore Parameters
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                OBD Commands
              </Typography>
              <Typography>
                View all available OBD commands and which vehicles support each command.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button size="large" component={RouterLink} to="/commands" variant="contained">
                View Commands
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          About OBDb Explorer
        </Typography>
        <Typography variant="body1" paragraph>
          This tool is designed to make it easy to visualize and explore the complete set of OBD parameters
          that have been mapped for every vehicle in the OBDb GitHub organization.
        </Typography>
        <Typography variant="body1">
          Each vehicle repository contains a signalset definition that follows the OBDb specification, and this
          explorer helps identify commonalities in these mappings across different vehicles.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
