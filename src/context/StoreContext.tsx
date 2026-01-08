import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Category, Product, CartItem, Order, CustomerInfo, OrderStatus, DeliverySettings, CustomerLocation } from '../types';
import { categoryApi, articleApi, orderApi, type OrderDto } from '../services/api';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// Store location (HARI-M prodavnica)
const STORE_LOCATION = { lat: 43.276415, lng: 20.011664 };

const defaultDeliverySettings: DeliverySettings = {
  pricePerKm: 50,
  minDeliveryFee: 100,
  maxDeliveryFee: 500,
  freeDeliveryThreshold: 2000,
};
interface CartNotification {
  productName: string;
  quantity: number;
}
interface StoreContextType {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  deliverySettings: DeliverySettings;
  loadingCategories: boolean;
  loadingProducts: boolean;
  loadingOrders: boolean;
  cartNotification: CartNotification | null;
  clearCartNotification: () => void;
  addCategory: (category: Omit<Category, 'categoryId'>) => Promise<void>;
  updateCategory: (categoryId: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
  addProduct: (product: Omit<Product, 'articleId'>) => Promise<void>;
  updateProduct: (articleId: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (articleId: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (articleId: number, quantity: number) => void;
  removeFromCart: (articleId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  calculateDeliveryFee: (location: CustomerLocation) => number;
  placeOrder: (customer: CustomerInfo, deliveryFee: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
  updateDeliverySettings: (settings: DeliverySettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'harim_cart',
  DELIVERY_SETTINGS: 'harim_delivery_settings',
};

// Convert API OrderDto to local Order type
const mapOrderDtoToOrder = (dto: OrderDto): Order => {
  const items: CartItem[] = dto.articleOrders.map(ao => ({
    product: {
      articleId: ao.article.articleId,
      name: ao.article.name,
      price: ao.article.price,
      categoryId: ao.article.categoryId,
      available: ao.article.status,
      addition: ao.article.addition,
      unit: ao.article.unit,
    },
    quantity: ao.quantity,
  }));

  const total = dto.articleOrders.reduce((sum, ao) => sum + ao.totalPrice, 0);

  return {
    orderId: dto.orderId,
    customerName: dto.customerName,
    phone: dto.phone,
    location: dto.location,
    status: dto.status as OrderStatus,
    verified: dto.verified,
    lat: dto.lat,
    lng: dto.lng,
    createdAt: new Date(dto.createdAt),
    items,
    total,
    deliveryFee: 0,
  };
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cartNotification, setCartNotification] = useState<CartNotification | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
  });

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DELIVERY_SETTINGS);
    return stored ? JSON.parse(stored) : defaultDeliverySettings;
  });
const clearCartNotification = () => setCartNotification(null);
  // 🔹 Fetch categories
  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // 🔹 Fetch products
  const refreshProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await articleApi.getAll();
      setProducts(data.map(a => ({
        articleId: a.articleId,
        name: a.name,
        price: a.price,
        categoryId: a.categoryId,
        available: a.status,
        addition: a.addition,
        unit: a.unit,
      })));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 🔹 Fetch orders
  const refreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await orderApi.getAll();
      setOrders(data.map(mapOrderDtoToOrder));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 🔹 Initial fetch
  useEffect(() => {
    refreshCategories();
    refreshProducts();
    refreshOrders();
  }, []);

  // 🔹 Persist cart & delivery settings
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DELIVERY_SETTINGS, JSON.stringify(deliverySettings)); }, [deliverySettings]);

  // 🔹 SignalR connection for real-time orders
