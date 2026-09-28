import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return null

  const isProvider = user.role === 'PROVIDER'

  const bookings = await db.booking.findMany({
    where: isProvider ? { providerId: user.id } : { customerId: user.id },
    include: {
      customer: true,
      provider: true,
      serviceCategory: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#0F172A]">Daftar Pesanan</h1>
        <p className="text-slate-600">Riwayat layanan dan status pesanan aktif Anda.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-[#E2E8F0] rounded-[16px]">
          <CardContent className="p-8 text-center text-slate-500">
            Belum ada pesanan saat ini.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-[#E2E8F0] rounded-[16px] overflow-hidden">
              <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-4 flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">
                  {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </span>
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  booking.status === 'PENDING' ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]' :
                  booking.status === 'ACCEPTED' ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]' :
                  booking.status === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7]' :
                  'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]'
                }`}>
                  {booking.status}
                </span>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">
                      {booking.serviceCategory.name}
                    </h3>
                    <p className="text-[14px] text-[#334155] mb-4">
                      {isProvider ? `Pemesan: ${booking.customer.name}` : `Tukang: ${booking.provider.name}`}
                    </p>
                    <div className="space-y-2 text-[14px]">
                      <p><span className="text-[#64748B]">Waktu:</span> {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString('id-ID') : '-'}</p>
                      <p><span className="text-[#64748B]">Alamat:</span> {booking.address}</p>
                      <p><span className="text-[#64748B]">Kendala:</span> {booking.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
