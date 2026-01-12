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

const statusColors: Record<
  OrderStatus,
  'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error'
> = {
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

  useEffect(() => {
    if (order) setPackedItems(new Set());
  }, [order?.orderId]);

  if (!order) return null;

  const totalItems = order.items.length;
  const packedCount = packedItems.size;
  const allPacked = packedCount === totalItems && totalItems > 0;
  const packingProgress = totalItems
    ? (packedCount / totalItems) * 100
    : 0;

  const togglePacked = (articleId: number) => {
    setPackedItems(prev => {
      const set = new Set(prev);
      set.has(articleId) ? set.delete(articleId) : set.add(articleId);
      return set;
    });
  };

  const setStatus = (status: OrderStatus) => {
    onStatusChange(order.orderId, status);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Porudžbina #{order.orderId}
          </Typography>
          {order.verified && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Verifikovano"
              color="success"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* KUPAC */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Podaci o kupcu
            </Typography>
            <Typography fontWeight={600}>{order.customerName}</Typography>
            <Button
              startIcon={<PhoneIcon />}
              color={order.verified ? 'success' : 'primary'}
              onClick={() => onPhoneClick(order.orderId, order.phone)}
              sx={{ mt: 1 }}
            >
              {order.phone}
            </Button>
          </Box>

          {/* NAPOMENA */}
          {order.info && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Napomena
              </Typography>
              <Box p={2} bgcolor="grey.100" borderRadius={1}>
                {order.info}
              </Box>
            </Box>
          )}

          {/* MAPA */}
          {order.location && order.lat && order.lng && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Lokacija dostave
              </Typography>
              <Box display="flex" gap={1} mb={2}>
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

          {/* PAKOVANJE */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2">
                Pakovanje ({packedCount}/{totalItems})
              </Typography>
              {allPacked && (
                <Chip
                  label="Sve spakovano"
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <LinearProgress
              variant="determinate"
              value={packingProgress}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
              color={allPacked ? 'success' : 'primary'}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Artikal</TableCell>
                  <TableCell align="right">Cena</TableCell>
                  <TableCell align="right">Količina</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map(i => {
                  const packed = packedItems.has(i.product.articleId);
                  return (
                    <TableRow
                      key={i.product.articleId}
                      sx={{
                        bgcolor: packed ? 'success.light' : undefined,
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={packed}
                          onChange={() =>
                            togglePacked(i.product.articleId)
                          }
                          color="success"
                        />
                      </TableCell>
                      <TableCell>{i.product.name}</TableCell>
                      <TableCell align="right">
                        {i.product.price} RSD
                      </TableCell>
                      <TableCell align="right">
                        {i.quantity} {i.product.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          <Divider />

          {/* STATUS SELECT */}
          <FormControl fullWidth>
            <Select
              value={order.status}
              onChange={e =>
                setStatus(e.target.value as OrderStatus)
              }
            >
              {Object.entries(statusLabels).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  <Chip
                    size="small"
                    label={v}
                    color={statusColors[k as OrderStatus]}
                    sx={{ mr: 1 }}
                  />
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      {/* AKCIJE */}
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Zatvori</Button>

        {['pending', 'confirmed', 'preparing'].includes(order.status) && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LocalShippingIcon />}
            onClick={() => setStatus('delivering')}
          >
            Pokreni dostavu
          </Button>
        )}

        {order.status === 'delivering' && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setStatus('cancelled')}
            >
              Otkazano
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => setStatus('delivered')}
            >
              Dostavljeno
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
