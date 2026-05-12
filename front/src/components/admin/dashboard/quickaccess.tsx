import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface LinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function QuickAccess({ links }: { links: LinkItem[] }) {
  return (
    <div className="bg-white border border-stone-100 p-5">
      <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-4">Quick Access</p>
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
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
  )
}