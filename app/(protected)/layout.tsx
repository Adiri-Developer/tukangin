import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SidebarNav } from './sidebar-nav'
import { ProfileMenu } from './profile-menu'
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
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      providerProfile: {
        select: {
          services: {
            orderBy: { serviceCategory: { name: 'asc' } },
            take: 2,
            select: { serviceCategory: { select: { name: true } } },
          },
        },
      },
    },
  })

  if (!user?.email) {
    redirect('/login')
  }

  const accountType = user.role === 'PROVIDER'
    ? 'Mitra Tukang'
    : user.role === 'ADMIN'
      ? 'Admin'
      : 'Customer'
  const providerServices = user.providerProfile?.services.map((service) => service.serviceCategory.name) ?? []
  const roleLabel = user.role === 'PROVIDER' && providerServices.length > 0
    ? providerServices.join(' & ')
    : accountType
  const profile = {
    name: user.name?.trim() || user.email.split('@')[0],
    email: user.email,
    image: user.image,
    accountType,
    roleLabel,
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SidebarNav role={user.role} profile={profile} />

      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-40 hidden h-[72px] shrink-0 items-center border-b border-[#E2E8F0] bg-white/95 px-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] lg:px-8 md:flex">
          <div className="mx-auto flex w-full max-w-[1200px] justify-end">
            <ProfileMenu {...profile} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
