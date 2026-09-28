import { auth } from '@/auth'
import { redirect } from 'next/navigation'
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
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden min-w-0 transition-all duration-300">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
