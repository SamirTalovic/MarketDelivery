export interface Category {
  categoryId: number;
  name: string;
  emoji?: string;
}

export interface Product {
  articleId: number;
  name: string;
  price: number;
  categoryId: number;
  available: boolean;
  addition?: string;
  unit?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  location?: CustomerLocation;
  note?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  orderId: number;
  customerName: string;
  phone: string;
  location: string;
  status: OrderStatus;
  verified: boolean;
  lat: number;
  lng: number;
  createdAt: Date;
  items: CartItem[];
  total: number;
  deliveryFee: number;
}

export interface DeliverySettings {
  freeDeliveryThreshold: number;
  underThresholdFee: number;
  distanceThresholdKm: number;
  overDistanceFee: number;
  orderStartHour: number;
  orderEndHour: number;
}
