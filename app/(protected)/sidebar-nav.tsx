'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Menu, Home, UserCircle, CalendarClock, Search, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { buttonVariants } from '@/components/ui/button'

export function SidebarNav({ role }: { role?: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Beranda', href: '/dashboard', icon: Home },
    { name: 'Profil Saya', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Pesanan', href: '/dashboard/bookings', icon: CalendarClock },
  ]

  if (role !== 'PROVIDER') {
    navItems.push({ name: 'Cari Tukang', href: '/services', icon: Search })
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center gap-3 px-4 h-12 rounded-[8px] font-semibold transition-all duration-200 ${
              isActive 
                ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-sm' 
                : 'text-[#334155] hover:text-[#FF6B00] hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF6B00]' : 'text-[#64748B]'}`} />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-[#E2E8F0] hidden md:flex flex-col z-10 shadow-[1px_0_4px_rgba(15,23,42,0.02)]">
        <div className="h-[72px] px-6 border-b border-[#E2E8F0] flex items-center">
          <Link href="/dashboard" className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Tukang<span className="text-[#FF6B00]">In</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1.5">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 flex justify-between items-center h-[64px] shadow-sm">
        <Link href="/dashboard" className="font-extrabold text-[#0F172A] tracking-tight text-xl">
          Tukang<span className="text-[#FF6B00]">In</span>
        </Link>
        
        <Sheet>
          <SheetTrigger className="w-10 h-10 border border-[#E2E8F0] rounded-[8px] flex items-center justify-center bg-white hover:bg-slate-50 transition-colors">
            <Menu className="h-5 w-5 text-[#0F172A]" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 border-r border-[#E2E8F0] bg-white">
            <SheetHeader className="p-6 border-b border-[#E2E8F0] text-left">
              <SheetTitle className="font-extrabold text-[#0F172A] tracking-tight text-xl">Menu Utama</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-4 flex flex-col gap-1.5">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
