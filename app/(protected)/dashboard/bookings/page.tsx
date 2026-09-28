import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAgreement, payEscrow, completeWork, releaseEscrow } from '@/app/actions/booking'
import { ReviewForm } from './review-form'
import { CancellationAction } from './cancellation-action'
import { AlertCircle, CalendarClock, MapPin, Wrench, Lock, CheckCircle2, ChevronRight, Check, Star } from 'lucide-react'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    reviewStatus?: string
    reviewMessage?: string
    bookingStatus?: string
    bookingMessage?: string
  }>
}) {
  const { reviewStatus, reviewMessage, bookingStatus, bookingMessage } = await searchParams
  const feedbackStatus = bookingStatus ?? reviewStatus
  const feedbackMessage = bookingMessage ?? reviewMessage
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email }
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

  const bookings = await db.booking.findMany({
    where: isProvider ? { providerId: user.id } : { customerId: user.id },
    include: {
      customer: true,
      provider: true,
      serviceCategory: true,
      agreement: true,
      payment: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-1">Daftar Pesanan</h1>
        <p className="text-[#334155] text-lg">Riwayat layanan, persetujuan kerja, dan pembayaran Escrow.</p>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className={`rounded-[12px] border px-4 py-3 text-sm font-semibold ${
            feedbackStatus === 'success'
              ? 'border-[#6EE7B7] bg-[#ECFDF5] text-[#065F46]'
              : 'border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B]'
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {bookings.length === 0 ? (
        <Card className="border-[#E2E8F0] rounded-[16px] bg-white shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <p className="text-slate-500 font-medium text-lg">Belum ada pesanan saat ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-[#E2E8F0] rounded-[16px] overflow-hidden bg-white shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
              <div className="border-b border-[#E2E8F0] bg-slate-50 p-4 flex justify-between items-center">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </span>
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                  booking.status === 'PENDING' ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]' :
                  booking.status === 'ACCEPTED' ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]' :
                  booking.status === 'IN_PROGRESS' ? 'bg-[#FDF4FF] text-[#C026D3] border border-[#F5D0FE]' :
                  booking.status === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7]' :
                  'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]'
                }`}>
                  {booking.status === 'PENDING' && <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-pulse" />}
                  {booking.status === 'IN_PROGRESS' && <div className="w-1.5 h-1.5 rounded-full bg-[#C026D3] animate-pulse" />}
                  {booking.status === 'COMPLETED' && <Check className="w-3 h-3" strokeWidth={3} />}
                  {booking.status === 'PENDING'
                    ? 'MENUNGGU'
                    : booking.status === 'ACCEPTED'
                      ? 'DITERIMA'
                      : booking.status === 'IN_PROGRESS'
                        ? 'DIKERJAKAN'
                        : booking.status === 'COMPLETED'
                          ? 'SELESAI'
                          : 'DIBATALKAN'}
                </span>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="flex-1 space-y-5">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
                        {booking.serviceCategory.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#FF6B00]">
                        {isProvider ? `Pemesan: ${booking.customer.name}` : `Tukang: ${booking.provider.name}`}
                      </p>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex gap-3 items-start">
                        <CalendarClock className="w-5 h-5 text-[#64748B] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Waktu Pengerjaan</p>
                          <p className="text-sm text-[#0F172A] font-medium">{booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString('id-ID') : '-'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <MapPin className="w-5 h-5 text-[#64748B] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Alamat</p>
                          <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{booking.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Wrench className="w-5 h-5 text-[#64748B] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Kendala</p>
                          <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{booking.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Payment Status */}
                    {booking.payment && (
                      <div className={`flex items-center justify-between rounded-xl border p-4 ${
                        booking.payment.status === 'REFUNDED'
                          ? 'border-[#93C5FD] bg-[#EFF6FF]'
                          : 'border-[#6EE7B7] bg-[#ECFDF5]'
                      }`}>
                        <div>
                          <p className={`mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                            booking.payment.status === 'REFUNDED' ? 'text-[#1D4ED8]' : 'text-[#047857]'
                          }`}>
                            <Lock className="h-3.5 w-3.5" /> Status Pembayaran
                          </p>
                          <p className={`text-sm font-bold ${booking.payment.status === 'REFUNDED' ? 'text-[#1E3A8A]' : 'text-[#065F46]'}`}>
                            {booking.payment.status === 'HELD_IN_ESCROW'
                              ? 'Dana Aman Ditahan Platform'
                              : booking.payment.status === 'REFUNDED'
                                ? 'Dana Dikembalikan ke Customer'
                                : booking.payment.status === 'RELEASED'
                                  ? 'Dana Diteruskan ke Tukang'
                                  : 'Menunggu Pembayaran'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`mb-0.5 text-xs ${booking.payment.status === 'REFUNDED' ? 'text-[#1D4ED8]' : 'text-[#047857]'}`}>Total Biaya</p>
                          <p className={`text-lg font-bold tabular-nums ${booking.payment.status === 'REFUNDED' ? 'text-[#1E3A8A]' : 'text-[#065F46]'}`}>Rp{(booking.payment.amount).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    )}

                    {booking.review && (
                      <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#92400E]">
                            Ulasan customer
                          </p>
                          <div className="flex items-center gap-0.5" aria-label={`${booking.review.rating} dari 5 bintang`}>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                aria-hidden="true"
                                className={`h-4 w-4 ${value <= booking.review!.rating ? 'fill-amber-400 text-amber-500' : 'text-[#D1D5DB]'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {booking.review.comment ? (
                          <p className="text-sm leading-6 text-[#78350F]">“{booking.review.comment}”</p>
                        ) : (
                          <p className="text-sm text-[#92400E]">Customer memberikan {booking.review.rating} bintang tanpa komentar.</p>
                        )}
                        <p className="mt-2 text-[11px] text-[#A16207]">
                          Dikirim {new Date(booking.review.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-72 flex flex-col gap-3">
                    {/* ACTION: Provider Accepts Booking & Sets Price */}
                    {isProvider && booking.status === 'PENDING' && !booking.agreement && (
                      <form action={createAgreement} className="space-y-4 p-5 bg-white border-2 border-[#E2E8F0] rounded-[16px] shadow-sm">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                          <Lock className="w-4 h-4 text-[#0F172A]" />
                          <p className="text-sm font-bold text-[#0F172A]">Tentukan Biaya Jasa</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-[#334155]">Biaya Jasa (Rp)</Label>
                          <Input name="serviceFee" type="number" required placeholder="150000" className="h-10 text-sm border-[#E2E8F0] rounded-[8px] focus-visible:ring-[#FF6B00]" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-[#334155]">Estimasi Material (Rp)</Label>
                          <Input name="materialCost" type="number" placeholder="50000" className="h-10 text-sm border-[#E2E8F0] rounded-[8px] focus-visible:ring-[#FF6B00]" />
                        </div>
                        <Button type="submit" className="w-full h-11 text-sm font-bold bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95 mt-2">
                          Kirim & Setujui Pesanan
                        </Button>
                      </form>
                    )}

                    {/* ACTION: Customer Pays Escrow */}
                    {!isProvider && booking.agreement?.status === 'DRAFT' && booking.status === 'ACCEPTED' && (
                      <form action={payEscrow} className="p-5 bg-[#FFF7ED] border-2 border-[#FDBA74] rounded-[16px] shadow-sm">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-bold text-[#C2410C]">Tagihan Tukang</p>
                          <Lock className="w-4 h-4 text-[#C2410C]" />
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#9A3412]">Jasa</span>
                            <span className="font-semibold text-[#7C2D12] tabular-nums">Rp{(booking.agreement.serviceFee || 0).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#9A3412]">Material</span>
                            <span className="font-semibold text-[#7C2D12] tabular-nums">Rp{(booking.agreement.materialCost || 0).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="h-px bg-[#FDBA74]/50 my-2"></div>
                          <div className="flex justify-between text-base font-bold">
                            <span className="text-[#9A3412]">Total</span>
                            <span className="text-[#C2410C] tabular-nums">Rp{((booking.agreement.serviceFee || 0) + (booking.agreement.materialCost || 0)).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold h-11 rounded-[8px] shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95 flex items-center justify-center gap-2">
                          Bayar via Escrow <ChevronRight className="w-4 h-4" />
                        </Button>
                        <p className="text-[10px] font-medium text-[#C2410C]/80 mt-3 text-center flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" /> Uang aman ditahan platform sampai selesai
                        </p>
                      </form>
                    )}

                    {/* ACTION: Provider Completes Work */}
                    {isProvider && booking.status === 'IN_PROGRESS' && (
                      <form action={completeWork} className="p-5 bg-white border-2 border-[#E2E8F0] rounded-[16px] text-center">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Wrench className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-bold text-[#0F172A] mb-1">Pekerjaan Sedang Berjalan</p>
                        <p className="text-xs text-[#64748B] mb-4">Tekan tombol di bawah jika pekerjaan sudah diselesaikan di lokasi.</p>
                        <Button type="submit" className="w-full h-11 font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-[8px] transition-transform active:scale-95 shadow-[0_4px_12px_rgba(29,78,216,0.25)]">
                          Pekerjaan Selesai
                        </Button>
                      </form>
                    )}

                    {/* ACTION: Customer Releases Escrow */}
                    {!isProvider && booking.status === 'COMPLETED' && booking.payment?.status === 'HELD_IN_ESCROW' && (
                      <form action={releaseEscrow} className="p-5 bg-[#ECFDF5] border-2 border-[#6EE7B7] rounded-[16px] text-center shadow-sm">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <div className="w-12 h-12 bg-[#D1FAE5] border border-[#A7F3D0] rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-6 h-6 text-[#047857]" />
                        </div>
                        <p className="text-sm font-bold text-[#065F46] mb-1">Pekerjaan Telah Selesai</p>
                        <p className="text-xs text-[#047857] mb-4 leading-relaxed">Konfirmasi bahwa tukang telah menyelesaikan tugasnya agar dana dapat diteruskan.</p>
                        <Button type="submit" className="w-full h-11 font-bold bg-[#10B981] hover:bg-[#059669] text-white rounded-[8px] transition-transform active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.25)]">
                          Lepas Dana ke Tukang
                        </Button>
                      </form>
                    )}

                    {!isProvider && booking.status === 'COMPLETED' && booking.payment?.status === 'RELEASED' && !booking.review && (
                      <ReviewForm
                        bookingId={booking.id}
                        providerName={booking.provider.name || 'mitra tukang'}
                      />
                    )}

                    {booking.status === 'PENDING' && (
                      <CancellationAction
                        bookingId={booking.id}
                        label={isProvider ? 'Tolak Pesanan' : 'Batalkan Pesanan'}
                        pendingLabel={isProvider ? 'Menolak...' : 'Membatalkan...'}
                        description={isProvider
                          ? 'Tolak jika Anda tidak dapat menerima jadwal atau lingkup pekerjaan ini.'
                          : 'Pesanan dapat dibatalkan sebelum mitra mengirim penawaran biaya.'}
                        confirmation={isProvider
                          ? 'Tolak pesanan ini? Customer akan melihat pesanan sebagai dibatalkan.'
                          : 'Batalkan pesanan ini? Tindakan ini tidak dapat diurungkan.'}
                      />
                    )}

                    {booking.status === 'ACCEPTED' && booking.agreement?.status === 'DRAFT' && (
                      <CancellationAction
                        bookingId={booking.id}
                        label={isProvider ? 'Tarik Penawaran' : 'Tolak Penawaran'}
                        pendingLabel="Memproses..."
                        description={isProvider
                          ? 'Penawaran akan ditandai ditarik dan pesanan tidak dapat dilanjutkan.'
                          : 'Tolak jika rincian biaya belum sesuai. Belum ada dana yang dipotong.'}
                        confirmation={isProvider
                          ? 'Tarik penawaran dan batalkan pesanan ini?'
                          : 'Tolak penawaran biaya dan batalkan pesanan ini?'}
                      />
                    )}

                    {booking.status === 'IN_PROGRESS' && booking.payment?.status === 'HELD_IN_ESCROW' && (
                      <CancellationAction
                        bookingId={booking.id}
                        label="Batalkan & Refund"
                        pendingLabel="Mengembalikan dana..."
                        description={isProvider
                          ? 'Pembatalan akan menghentikan pekerjaan dan mengembalikan seluruh dana escrow kepada customer.'
                          : 'Pembatalan akan menghentikan pekerjaan dan mengembalikan seluruh dana escrow Anda.'}
                        confirmation="Batalkan pekerjaan dan kembalikan seluruh dana escrow? Tindakan ini tidak dapat diurungkan."
                        refundsPayment
                      />
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
