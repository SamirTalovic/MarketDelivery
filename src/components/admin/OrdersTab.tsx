import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  InputAdornment,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import type { Order, OrderStatus } from '../../types';

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

interface OrdersTabProps {
  orders: Order[];
  onOpenOrder: (order: Order) => void;
  onPhoneClick: (orderId: number, phone: string) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onOpenOrder,
  onPhoneClick,
}) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Status priority: pending first, then active, then completed/cancelled
  const statusPriority: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 5,
  };

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (verifiedFilter === 'verified' && !order.verified) return false;
      if (verifiedFilter === 'unverified' && order.verified) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesPhone = order.phone.toLowerCase().includes(query);
        const matchesId = order.orderId.toString().includes(query);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }
      
      return true;
    });

    // Sort: pending orders first, completed/cancelled last
    return filtered.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  }, [orders, statusFilter, searchQuery, verifiedFilter]);

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Porudžbine ({filteredOrders.length})
      </Typography>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Pretraga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <MenuItem value="all">Svi statusi</MenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Verifikacija</InputLabel>
          <Select
            value={verifiedFilter}
            label="Verifikacija"
            onChange={(e) => setVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
          >
            <MenuItem value="all">Sve</MenuItem>
            <MenuItem value="verified">Verifikovane</MenuItem>
            <MenuItem value="unverified">Neverifikovane</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">Nema porudžbina</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>ID</TableCell>
                <TableCell>Kupac</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Lokacija</TableCell>
                <TableCell>Napomena</TableCell>
                <TableCell>Artikli</TableCell>
                <TableCell>Ukupno</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verifikovano</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.orderId} 
                  hover 
                  onClick={() => onOpenOrder(order)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {order.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<PhoneIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhoneClick(order.orderId, order.phone);
                      }}
                      color={order.verified ? 'success' : 'primary'}
                    >
                      {order.phone}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {order.location ? (
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.location}
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {order.info ? (
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.info}
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{order.total} RSD</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabels[order.status]} 
                      size="small" 
                      color={statusColors[order.status]} 
                    />
                  </TableCell>
                  <TableCell>
                    {order.verified ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrdersTab;
