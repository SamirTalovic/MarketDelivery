import React from 'react';
import { Box, Container, Typography, Divider, Stack } from '@mui/material';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1A1A1A',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={4}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>
              HARI-M
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Vaša lokalna prodavnica za svežu hranu i namirnice. Brza dostava na vašu adresu.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>
              Kontakt
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalPhoneIcon fontSize="small" sx={{ color: 'grey.400' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                +381 69 691 415
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ color: 'grey.400' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Adresa prodavnice
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>
              Radno vreme
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: 'grey.400' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Pon - Sub: 08:00 - 20:00
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', ml: 3.5 }}>
              Nedelja: 08:00 - 15:00
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 3, borderColor: 'grey.800' }} />
        <Typography variant="body2" align="center" sx={{ color: 'grey.500' }}>
          © {new Date().getFullYear()} HARI-M. Sva prava zadržana.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
