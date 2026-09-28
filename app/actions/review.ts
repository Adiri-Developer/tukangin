'use server'

import { auth } from '@/auth'
import { Prisma } from '@/app/generated/prisma/client'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const bookingsPath = '/dashboard/bookings'

function redirectWithMessage(status: 'success' | 'error', message: string): never {
  const params = new URLSearchParams({ reviewStatus: status, reviewMessage: message })
  redirect(`${bookingsPath}?${params.toString()}`)
}

export async function submitReview(formData: FormData) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  })

  if (!user || user.role !== 'CUSTOMER') {
    redirectWithMessage('error', 'Hanya customer yang dapat memberikan ulasan.')
  }

  const bookingId = String(formData.get('bookingId') ?? '').trim()
  const rating = Number(formData.get('rating'))
  const comment = String(formData.get('comment') ?? '').trim()

  if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirectWithMessage('error', 'Pilih rating dari 1 sampai 5 bintang.')
  }

  if (comment.length > 500) {
    redirectWithMessage('error', 'Ulasan maksimal 500 karakter.')
  }

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      customerId: user.id,
      status: 'COMPLETED',
    },
    select: {
      serviceCategoryId: true,
      payment: { select: { status: true } },
      review: { select: { id: true } },
      provider: {
        select: {
          providerProfile: { select: { id: true } },
        },
      },
    },
  })

  if (!booking) {
    redirectWithMessage('error', 'Pesanan tidak ditemukan atau belum selesai.')
  }

  if (booking.payment?.status !== 'RELEASED') {
    redirectWithMessage('error', 'Lepaskan dana ke tukang sebelum memberikan ulasan.')
  }

  if (booking.review) {
    redirectWithMessage('error', 'Pesanan ini sudah pernah diberi ulasan.')
  }

  const providerProfileId = booking.provider.providerProfile?.id

  if (!providerProfileId) {
    redirectWithMessage('error', 'Profil mitra untuk pesanan ini tidak ditemukan.')
  }

  try {
    await db.review.create({
      data: {
        bookingId,
        providerProfileId,
        customerId: user.id,
        rating,
        comment: comment || null,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirectWithMessage('error', 'Pesanan ini sudah pernah diberi ulasan.')
    }

    throw error
  }

  revalidatePath(bookingsPath)
  revalidatePath(`/services/${booking.serviceCategoryId}`)
  redirectWithMessage('success', 'Terima kasih, ulasan Anda berhasil dikirim.')
}
