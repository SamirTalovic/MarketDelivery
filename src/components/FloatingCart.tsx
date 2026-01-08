import React from 'react';
import { Fab, Badge, Zoom, Box, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemsCount, getCartTotal } = useStore();
  
  const itemCount = getCartItemsCount();
  const total = getCartTotal();
  
  // Hide on cart page, admin pages, or if cart is empty
  const isVisible = itemCount > 0 && 
    !location.pathname.includes('/korpa') && 
    !location.pathname.includes('/admin');

  return (
    <Zoom in={isVisible}>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
        }}
      >
        <Fab
          color="secondary"
          aria-label="Korpa"
          onClick={() => navigate('/korpa')}
          sx={{
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <Badge 
            badgeContent={itemCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 700,
                fontSize: '0.75rem',
                top: -4,
                right: -4,
              }
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Badge>
        </Fab>
        
        {/* Price tooltip */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography 
            variant="body2" 
            fontWeight={700} 
            color="primary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {total.toLocaleString()} RSD
          </Typography>
        </Box>
      </Box>
    </Zoom>
  );
};

export default FloatingCart;
