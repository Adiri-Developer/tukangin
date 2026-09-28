import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAgreement, payEscrow, completeWork, releaseEscrow } from '@/app/actions/booking'

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-[#FCA5A5] rounded-[16px]">
        <p className="text-[#B91C1C] font-semibold mb-2">Sesi Tidak Valid / Akun Tidak Ditemukan</p>
        <p className="text-[#64748B]">Database baru saja di-reset. Akun lama Anda mungkin telah terhapus. Silakan klik tombol <b>Keluar Akun</b> di bagian bawah layar dan buat akun baru.</p>
      </div>
    )
  }

  const isProvider = user.role === 'PROVIDER'

  const bookings = await db.booking.findMany({
    where: isProvider ? { providerId: user.id } : { customerId: user.id },
    include: {
      customer: true,
      provider: true,
      serviceCategory: true,
      agreement: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#0F172A]">Daftar Pesanan</h1>
        <p className="text-slate-600">Riwayat layanan, persetujuan kerja, dan pembayaran Escrow.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-[#E2E8F0] rounded-[16px]">
          <CardContent className="p-8 text-center text-slate-500">
            Belum ada pesanan saat ini.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-[#E2E8F0] rounded-[16px] overflow-hidden">
              <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-4 flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">
                  {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </span>
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  booking.status === 'PENDING' ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]' :
                  booking.status === 'ACCEPTED' ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]' :
                  booking.status === 'IN_PROGRESS' ? 'bg-[#FDF4FF] text-[#C026D3] border border-[#F5D0FE]' :
                  booking.status === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7]' :
                  'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]'
                }`}>
                  {booking.status}
                </span>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
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

                    {/* Escrow Payment Status */}
                    {booking.payment && (
                      <div className="mt-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                        <p className="text-[12px] font-bold text-[#166534] mb-1">Status Pembayaran (Escrow)</p>
                        <p className="text-[14px] text-[#15803D]">
                          Total: Rp{(booking.payment.amount).toLocaleString('id-ID')} 
                          <span className="mx-2">•</span> 
                          Status: {booking.payment.status === 'HELD_IN_ESCROW' ? 'Ditahan oleh Platform 🔒' : 'Dana Diteruskan ke Tukang ✅'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 flex flex-col gap-3">
                    {/* ACTION: Provider Accepts Booking & Sets Price */}
                    {isProvider && booking.status === 'PENDING' && !booking.agreement && (
                      <form action={createAgreement} className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <p className="text-[12px] font-bold text-slate-700">Tentukan Biaya (Perjanjian Digital)</p>
                        <div>
                          <Label className="text-[12px]">Biaya Jasa (Rp)</Label>
                          <Input name="serviceFee" type="number" required placeholder="150000" className="h-8 text-[12px]" />
                        </div>
                        <div>
                          <Label className="text-[12px]">Estimasi Material (Rp)</Label>
                          <Input name="materialCost" type="number" placeholder="50000" className="h-8 text-[12px]" />
                        </div>
                        <Button type="submit" className="w-full h-8 text-[12px] bg-[#10B981] hover:bg-[#059669] text-white">Ajukan Biaya</Button>
                      </form>
                    )}

                    {/* ACTION: Customer Pays Escrow */}
                    {!isProvider && booking.agreement?.status === 'DRAFT' && booking.status === 'ACCEPTED' && (
                      <form action={payEscrow} className="p-4 bg-[#FFF7ED] border border-[#FDBA74] rounded-lg">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <p className="text-[12px] font-bold text-[#C2410C] mb-2">Tagihan Tukang</p>
                        <p className="text-[14px] mb-1">Jasa: Rp{(booking.agreement.serviceFee || 0).toLocaleString('id-ID')}</p>
                        <p className="text-[14px] mb-3">Material: Rp{(booking.agreement.materialCost || 0).toLocaleString('id-ID')}</p>
                        <Button type="submit" className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold shadow-sm">Setuju & Bayar (Escrow)</Button>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">Uang aman ditahan platform sampai selesai.</p>
                      </form>
                    )}

                    {/* ACTION: Provider Completes Work */}
                    {isProvider && booking.status === 'IN_PROGRESS' && (
                      <form action={completeWork}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">Pekerjaan Selesai</Button>
                      </form>
                    )}

                    {/* ACTION: Customer Releases Escrow */}
                    {!isProvider && booking.status === 'COMPLETED' && booking.payment?.status === 'HELD_IN_ESCROW' && (
                      <form action={releaseEscrow} className="p-4 bg-[#ECFDF5] border border-[#6EE7B7] rounded-lg">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <p className="text-[12px] text-[#047857] mb-2 text-center">Pekerjaan telah diselesaikan oleh Tukang.</p>
                        <Button type="submit" className="w-full bg-[#10B981] hover:bg-[#059669] text-white">Lepas Dana Escrow</Button>
                      </form>
                    )}
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
