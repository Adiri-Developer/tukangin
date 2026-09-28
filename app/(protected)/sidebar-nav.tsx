'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export function SidebarNav() {
  const NavLinks = () => (
    <>
      <Link href="/dashboard">
        <Button variant="ghost" className="w-full justify-start text-[#334155] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-12 rounded-[8px]">
          Beranda
        </Button>
      </Link>
      <Link href="/dashboard/profile">
        <Button variant="ghost" className="w-full justify-start text-[#334155] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-12 rounded-[8px]">
          Profil Saya
        </Button>
      </Link>
      <Link href="/dashboard/bookings">
        <Button variant="ghost" className="w-full justify-start text-[#334155] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-12 rounded-[8px]">
          Pesanan
        </Button>
      </Link>
      <Link href="/services">
        <Button variant="ghost" className="w-full justify-start text-[#334155] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-12 rounded-[8px]">
          Cari Tukang
        </Button>
      </Link>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#E2E8F0]">
          <Link href="/dashboard" className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Tukangin
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-[#E2E8F0] p-4 flex justify-between items-center h-[64px]">
        <Link href="/dashboard" className="font-extrabold text-[#0F172A] tracking-tight text-lg">Tukangin</Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-[#E2E8F0]">
              <Menu className="h-5 w-5 text-[#0F172A]" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r border-[#E2E8F0]">
            <SheetHeader className="p-6 border-b border-[#E2E8F0] text-left">
              <SheetTitle className="font-extrabold text-[#0F172A] tracking-tight">Menu Utama</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-4 flex flex-col gap-2">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
