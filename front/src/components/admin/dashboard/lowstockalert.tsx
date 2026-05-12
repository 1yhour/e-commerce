import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface StockItem {
  name: string;
  category: string;
  stock: number;
}

export function LowStockAlert({ items }: { items: StockItem[] }) {
  return (
    <div className="bg-white border border-stone-100">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-50">
        <AlertTriangle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Attention</p>
          <h2 className="text-base font-normal text-stone-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Low Stock
          </h2>
        </div>
      </div>
      <div className="divide-y divide-stone-50">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm text-stone-800">{item.name}</p>
              <p className="text-[10px] tracking-wide text-stone-400">{item.category}</p>
            </div>
            <span className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${item.stock === 0 ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}>
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
  )
}