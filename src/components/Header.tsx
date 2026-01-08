import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemsCount } = useStore();

  const isAdmin = location.pathname.includes('admin');

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 }, justifyContent: 'space-between' }}>
          <Box
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              gap: 1,
            }}
            onClick={() => navigate('/')}
          >
            <StorefrontIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                HARI-M
              </Typography>
              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, display: 'block', mt: -0.5 }}
                >
                  Dostava namirnica
                </Typography>
              )}
            </Box>
          </Box>

          {!isAdmin && (
            <IconButton
              color="inherit"
              onClick={() => navigate('/korpa')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <Badge 
                badgeContent={getCartItemsCount()} 
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontWeight: 700,
                  }
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
