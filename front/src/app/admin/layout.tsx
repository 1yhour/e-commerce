'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

function SidebarContent({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">LX</span>
          </div>
          <span className="text-lg font-semibold">Admin</span>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          )
        })}
      </nav>


      {/* Footer */}
      <div className="mt-auto p-4 space-y-2 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
        >
          <Store className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  // Effect to handle redirection if not authorized
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role?.name !== 'Admin')) {
      router.push('/login')
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role?.name !== 'Admin') {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SidebarContent pathname={pathname} onLogout={handleLogout} />
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">LX</span>
          </div>
          <span className="font-semibold">Admin</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}