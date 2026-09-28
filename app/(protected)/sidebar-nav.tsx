'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Menu, Home, UserCircle, CalendarClock, Search, LogOut, ChevronLeft, ChevronRight, BriefcaseBusiness } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { logoutUser } from '@/app/actions/auth'
import { ProfileMenu } from './profile-menu'

type ProfileSummary = {
  name: string
  email: string
  image?: string | null
  accountType: string
  roleLabel: string
}

type NavItem = {
  name: string
  href: string
  icon: typeof Home
  hideForProvider?: boolean
  providerOnly?: boolean
}

function NavLinks({ items, pathname, collapsed = false }: { items: NavItem[]; pathname: string; collapsed?: boolean }) {
  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.name : undefined}
            className={`flex items-center gap-3 h-12 rounded-[8px] font-semibold transition-all duration-200 ${collapsed ? 'justify-center px-0' : 'px-4'} ${
              isActive
                ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-sm'
                : 'text-[#334155] hover:text-[#FF6B00] hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FF6B00]' : 'text-[#64748B]'}`} />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </Link>
        )
      })}
    </>
  )
}

function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <form action={logoutUser} className="w-full">
      <Button
        type="submit"
        variant="outline"
        title={collapsed ? 'Keluar Akun' : undefined}
        className={`w-full border-[#FCA5A5] text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#991B1B] font-semibold h-12 rounded-[8px] flex items-center transition-colors ${collapsed ? 'justify-center px-0' : 'px-4 justify-start gap-3'}`}
      >
        <LogOut className="w-5 h-5 shrink-0" />
        {!collapsed && <span>Keluar Akun</span>}
      </Button>
    </form>
  )
}

export function SidebarNav({ role, profile }: { role?: string; profile: ProfileSummary }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems: NavItem[] = [
    { name: 'Beranda', href: '/dashboard', icon: Home },
    { name: 'Cari Tukang', href: '/services', icon: Search, hideForProvider: true },
    { name: 'Pesanan', href: '/dashboard/bookings', icon: CalendarClock },
    { name: 'Jasa & Portfolio', href: '/dashboard/services', icon: BriefcaseBusiness, providerOnly: true },
    { name: 'Profil Saya', href: '/dashboard/profile', icon: UserCircle },
  ].filter((item) => {
    if (item.hideForProvider && role === 'PROVIDER') return false
    if (item.providerOnly && role !== 'PROVIDER') return false
    return true
  })

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white border-r border-[#E2E8F0] hidden md:flex flex-col z-20 shadow-[1px_0_4px_rgba(15,23,42,0.02)] transition-all duration-300 ease-in-out sticky top-0 h-screen shrink-0 ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <div className={`h-[72px] border-b border-[#E2E8F0] flex items-center shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-6 justify-between'}`}>
          {!isCollapsed && (
            <Link href="/dashboard" className="text-2xl font-extrabold text-[#0F172A] tracking-tight truncate">
              Tukang<span className="text-[#FF6B00]">Pro</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="text-xl font-extrabold text-[#FF6B00] tracking-tight">
              T<span className="text-[#0F172A]">P</span>
            </Link>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
            title="Tutup Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        {/* If collapsed, show the toggle button just below the header */}
        {isCollapsed && (
          <div className="flex justify-center pt-4">
             <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 border border-transparent hover:border-[#FF6B00]/20 transition-all"
              title="Buka Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav className={`flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-3 mt-2' : 'p-4'}`}>
          <NavLinks items={navItems} pathname={pathname} collapsed={isCollapsed} />
        </nav>

        <div className={`border-t border-[#E2E8F0] bg-slate-50/50 shrink-0 ${isCollapsed ? 'p-3' : 'p-4'}`}>
          <LogoutButton collapsed={isCollapsed} />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 flex justify-between items-center h-[64px] shadow-sm shrink-0 w-full">
        <Link href="/dashboard" className="font-extrabold text-[#0F172A] tracking-tight text-xl">
          Tukang<span className="text-[#FF6B00]">Pro</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <ProfileMenu {...profile} compact />
          <Sheet>
            <SheetTrigger className="w-12 h-12 border border-[#E2E8F0] rounded-[8px] flex items-center justify-center bg-white hover:bg-slate-50 transition-colors">
              <Menu className="h-5 w-5 text-[#0F172A]" />
              <span className="sr-only">Buka menu utama</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-[#E2E8F0] bg-white flex flex-col">
              <SheetHeader className="p-6 border-b border-[#E2E8F0] text-left shrink-0">
                <SheetTitle className="font-extrabold text-[#0F172A] tracking-tight text-xl">Menu Utama</SheetTitle>
              </SheetHeader>
              <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
                <NavLinks items={navItems} pathname={pathname} />
              </nav>
              <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50 shrink-0">
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
