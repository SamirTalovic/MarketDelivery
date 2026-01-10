import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Divider,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LocationPicker from '../components/LocationPicker';
import { useStore } from '../context/StoreContext';
import type { CustomerInfo, CustomerLocation } from '../types';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    getCartTotal, 
    placeOrder, 
    calculateDeliveryFee, 
    getDistanceFromStore,
    isOrderingAllowed,
    getOrderingHoursMessage,
    deliverySettings 
  } = useStore();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    location: undefined,
    note: '',
  });
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phone?: string; location?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderingBlocked, setOrderingBlocked] = useState(!isOrderingAllowed());

  // Calculate delivery fee and distance based on location
  const deliveryFee = useMemo(() => {
    if (customerInfo.location) {
      return calculateDeliveryFee(customerInfo.location);
    }
    return 0;
  }, [customerInfo.location, calculateDeliveryFee]);

  const distance = useMemo(() => {
    if (customerInfo.location) {
      return getDistanceFromStore(customerInfo.location);
    }
    return 0;
  }, [customerInfo.location, getDistanceFromStore]);

  const cartTotal = getCartTotal();
  const totalWithDelivery = cartTotal + deliveryFee;

  // Check ordering hours every minute
  useEffect(() => {
    const checkOrdering = () => setOrderingBlocked(!isOrderingAllowed());
    checkOrdering();
    const interval = setInterval(checkOrdering, 60000);
    return () => clearInterval(interval);
  }, [isOrderingAllowed]);

  const validate = () => {
    const newErrors: { firstName?: string; lastName?: string; phone?: string; location?: string } = {};
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'Unesite ime';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Unesite prezime';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Unesite broj telefona';
    if (!customerInfo.location) newErrors.location = 'Izaberite lokaciju na mapi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationChange = (location: CustomerLocation) => {
    setCustomerInfo({ ...customerInfo, location });
    if (errors.location) {
      setErrors({ ...errors, location: undefined });
    }
  };

  const handleOrder = () => {
    if (!isOrderingAllowed()) {
      setOrderingBlocked(true);
      return;
    }
    if (validate() && cart.length > 0) {
      placeOrder(customerInfo, deliveryFee);
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 8, flexGrow: 1, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Vaša korpa je prazna
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Dodajte proizvode u korpu da biste nastavili
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Nazad na kupovinu
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Nazad na kupovinu
        </Button>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Vaša korpa
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Box sx={{ flex: { xs: 1, md: 7 } }}>
            <Card>
              <CardContent>
                {cart.map((item, index) => (
                  <React.Fragment key={item.product.articleId}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'grey.100',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0,
                        }}
                      >
                        🛒
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight={600}>{item.product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.product.price} RSD / {item.product.unit || 'kom'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.product.articleId, item.quantity - 1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 1, minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.product.articleId, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                        {item.product.price * item.quantity} RSD
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.product.articleId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: 1, md: 5 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Podaci za dostavu
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Ime"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Prezime"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      required
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Broj telefona"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                  
                  {/* Location Picker */}
                  <LocationPicker
                    value={customerInfo.location}
                    onChange={handleLocationChange}
                    error={!!errors.location}
                    helperText={errors.location}
                  />

                  <TextField
                    fullWidth
                    label="Napomena (opciono)"
                    value={customerInfo.note}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Ukupno artikala:</Typography>
                  <Typography fontWeight={600}>{cart.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Cena proizvoda:</Typography>
                  <Typography fontWeight={600}>{cartTotal} RSD</Typography>
                </Box>
                
                {/* Delivery fee section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon fontSize="small" color="action" />
                    <Typography>Dostava:</Typography>
                  </Box>
                  {customerInfo.location ? (
                    deliveryFee === 0 ? (
                      <Typography fontWeight={600} color="success.main">BESPLATNA</Typography>
                    ) : (
                      <Typography fontWeight={600}>{deliveryFee} RSD</Typography>
                    )
                  ) : (
                    <Typography color="text.secondary" variant="body2">Izaberite lokaciju</Typography>
                  )}
                </Box>

                {/* Distance info */}
                {customerInfo.location && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary" variant="body2">Udaljenost:</Typography>
                    <Typography variant="body2" color={distance > deliverySettings.distanceThresholdKm ? 'warning.main' : 'text.secondary'}>
                      {distance.toFixed(1)} km
                    </Typography>
                  </Box>
                )}
                
                {/* Free delivery hint */}
               
                {/* Ordering hours warning */}
                {orderingBlocked && (
                  <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
                    {getOrderingHoursMessage()}
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">Ukupno za plaćanje:</Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {customerInfo.location ? totalWithDelivery : cartTotal} RSD
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleOrder}
                  disabled={cart.length === 0 || orderingBlocked}
                >
                  {orderingBlocked ? 'Van radnog vremena' : 'Potvrdi porudžbinu'}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Porudžbina uspešno poslata! Bićete preusmereni...
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default Cart;
