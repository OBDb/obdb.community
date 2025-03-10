// src/components/Footer.js
import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' OBDb Explorer | '}
          <Link
            color="inherit"
            href="https://github.com/OBDb"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <GitHubIcon sx={{ fontSize: 16, mr: 0.5 }} />
            GitHub Organization
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
