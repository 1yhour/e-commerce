import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Stat {
  label: string;
  value: string;
  change: string;
  up: boolean;
  sub: string;
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-stone-100 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">
            {s.label}
          </p>
          <p className="text-2xl font-light text-stone-900 mb-2">{s.value}</p>
          <div className={`flex items-center gap-1 text-[11px] ${s.up ? 'text-emerald-500' : 'text-rose-400'}`}>
            {s.up ? (
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            ) : (
              <ArrowDownRight className="w-3 h-3" strokeWidth={2} />
            )}
            <span>{s.change}</span>
            <span className="text-stone-400 ml-1">{s.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}