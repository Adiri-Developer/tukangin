'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const bookingsPath = '/dashboard/bookings'

function redirectWithMessage(status: 'success' | 'error', message: string): never {
  const params = new URLSearchParams({ bookingStatus: status, bookingMessage: message })
  redirect(`${bookingsPath}?${params.toString()}`)
}

export async function cancelOrRejectBooking(formData: FormData) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const bookingId = String(formData.get('bookingId') ?? '').trim()

  if (!bookingId) {
    redirectWithMessage('error', 'Pesanan tidak valid.')
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  })

  if (!user || (user.role !== 'CUSTOMER' && user.role !== 'PROVIDER')) {
    redirectWithMessage('error', 'Akun ini tidak dapat mengubah pesanan.')
  }

  const result = await db.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: bookingId,
        OR: [{ customerId: user.id }, { providerId: user.id }],
      },
      select: {
        status: true,
        customerId: true,
        providerId: true,
        agreement: { select: { status: true } },
        payment: { select: { status: true } },
      },
    })

    if (!booking) {
      return { ok: false as const, message: 'Pesanan tidak ditemukan atau bukan milik akun ini.' }
    }

    const isCustomer = booking.customerId === user.id && user.role === 'CUSTOMER'
    const isProvider = booking.providerId === user.id && user.role === 'PROVIDER'

    if (!isCustomer && !isProvider) {
      return { ok: false as const, message: 'Anda tidak memiliki akses untuk mengubah pesanan ini.' }
    }

    if (booking.status === 'PENDING') {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })

      return {
        ok: true as const,
        message: isProvider ? 'Pesanan berhasil ditolak.' : 'Pesanan berhasil dibatalkan.',
      }
    }

    if (booking.status === 'ACCEPTED' && booking.agreement?.status === 'DRAFT') {
      await tx.agreement.update({
        where: { bookingId },
        data: { status: 'REJECTED' },
      })
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })

      return {
        ok: true as const,
        message: isProvider ? 'Penawaran ditarik dan pesanan dibatalkan.' : 'Penawaran ditolak dan pesanan dibatalkan.',
      }
    }

    if (booking.status === 'IN_PROGRESS' && booking.payment?.status === 'HELD_IN_ESCROW') {
      await tx.payment.update({
        where: { bookingId },
        data: { status: 'REFUNDED', releasedAt: null },
      })
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })

      return {
        ok: true as const,
        message: 'Pesanan dibatalkan dan dana escrow dikembalikan kepada customer.',
      }
    }

    return {
      ok: false as const,
      message: 'Pesanan pada tahap ini tidak dapat dibatalkan atau ditolak.',
    }
  }, { isolationLevel: 'Serializable' })

  if (!result.ok) {
    redirectWithMessage('error', result.message)
  }

  revalidatePath(bookingsPath)
  redirectWithMessage('success', result.message)
}
