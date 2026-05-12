import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'

export const statsData = [
  { label: 'Total Revenue', value: '$48,320', change: '+12.5%', up: true, sub: 'vs last month' },
  { label: 'Orders', value: '1,284', change: '+8.2%', up: true, sub: 'vs last month' },
  { label: 'Products', value: '56', change: '+3', up: true, sub: 'new this week' },
  { label: 'Customers', value: '3,912', change: '-1.4%', up: false, sub: 'vs last month' },
]

export const recentOrdersData = [
  { id: '#5821', customer: 'Sophie Martin', product: 'Silk Slip Dress', amount: '$248', status: 'Delivered' },
  { id: '#5820', customer: 'James Chen', product: 'Tailored Coat', amount: '$485', status: 'Processing' },
  { id: '#5819', customer: 'Amara Osei', product: 'Cashmere Knit', amount: '$320', status: 'Shipped' },
  { id: '#5818', customer: 'Lucas Pham', product: 'Linen Trousers', amount: '$165', status: 'Pending' },
  { id: '#5817', customer: 'Elena Vasquez', product: 'Oversized Blazer', amount: '$195', status: 'Delivered' },
]

export const lowStockItemsData = [
  { name: 'Linen Trousers', category: 'Men', stock: 0 },
  { name: 'Tailored Coat', category: 'Men', stock: 7 },
  { name: 'Oversized Blazer', category: 'Women', stock: 12 },
]

export const statusStyles: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-600',
  Shipped: 'bg-blue-50 text-blue-600',
  Processing: 'bg-amber-50 text-amber-600',
  Pending: 'bg-stone-100 text-stone-500',
}

export const quickLinksData = [
  { label: 'Add Product', href: '/admin/products', icon: Package },
  { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
]