useEffect(() => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL.replace('/api','')}/orderHub`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  connection.on("NewOrderCreated", (newOrderDto) => {
    console.log("📦 New order received!", newOrderDto);
    setOrders(prev => [mapOrderDtoToOrder(newOrderDto), ...prev])
    ;
  });

  connection.start()
    .then(() => console.log("📡 SignalR povezan!"))
    .catch(err => console.error("SignalR greška:", err));

connection.onreconnecting(err => {
  console.warn("⚠️ SignalR reconnecting zbog:", err);
});

connection.onreconnected(connectionId => {
  console.log("✅ SignalR ponovo povezan, connectionId:", connectionId);
});


  connection.onclose(err => {
    console.error("SignalR zatvoren:", err);
  });

  return () => {
    connection.stop();
  };
}, []);


  // 🔹 Utility functions
  const calculateDistance = (lat: number, lng: number): number => {
    const R = 6371;
    const dLat = (lat - STORE_LOCATION.lat) * Math.PI / 180;
    const dLon = (lng - STORE_LOCATION.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(STORE_LOCATION.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateDeliveryFee = (location: CustomerLocation): number => {
    const cartTotal = getCartTotal();
    if (deliverySettings.freeDeliveryThreshold > 0 && cartTotal >= deliverySettings.freeDeliveryThreshold) return 0;
    const distance = calculateDistance(location.lat, location.lng);
    const fee = Math.round(distance * deliverySettings.pricePerKm);
    return Math.min(Math.max(fee, deliverySettings.minDeliveryFee), deliverySettings.maxDeliveryFee);
  };

  // 🔹 Category functions
  const addCategory = async (category: Omit<Category, 'categoryId'>) => {
    try { await categoryApi.create({ name: category.name, emoji: category.emoji || '' }); await refreshCategories(); } 
    catch (error) { console.error('Failed to create category:', error); }
  };
  const updateCategory = async (categoryId: number, updates: Partial<Category>) => {
    try {
      const existing = categories.find(c => c.categoryId === categoryId);
      if (!existing) return;
      await categoryApi.update(categoryId, { name: updates.name ?? existing.name, emoji: updates.emoji ?? existing.emoji ?? '' });
      await refreshCategories();
    } catch (error) { console.error('Failed to update category:', error); }
  };
  const deleteCategory = async (categoryId: number) => {
    try { await categoryApi.delete(categoryId); await refreshCategories(); await refreshProducts(); } 
    catch (error) { console.error('Failed to delete category:', error); }
  };

  // 🔹 Product functions
  const addProduct = async (product: Omit<Product, 'articleId'>) => {
    try {
      await articleApi.create({
        name: product.name,
        addition: product.addition || '',
        categoryId: product.categoryId,
        price: product.price,
        unit: product.unit || 'kom',
        status: product.available,
      });
      await refreshProducts();
    } catch (error) { console.error('Failed to create product:', error); }
  };
  const updateProduct = async (articleId: number, updates: Partial<Product>) => {
    try {
      const existing = products.find(p => p.articleId === articleId);
      if (!existing) return;
      await articleApi.update(articleId, {
        name: updates.name ?? existing.name,
        addition: updates.addition ?? existing.addition ?? '',
        categoryId: updates.categoryId ?? existing.categoryId,
        price: updates.price ?? existing.price,
        unit: updates.unit ?? existing.unit ?? 'kom',
        status: updates.available ?? existing.available,
      });
      await refreshProducts();
    } catch (error) { console.error('Failed to update product:', error); }
  };
  const deleteProduct = async (articleId: number) => {
    try { await articleApi.delete(articleId); await refreshProducts(); removeFromCart(articleId); } 
    catch (error) { console.error('Failed to delete product:', error); }
  };

  // 🔹 Cart functions
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.articleId === product.articleId);
      if (existing) return prev.map(i => i.product.articleId === product.articleId ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
      setCartNotification({ productName: product.name, quantity });

  };
  const updateCartQuantity = (articleId: number, quantity: number) => { if (quantity <= 0) return removeFromCart(articleId); setCart(cart.map(i => i.product.articleId === articleId ? { ...i, quantity } : i)); };
  const removeFromCart = (articleId: number) => setCart(cart.filter(i => i.product.articleId !== articleId));
  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getCartItemsCount = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  // 🔹 Orders functions
  const placeOrder = async (customer: CustomerInfo, deliveryFee: number) => {
    try {
      console.log(deliveryFee)
      await orderApi.create({
        customerName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        location: customer.location?.address || '',
        status: 'pending',
        verified: false,
        lat: customer.location?.lat || 0,
        lng: customer.location?.lng || 0,
        articles: cart.map(i => ({ articleId: i.product.articleId, quantity: i.quantity })),
      });
      clearCart();
      await refreshOrders();
    } catch (error) { console.error('Failed to place order:', error); }
  };
  const deleteOrder = async (orderId: number) => { try { await orderApi.delete(orderId); await refreshOrders(); } catch (error) { console.error('Failed to delete order:', error); } };

  const updateDeliverySettings = (settings: DeliverySettings) => setDeliverySettings(settings);

  return (
    <StoreContext.Provider value={{
      categories, products, cart, orders, deliverySettings,
      loadingCategories, loadingProducts, loadingOrders,
      cartNotification,
      clearCartNotification,
      addCategory, updateCategory, deleteCategory, refreshCategories,
      addProduct, updateProduct, deleteProduct, refreshProducts,
      addToCart, updateCartQuantity, removeFromCart, clearCart,
      getCartTotal, getCartItemsCount, calculateDeliveryFee,
      placeOrder, refreshOrders, deleteOrder, updateDeliverySettings,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
