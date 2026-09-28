import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarNav } from './sidebar-nav'
import { LogOut } from 'lucide-react'

import { db } from '@/lib/db'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      <SidebarNav role={user?.role} />

      {/* Main content */}
      <main className="flex-1 flex flex-col relative w-full md:w-[calc(100%-18rem)]">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>

        {/* Footer actions like Logout (shown at bottom of main content) */}
        <div className="p-4 md:p-6 border-t border-[#E2E8F0] mt-auto bg-white flex justify-end shrink-0">
          <form
            action={async () => {
              'use server'
              const { signOut } = await import('@/auth')
              await signOut({ redirectTo: '/' })
            }}
          >
            <Button type="submit" variant="outline" className="w-full md:w-auto border-[#FCA5A5] text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#991B1B] font-semibold h-11 px-6 rounded-[8px] flex items-center justify-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" /> Keluar Akun
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
