import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { statusStyles } from '@/data/dashboard'

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="lg:col-span-2 bg-white border border-stone-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Latest</p>
          <h2 className="text-lg font-normal text-stone-900" style={{ fontFamily: 'var(--font-serif)' }}>
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
        {orders.map((order) => (
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
              <span className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusStyles[order.status] ?? 'bg-stone-100 text-stone-500'}`}>
                {order.status}
              </span>
              <span className="text-sm text-stone-700 font-light w-16 text-right">{order.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}