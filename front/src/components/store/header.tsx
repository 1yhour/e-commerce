'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'New Arrival', href: '/newarrival' },
  { name: 'Women',       href: '/women' },
  { name: 'Men',         href: '/men' },
  { name: 'Kids',        href: '/kids' },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, cartItemCount } = useAuth()

  // Scroll detection: header becomes solid after scrolling past the hero
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // Only go transparent on the homepage (store root)
  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          transparent
            ? 'bg-transparent border-b border-white/10'
            : 'bg-white border-b border-black/8 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Left: Desktop Nav ──────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              {navigation.slice(0, 1).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-[10px] font-normal tracking-[0.2em] uppercase transition-colors duration-300',
                    transparent
                      ? 'text-white/80 hover:text-white'
                      : 'text-stone-500 hover:text-black',
                    pathname === item.href && (transparent ? 'text-white' : 'text-black')
                  )}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.2em' }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* ── Center: Brand Wordmark ──────────────────────────────── */}
            <Link
              href="/"
              className={cn(
                'absolute left-1/2 -translate-x-1/2 transition-colors duration-300',
                transparent ? 'text-white' : 'text-black'
              )}
            >
              <span
                className="text-2xl md:text-3xl font-normal tracking-[0.35em] uppercase"
                style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.35em' }}
              >
                LUXE
              </span>
            </Link>

            {/* ── Right: Desktop Nav (remaining) + Icons ──────────────── */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
              {navigation.slice(1).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-[10px] font-normal tracking-[0.2em] uppercase transition-colors duration-300',
                    transparent
                      ? 'text-white/80 hover:text-white'
                      : 'text-stone-500 hover:text-black',
                    pathname === item.href && (transparent ? 'text-white' : 'text-black')
                  )}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.2em' }}
                >
                  {item.name}
                </Link>
              ))}

              {/* Divider */}
              <div className={cn('w-px h-4 mx-1', transparent ? 'bg-white/20' : 'bg-stone-200')} />

              {/* Cart */}
              <Link href="/cart" className="relative">
                <button
                  className={cn(
                    'p-1 transition-colors duration-300',
                    transparent ? 'text-white/80 hover:text-white' : 'text-stone-500 hover:text-black'
                  )}
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black text-white text-[9px] font-medium"
                      style={{ fontFamily: 'var(--font-sans)' }}>
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'p-1 transition-colors duration-300',
                        transparent ? 'text-white/80 hover:text-white' : 'text-stone-500 hover:text-black'
                      )}
                      aria-label="Account"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.first_name} className="w-[18px] h-[18px] rounded-full object-cover" />
                      ) : (
                        <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-none border-stone-200 shadow-lg mt-2">
                    <div className="px-3 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-medium text-black tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer text-xs tracking-wide text-stone-600 hover:text-black">
                        <Package className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    {user?.role?.name === 'Admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-xs tracking-wide text-stone-600 hover:text-black">
                          <LayoutDashboard className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-stone-100" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-xs tracking-wide text-rose-500 hover:text-rose-700">
                      <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    'text-[10px] tracking-[0.2em] uppercase transition-colors duration-300',
                    transparent ? 'text-white/80 hover:text-white' : 'text-stone-500 hover:text-black'
                  )}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.2em' }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* ── Mobile: Logo + Icons ─────────────────────────────────── */}
            <div className="flex md:hidden items-center gap-4 ml-auto">
              <Link href="/cart" className="relative p-1">
                <ShoppingCart className={cn('w-5 h-5', transparent ? 'text-white' : 'text-black')} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black text-white text-[9px]">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className={cn('p-1', transparent ? 'text-white' : 'text-black')} aria-label="Menu">
                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-0 border-l border-stone-200">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Sheet brand */}
                    <div className="px-8 py-7 border-b border-stone-100">
                      <span className="text-xl tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-serif)' }}>
                        LUXE
                      </span>
                    </div>
                    <nav className="flex flex-col px-8 py-8 gap-6">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'text-[11px] tracking-[0.2em] uppercase transition-colors',
                            pathname === item.href ? 'text-black' : 'text-stone-400 hover:text-black'
                          )}
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto px-8 py-8 border-t border-stone-100 flex flex-col gap-4">
                      {isAuthenticated ? (
                        <>
                          <p className="text-[11px] tracking-widest uppercase text-stone-400" style={{ fontFamily: 'var(--font-sans)' }}>
                            {user?.first_name} {user?.last_name}
                          </p>
                          <Link href="/orders" className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-stone-500 hover:text-black">
                            <Package className="h-4 w-4" strokeWidth={1.5} /> My Orders
                          </Link>
                          {user?.role?.name === 'Admin' && (
                            <Link href="/admin" className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-stone-500 hover:text-black">
                              <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} /> Dashboard
                            </Link>
                          )}
                          <button onClick={logout} className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-rose-400 hover:text-rose-600 text-left">
                            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <Link href="/login" className="text-[11px] tracking-[0.2em] uppercase text-stone-500 hover:text-black" style={{ fontFamily: 'var(--font-sans)' }}>
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </header>

      
    </>
  )
}
