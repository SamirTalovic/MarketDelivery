import React from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, Chip, Stack, Divider
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import type { Order, OrderStatus } from '../../types';
import DeliveryRouteMap from './DeliveryRouteMap';
import { orderApi, type UpdateOrderDto } from '../../services/api';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđeno',
  preparing: 'Priprema se',
  delivering: 'Dostavlja se',
  delivered: 'Dostavljeno',
  cancelled: 'Otkazano',
};

const statusColors: Record<OrderStatus, any> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'primary',
  delivering: 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

interface Props {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onPhoneClick: (orderId: number, phone: string) => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}

const OrderDetailsDialog: React.FC<Props> = ({
  open,
  order,
  onClose,
  onStatusChange
}) => {
  if (!order) return null;

  // 🟢 Helper funkcija za update order u bazi
  const updateOrder = async (status?: OrderStatus, verified?: boolean) => {
    if (!order) return;
    const data: UpdateOrderDto = {
      customerName: order.customerName,
      phone: order.phone,
      location: order.location,
      status: status ?? order.status,
      verified: verified ?? order.verified,
      lat: order.lat,
      lng: order.lng,
      articles: order.items.map(i => ({
        articleId: i.product.articleId,
        quantity: i.quantity,
      })),
    };
    await orderApi.update(order.orderId, data);
    onStatusChange(order.orderId, status ?? order.status);
  };

  // 🟢 Event handleri
  const handleVerify = () => updateOrder(undefined, true);
  const handleStartDelivery = () => updateOrder("delivering");
  const handleCancel = () => updateOrder("cancelled");
  const handleDelivered = () => updateOrder("delivered");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Porudžbina #{order.orderId}</Typography>
          {order.verified && (
            <Chip icon={<CheckCircleIcon />} label="Verifikovano" color="success" size="small" />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>

          {/* CUSTOMER INFO */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Podaci o kupcu
            </Typography>
            <Typography fontWeight={600}>{order.customerName}</Typography>
          <Button
  startIcon={<PhoneIcon />}
  onClick={async () => {
    // 1️⃣ Verifikacija ako nije
    if (!order.verified) {
      await updateOrder(undefined, true);
    }
    // 2️⃣ Poziv na broj
    window.open(`tel:${order.phone}`, '_self');
  }}
  color={order.verified ? 'success' : 'primary'}
  sx={{ mt: 1 }}
>
  {order.phone} {!order.verified && '(klikni za verifikaciju)'}
</Button>

          </Box>

          {/* LOCATION & ROUTE */}
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

          {/* ITEMS */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Artikli ({order.items.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proizvod</TableCell>
                    <TableCell align="right">Cena</TableCell>
                    <TableCell align="right">Količina</TableCell>
                    <TableCell align="right">Ukupno</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.product.articleId}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell align="right">{item.product.price} RSD</TableCell>
                      <TableCell align="right">{item.quantity} {item.product.unit}</TableCell>
                      <TableCell align="right">{item.product.price * item.quantity} RSD</TableCell>
                    </TableRow>
                  ))}
                  {order.deliveryFee > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <LocalShippingIcon fontSize="small" color="action" />
                          <Typography>Dostava:</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{order.deliveryFee} RSD</TableCell>
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
                      <Typography fontWeight={700} color="primary">{order.total} RSD</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* STATUS */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status porudžbine
            </Typography>
            <FormControl fullWidth>
              <Select
                value={order.status}
                onChange={(e) => updateOrder(e.target.value as OrderStatus)}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Chip label={label} size="small" color={statusColors[key as OrderStatus]} sx={{ mr: 1 }} />
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions>
        {!order.verified && (
          <Button onClick={handleVerify} color="success">Verifikuj broj</Button>
        )}

        {order.status !== "delivering" && (
          <Button onClick={handleStartDelivery} color="secondary">Pokreni dostavu</Button>
        )}

        {order.status === "delivering" && (
          <>
            <Button onClick={handleCancel} color="error">Otkazano</Button>
            <Button onClick={handleDelivered} color="success">Dostavljeno</Button>
          </>
        )}

        <Button onClick={onClose}>Zatvori</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
