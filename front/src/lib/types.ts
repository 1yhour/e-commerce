export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Address {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: Role;
  avatar?: string;
  addresses?: Address[];
  createdAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: Address;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}
