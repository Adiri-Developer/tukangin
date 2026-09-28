import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

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

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center bg-[#FEF2F2] border border-[#FCA5A5] rounded-[16px] shadow-sm">
        <div className="flex justify-center mb-4"><AlertCircle className="w-12 h-12 text-[#B91C1C]" /></div>
        <p className="text-[#B91C1C] text-lg font-bold mb-2">Sesi Tidak Valid / Akun Tidak Ditemukan</p>
        <p className="text-[#B91C1C]/80">Database baru saja di-reset. Akun lama Anda mungkin telah terhapus. Silakan klik tombol <b>Keluar Akun</b> di bagian bawah layar dan buat akun baru.</p>
      </div>
    )
  }

  const isProvider = user.role === 'PROVIDER'

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-1">Halo, {user.name}!</h1>
        <p className="text-[#334155] text-lg">Selamat datang di dashboard Tukangin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] bg-white transition-all hover:shadow-md hover:border-[#CBD5E1]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0F172A]">Status Profil</CardTitle>
            <CardDescription className="text-[#64748B]">
              Peran Anda: <span className="font-bold text-[#0F172A]">{isProvider ? 'Mitra Tukang' : 'Customer'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProvider && (
              <div className={`mb-6 p-4 rounded-xl border flex gap-3 items-start ${
                user.providerProfile?.isVerified 
                  ? 'bg-[#ECFDF5] border-[#6EE7B7]' 
                  : 'bg-[#FFF7ED] border-[#FDBA74]'
              }`}>
                {user.providerProfile?.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Status Verifikasi:{' '}
                    {user.providerProfile?.isVerified ? (
                      <span className="text-[#10B981]">Terverifikasi</span>
                    ) : (
                      <span className="text-[#FF6B00]">Belum Diverifikasi</span>
                    )}
                  </p>
                  {!user.providerProfile?.isVerified && (
                    <p className="text-xs text-[#64748B] mt-1">
                      Anda perlu melakukan verifikasi profil agar bisa menerima pesanan.
                    </p>
                  )}
                </div>
              </div>
            )}
            <Link href="/dashboard/profile" className={buttonVariants({ className: 'w-full bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[8px] font-semibold h-11 transition-transform active:scale-95' })}>
              Lengkapi Profil
            </Link>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] bg-white transition-all hover:shadow-md hover:border-[#CBD5E1]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0F172A]">Pesanan Aktif</CardTitle>
            <CardDescription className="text-[#64748B]">
              Pesanan yang sedang berjalan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-80px)] justify-between">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-3">
                <Clock className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <p className="text-sm text-[#64748B]">Belum ada pesanan aktif saat ini.</p>
            </div>
            {!isProvider && (
              <Link href="/services" className={buttonVariants({ className: 'w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-[8px] font-semibold h-11 transition-all active:scale-95 shadow-[0_4px_12px_rgba(255,107,0,0.35)]' })}>
                Cari Tukang Sekarang
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
