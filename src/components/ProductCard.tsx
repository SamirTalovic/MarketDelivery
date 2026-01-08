import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAdd = () => {
    if (product.available) {
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        opacity: product.available ? 1 : 0.6,
        position: 'relative',
      }}
    >
      {!product.available && (
        <Chip
          label="Nije dostupno"
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
          }}
        />
      )}
      <Box
        sx={{
          height: { xs: 100, sm: 140 },
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: '2rem', sm: '3rem' },
        }}
      >
        🛒
      </Box>
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: { xs: 1.5, sm: 2 },
          '&:last-child': { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: '0.85rem', sm: '1rem' }, 
            mb: 0.5,
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </Typography>
        {product.addition && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          >
            {product.addition}
          </Typography>
        )}
        <Box sx={{ mt: 'auto' }}>
          <Typography
            variant="h5"
            color="primary"
            fontWeight={700}
            sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            {product.price} RSD
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              / {product.unit || 'kom'}
            </Typography>
          </Typography>

          {product.available && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1, 
                alignItems: { xs: 'stretch', sm: 'center' } 
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  size="small"
                  sx={{
                    width: { xs: 50, sm: 40 },
                    '& input': { textAlign: 'center', p: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } },
                    '& fieldset': { border: 'none' },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setQuantity(quantity + 1)}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size={isMobile ? 'medium' : 'small'}
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAdd}
                sx={{ 
                  flexGrow: 1,
                  py: { xs: 1, sm: 0.5 },
                  fontSize: { xs: '0.85rem', sm: '0.8rem' },
                }}
              >
                Dodaj
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
