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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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

  // Calculate discount percentage
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  return (
    <Card
      sx={{
        height: 'auto',
        minHeight: { xs: 140, sm: 160 },
        display: 'flex',
        flexDirection: 'row',
        opacity: product.available ? 1 : 0.6,
        position: 'relative',
        overflow: 'hidden',
        mb: { xs: 0, sm: 0 },
      }}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <Chip
          icon={<LocalOfferIcon sx={{ fontSize: '0.9rem !important' }} />}
          label={`-${discountPercent}%`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 8,
            zIndex: 2,
            fontWeight: 700,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          }}
        />
      )}

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

      {/* Product Image - Left Side */}
      <Box
        sx={{
          width: { xs: 100, sm: 140 },
          minWidth: { xs: 100, sm: 140 },
          height: { xs: 120, sm: 160 },
          background: product.pictureUrl 
            ? 'transparent' 
            : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px 0 0 8px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {product.pictureUrl ? (
          <Box
            component="img"
            src={product.pictureUrl}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>🛒</Typography>
        )}
      </Box>

      {/* Product Info - Right Side */}
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: { xs: 1.5, sm: 2 },
          '&:last-child': { pb: { xs: 1.5, sm: 2 } },
          minWidth: 0,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: '0.85rem', sm: '1rem' }, 
            mb: 0.5,
            lineHeight: 1.2,
            fontWeight: 600,
          }}
        >
          {product.name}
        </Typography>
        {product.addition && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              mb: 1, 
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.addition}
          </Typography>
        )}
        
        <Box sx={{ mt: 'auto' }}>
          {/* Price Section */}
          <Box sx={{ mb: 1 }}>
            {hasDiscount ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.disabled',
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  }}
                >
                  {product.price} RSD
                </Typography>
                <Typography
                  variant="h5"
                  color="error"
                  fontWeight={700}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {displayPrice} RSD
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    / {product.unit || 'kom'}
                  </Typography>
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="h5"
                color="primary"
                fontWeight={700}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {displayPrice} RSD
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  / {product.unit || 'kom'}
                </Typography>
              </Typography>
            )}
          </Box>

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
                color={hasDiscount ? 'error' : 'secondary'}
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
