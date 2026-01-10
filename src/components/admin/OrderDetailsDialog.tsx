import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  Divider,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { Order, OrderStatus } from '../../types';
import DeliveryRouteMap from './DeliveryRouteMap';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđeno',
  preparing: 'Priprema se',
  delivering: 'Dostavlja se',
  delivered: 'Dostavljeno',
  cancelled: 'Otkazano',
};

const statusColors: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'primary',
  delivering: 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

interface OrderDetailsDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onPhoneClick: (orderId: number, phone: string) => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  order,
  onClose,
  onPhoneClick,
  onStatusChange,
}) => {
  const [packedItems, setPackedItems] = useState<Set<number>>(new Set());

  // Reset packed items when order changes
  useEffect(() => {
    if (order) {
      setPackedItems(new Set());
    }
  }, [order?.orderId]);

  if (!order) return null;

  const totalItems = order.items.length;
  const packedCount = packedItems.size;
  const allPacked = packedCount === totalItems && totalItems > 0;
  const packingProgress = totalItems > 0 ? (packedCount / totalItems) * 100 : 0;

  const handleTogglePacked = (articleId: number) => {
    setPackedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Porudžbina #{order.orderId}
          </Typography>
          {order.verified && (
            <Chip icon={<CheckCircleIcon />} label="Verifikovano" color="success" size="small" />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Customer Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Podaci o kupcu
            </Typography>
            <Typography fontWeight={600}>
              {order.customerName}
            </Typography>
            <Button
              startIcon={<PhoneIcon />}
              onClick={() => onPhoneClick(order.orderId, order.phone)}
              color={order.verified ? 'success' : 'primary'}
              sx={{ mt: 1 }}
            >
              {order.phone}
              {!order.verified && ' (Klikni za verifikaciju)'}
            </Button>
          </Box>

          {/* Customer Note/Info */}
          {order.info && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Napomena kupca
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography>{order.info}</Typography>
              </Box>
            </Box>
          )}

          {/* Location with Route */}
          {order.location && order.lat && order.lng && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lokacija dostave sa rutom
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationOnIcon color="primary" />
                <Typography>{order.location}</Typography>
              </Box>
              <DeliveryRouteMap
                customerLat={order.lat}
                customerLng={order.lng}
                customerName={order.customerName}
                customerAddress={order.location}
              />
            </Box>
          )}

          <Divider />

          {/* Order Items with Packing Checkboxes */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color={allPacked ? 'success' : 'action'} />
                <Typography variant="subtitle2" color="text.secondary">
                  Pakovanje artikala ({packedCount}/{totalItems})
                </Typography>
              </Box>
              {allPacked && (
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="Sve spakovano!" 
                  color="success" 
                  size="small" 
                />
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={packingProgress} 
              color={allPacked ? 'success' : 'primary'}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Spakovano</TableCell>
                    <TableCell>Proizvod</TableCell>
                    <TableCell align="right">Cena</TableCell>
                    <TableCell align="right">Količina</TableCell>
                    <TableCell align="right">Ukupno</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => {
                    const isPacked = packedItems.has(item.product.articleId);
                    return (
                      <TableRow 
                        key={item.product.articleId}
                        sx={{ 
                          bgcolor: isPacked ? 'success.light' : 'inherit',
                          opacity: isPacked ? 0.8 : 1,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isPacked}
                            onChange={() => handleTogglePacked(item.product.articleId)}
                            color="success"
                          />
                        </TableCell>
                        <TableCell sx={{ textDecoration: isPacked ? 'line-through' : 'none' }}>
                          {item.product.name}
                        </TableCell>
                        <TableCell align="right">{item.product.price} RSD</TableCell>
                        <TableCell align="right">{item.quantity} {item.product.unit}</TableCell>
                        <TableCell align="right">{item.product.price * item.quantity} RSD</TableCell>
                      </TableRow>
                    );
                  })}
                  {order.deliveryFee > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <LocalShippingIcon fontSize="small" color="action" />
                          <Typography>Dostava:</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography>{order.deliveryFee} RSD</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {order.deliveryFee === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography>Dostava:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight={600}>BESPLATNA</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography fontWeight={700}>Ukupno za plaćanje:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700} color="primary">
                        {order.total} RSD
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* Status Change */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status porudžbine
            </Typography>
            <FormControl fullWidth>
              <Select
                value={order.status}
                onChange={(e) => onStatusChange(order.orderId, e.target.value as OrderStatus)}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Chip 
                      label={label} 
                      size="small" 
                      color={statusColors[key as OrderStatus]} 
                      sx={{ mr: 1 }}
                    />
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zatvori</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
