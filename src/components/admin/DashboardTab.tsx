import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Order, Product, Category } from '../../types';

interface DashboardTabProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}30`,
      height: '100%',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          bgcolor: `${color}20`,
          borderRadius: 2,
          p: 1,
          color,
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const DashboardTab: React.FC<DashboardTabProps> = ({ orders, products, categories }) => {
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const availableProducts = products.filter(p => p.available).length;
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Average order value
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
    
    // Top selling products
    const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const id = item.product.articleId;
        if (!productSales[id]) {
          productSales[id] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        productSales[id].quantity += item.quantity;
        productSales[id].revenue += item.product.price * item.quantity;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Orders by status for chart
    const ordersByStatus = {
      pending: pendingOrders,
      preparing: orders.filter(o => o.status === 'preparing').length,
      delivering: orders.filter(o => o.status === 'delivering').length,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    };
    
    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      availableProducts,
      todayOrders: todayOrders.length,
      todayRevenue,
      avgOrderValue,
      topProducts,
      ordersByStatus,
      categoriesCount: categories.length,
    };
  }, [orders, products, categories]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard - Pregled
      </Typography>

      {/* Main Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ukupan Prihod"
            value={`${stats.totalRevenue.toLocaleString()} RSD`}
            icon={<TrendingUpIcon />}
            color="#2E7D32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ukupno Porudžbina"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#1976D2"
            subtitle={`Prosek: ${stats.avgOrderValue.toLocaleString()} RSD`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Danas"
            value={`${stats.todayOrders} porudžbina`}
            icon={<LocalShippingIcon />}
            color="#ED6C02"
            subtitle={`${stats.todayRevenue.toLocaleString()} RSD`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Proizvodi"
            value={stats.availableProducts}
            icon={<InventoryIcon />}
            color="#9C27B0"
            subtitle={`od ${products.length} ukupno`}
          />
        </Grid>
      </Grid>

      {/* Order Status Cards */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Status Porudžbina
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#FFF3E0',
              border: '1px solid #FFB74D',
            }}
          >
            <PendingIcon sx={{ fontSize: 32, color: '#F57C00', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#F57C00">
              {stats.pendingOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Na čekanju
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#E3F2FD',
              border: '1px solid #64B5F6',
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 32, color: '#1976D2', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#1976D2">
              {stats.ordersByStatus.preparing + stats.ordersByStatus.delivering}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              U procesu
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#E8F5E9',
              border: '1px solid #81C784',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 32, color: '#2E7D32', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#2E7D32">
              {stats.deliveredOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Isporučeno
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#FFEBEE',
              border: '1px solid #E57373',
            }}
          >
            <CancelIcon sx={{ fontSize: 32, color: '#D32F2F', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#D32F2F">
              {stats.cancelledOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Otkazano
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products & Categories */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              🏆 Top 5 Proizvoda
            </Typography>
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <Box
                  key={product.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: index < stats.topProducts.length - 1 ? '1px solid' : 'none',
                    borderColor: 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography fontWeight={500}>{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.quantity} prodato
                      </Typography>
                    </Box>
                  </Box>
                  <Typography fontWeight={700} color="primary">
                    {product.revenue.toLocaleString()} RSD
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Nema podataka o prodaji
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              📦 Kategorije
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CategoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats.categoriesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktivnih kategorija
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              📊 Brzi Pregled
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Prosečna vrednost porudžbine:</Typography>
                <Typography fontWeight={600}>{stats.avgOrderValue.toLocaleString()} RSD</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Stopa otkazivanja:</Typography>
                <Typography fontWeight={600}>
                  {stats.totalOrders > 0 
                    ? `${((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}%`
                    : '0%'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Stopa isporuke:</Typography>
                <Typography fontWeight={600} color="success.main">
                  {stats.totalOrders > 0 
                    ? `${((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)}%`
                    : '0%'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;
