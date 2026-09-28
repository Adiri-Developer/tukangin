import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarNav } from './sidebar-nav'

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
      <main className="flex-1 flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        {/* Footer actions like Logout (shown at bottom of main content or sidebar bottom) */}
        <div className="p-6 md:p-8 border-t border-[#E2E8F0] mt-auto">
          <form
            action={async () => {
              'use server'
              const { signOut } = await import('@/auth')
              await signOut({ redirectTo: '/' })
            }}
          >
            <Button type="submit" variant="outline" className="w-full md:w-auto md:ml-auto border-[#FCA5A5] text-[#B91C1C] hover:bg-[#FEF2F2]">
              Keluar Akun
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
