import Link from 'next/link'
import {
  Package, ShoppingCart, TrendingUp, Users,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
} from 'lucide-react'

// ─── Mock data (replace with API calls) ───────────────────────────────────────
const stats = [
  {
    label: 'Total Revenue',
    value: '$48,320',
    change: '+12.5%',
    up: true,
    sub: 'vs last month',
  },
  {
    label: 'Orders',
    value: '1,284',
    change: '+8.2%',
    up: true,
    sub: 'vs last month',
  },
  {
    label: 'Products',
    value: '56',
    change: '+3',
    up: true,
    sub: 'new this week',
  },
  {
    label: 'Customers',
    value: '3,912',
    change: '-1.4%',
    up: false,
    sub: 'vs last month',
  },
]

const recentOrders = [
  { id: '#5821', customer: 'Sophie Martin',   product: 'Silk Slip Dress',  amount: '$248', status: 'Delivered' },
  { id: '#5820', customer: 'James Chen',       product: 'Tailored Coat',    amount: '$485', status: 'Processing' },
  { id: '#5819', customer: 'Amara Osei',       product: 'Cashmere Knit',    amount: '$320', status: 'Shipped' },
  { id: '#5818', customer: 'Lucas Pham',       product: 'Linen Trousers',   amount: '$165', status: 'Pending' },
  { id: '#5817', customer: 'Elena Vasquez',    product: 'Oversized Blazer', amount: '$195', status: 'Delivered' },
]

const lowStockItems = [
  { name: 'Linen Trousers',  category: 'Men',   stock: 0  },
  { name: 'Tailored Coat',   category: 'Men',   stock: 7  },
  { name: 'Oversized Blazer',category: 'Women', stock: 12 },
]

const statusStyles: Record<string, string> = {
  Delivered:  'bg-emerald-50 text-emerald-600',
  Shipped:    'bg-blue-50 text-blue-600',
  Processing: 'bg-amber-50 text-amber-600',
  Pending:    'bg-stone-100 text-stone-500',
}

const quickLinks = [
  { label: 'Add Product',  href: '/admin/products', icon: Package },
  { label: 'View Orders',  href: '/admin/orders',   icon: ShoppingCart },
  { label: 'Customers',    href: '/admin/customers', icon: Users },
  { label: 'Analytics',   href: '/admin/analytics', icon: TrendingUp },
]

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-stone-50 p-6 md:p-10">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-1">
          Overview
        </p>
        <h1
          className="text-3xl font-normal text-stone-900"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Dashboard
        </h1>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-100 p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">
              {s.label}
            </p>
            <p className="text-2xl font-light text-stone-900 mb-2">{s.value}</p>
            <div className={`flex items-center gap-1 text-[11px] ${s.up ? 'text-emerald-500' : 'text-rose-400'}`}>
              {s.up
                ? <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                : <ArrowDownRight className="w-3 h-3" strokeWidth={2} />
              }
              <span>{s.change}</span>
              <span className="text-stone-400 ml-1">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Recent Orders — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Latest</p>
              <h2
                className="text-lg font-normal text-stone-900"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Recent Orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-black border-b border-stone-200 hover:border-black pb-0.5 transition-all duration-200"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-stone-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-stone-800 truncate">{order.customer}</p>
                    <p className="text-[11px] text-stone-400 truncate">{order.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span
                    className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusStyles[order.status] ?? 'bg-stone-100 text-stone-500'}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm text-stone-700 font-light w-16 text-right">{order.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Low stock alert */}
          <div className="bg-white border border-stone-100">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-50">
              <AlertTriangle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Attention</p>
                <h2
                  className="text-base font-normal text-stone-900"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Low Stock
                </h2>
              </div>
            </div>
            <div className="divide-y divide-stone-50">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm text-stone-800">{item.name}</p>
                    <p className="text-[10px] tracking-wide text-stone-400">{item.category}</p>
                  </div>
                  <span
                    className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${item.stock === 0 ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}
                  >
                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-stone-50">
              <Link
                href="/admin/products"
                className="text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-black transition-colors"
              >
                Manage inventory →
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white border border-stone-100 p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-4">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200 group"
                >
                  <link.icon className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-colors" strokeWidth={1.5} />
                  <span className="text-[10px] tracking-[0.15em] uppercase text-stone-400 group-hover:text-stone-700 transition-colors text-center">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
