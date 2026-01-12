import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useStore } from '../context/StoreContext';
import type { Category, Product, Order, OrderStatus } from '../types';
import { useNotificationSound } from '../hooks/useNotificationSound';

// Admin components
import AdminHeader from '../components/admin/AdminHeader';
import DashboardTab from '../components/admin/DashboardTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';
import DeliverySettingsTab from '../components/admin/DeliverySettingsTab';
import CategoryDialog from '../components/admin/CategoryDialog';
import ProductDialog, { type ProductFormData } from '../components/admin/ProductDialog';
import OrderDetailsDialog from '../components/admin/OrderDetailsDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

const AdminPanel: React.FC = () => {
  const {
    categories,
    products,
    orders,
    deliverySettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    updateDeliverySettings,
    updateOrderStatus
  } = useStore();

  const [tabValue, setTabValue] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Sound notifications for new orders
  const { isAlerting, stopAlert } = useNotificationSound(orders.length, notificationsEnabled);
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Product dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Order dialog state
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Delivery settings dialog
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
console.log(deliveryDialogOpen);

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    setEditingCategory(category || null);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = (data: { name: string; emoji: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.categoryId, data);
    } else {
      addCategory(data);
    }
  };

  // Product handlers
  const handleOpenProductDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct(editingProduct.articleId, {
        name: data.name,
        price: data.price,
        salePrice: data.salePrice,
        categoryId: data.categoryId,
        available: data.available,
        addition: data.addition,
        unit: data.unit,
        picture: data.picture,
      });
    } else {
      addProduct({
        name: data.name,
        price: data.price,
        salePrice: data.salePrice,
        categoryId: data.categoryId,
        available: data.available,
        addition: data.addition,
        unit: data.unit,
        picture: data.picture,
      });
    }
  };

  // Order handlers
  const handleOpenOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handlePhoneClick = (orderId: number, phone: string) => {
    console.log(orderId);
    
    window.location.href = `tel:${phone}`;
  };

 const handleStatusChange = async (
  orderId: number,
  status: OrderStatus
) => {
  // 1. pozovi backend + store
  await updateOrderStatus(orderId, status);

  // 2. osveži otvoreni dialog (UI)
  setSelectedOrder(prev =>
    prev?.orderId === orderId
      ? { ...prev, status }
      : prev
  );
};


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AdminHeader
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
        onOpenDeliverySettings={() => setDeliveryDialogOpen(true)}
        isAlerting={isAlerting}
        onStopAlert={stopAlert}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
            <Tab label="Kategorije" />
            <Tab label="Artikli" />
            <Tab label={`Porudžbine (${orders.length})`} />
            <Tab label="Dostava" icon={<LocalShippingIcon />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <DashboardTab
              orders={orders}
              products={products}
              categories={categories}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CategoriesTab
              categories={categories}
              products={products}
              onAddCategory={() => handleOpenCategoryDialog()}
              onEditCategory={handleOpenCategoryDialog}
              onDeleteCategory={deleteCategory}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ProductsTab
              products={products}
              categories={categories}
              onAddProduct={() => handleOpenProductDialog()}
              onEditProduct={handleOpenProductDialog}
              onDeleteProduct={deleteProduct}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <OrdersTab
              orders={orders}
              onOpenOrder={handleOpenOrderDialog}
              onPhoneClick={handlePhoneClick}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <DeliverySettingsTab
              deliverySettings={deliverySettings}
              onSave={updateDeliverySettings}
            />
          </TabPanel>
        </Paper>
      </Container>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        category={editingCategory}
        onClose={() => setCategoryDialogOpen(false)}
        onSave={handleSaveCategory}
      />

      <ProductDialog
        open={productDialogOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setProductDialogOpen(false)}
        onSave={handleSaveProduct}
      />

      <OrderDetailsDialog
        open={orderDialogOpen}
        order={selectedOrder}
        onClose={() => setOrderDialogOpen(false)}
        onPhoneClick={handlePhoneClick}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default AdminPanel;
