// ─── Dashboard types ──────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  sub: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending';
}

export interface LowStockItem {
  name: string;
  category: string;
  stock: number;
}

export interface QuickLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

// ─── Product types ────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  tag: string | null;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  tag: string;
}
