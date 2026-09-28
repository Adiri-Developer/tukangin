import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      providerProfile: true,
      customerProfile: true,
    }
  })

  if (!user) return null

  const isProvider = user.role === 'PROVIDER'

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Halo, {user.name}!</h1>
      <p className="text-slate-600">Selamat datang di dashboard Tukangin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 rounded-[16px] shadow-sm">
          <CardHeader>
            <CardTitle>Status Profil</CardTitle>
            <CardDescription>
              Peran Anda: <span className="font-semibold text-slate-900">{isProvider ? 'Mitra Tukang' : 'Customer'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProvider && (
              <div className="mb-4 p-4 rounded-lg bg-[#EFF4FF] border border-[#CBD5E1]">
                <p className="text-sm text-slate-700">
                  Status Verifikasi:{' '}
                  {user.providerProfile?.isVerified ? (
                    <span className="font-bold text-[#10B981]">Terverifikasi</span>
                  ) : (
                    <span className="font-bold text-[#FF6B00]">Belum Diverifikasi</span>
                  )}
                </p>
                {!user.providerProfile?.isVerified && (
                  <p className="text-xs text-slate-500 mt-1">
                    Anda perlu melakukan verifikasi profil agar bisa menerima pesanan.
                  </p>
                )}
              </div>
            )}
            <Link href="/dashboard/profile">
              <Button className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white">Lengkapi Profil</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-[16px] shadow-sm">
          <CardHeader>
            <CardTitle>Pesanan Aktif</CardTitle>
            <CardDescription>
              Pesanan yang sedang berjalan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Belum ada pesanan aktif saat ini.</p>
            {!isProvider && (
              <Link href="/services" className={buttonVariants({ className: 'w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white' })}>
                Cari Tukang
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
