import { 
  statsData, 
  recentOrdersData, 
  lowStockItemsData, 
  quickLinksData 
} from '@/data/dashboard'

import { StatCards } from '@/components/admin/dashboard/statcards'
import { RecentOrders } from '@/components/admin/dashboard/recentorders'
import { LowStockAlert } from '@/components/admin/dashboard/lowstockalert'
import { QuickAccess } from '@/components/admin/dashboard/quickaccess'

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
      <StatCards stats={statsData} />

      {/* ── Main grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Recent Orders — 2/3 width */}
        <RecentOrders orders={recentOrdersData} />

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <LowStockAlert items={lowStockItemsData} />
          <QuickAccess links={quickLinksData} />
        </div>
        
      </div>
    </div>
  )
}