'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function createBooking(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || user.role !== 'CUSTOMER') {
    return { error: 'Hanya Customer yang bisa memesan Tukang' }
  }

  const providerId = formData.get('providerId') as string
  const serviceCategoryId = formData.get('categoryId') as string
  const address = formData.get('address') as string
  const description = formData.get('description') as string
  const dateStr = formData.get('date') as string

  if (!providerId || !serviceCategoryId || !address || !description || !dateStr) {
    return { error: 'Semua kolom harus diisi' }
  }

  await db.booking.create({
    data: {
      customerId: user.id,
      providerId: providerId,
      serviceCategoryId: serviceCategoryId,
      address,
      description,
      scheduledAt: new Date(dateStr),
      status: 'PENDING'
    }
  })

  redirect('/dashboard/bookings')
}

import { revalidatePath } from 'next/cache'

export async function createAgreement(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const bookingId = formData.get('bookingId') as string
  const serviceFee = parseFloat(formData.get('serviceFee') as string)
  const materialCost = parseFloat(formData.get('materialCost') as string) || 0

  await db.agreement.create({
    data: {
      bookingId,
      serviceFee,
      materialCost,
      status: 'DRAFT'
    }
  })
  
  await db.booking.update({
    where: { id: bookingId },
    data: { status: 'ACCEPTED' }
  })

  revalidatePath('/dashboard/bookings')
}

export async function payEscrow(formData: FormData) {
  const bookingId = formData.get('bookingId') as string
  
  const agreement = await db.agreement.findUnique({ where: { bookingId } })
  if (!agreement) throw new Error('No agreement found')

  const totalAmount = (agreement.serviceFee || 0) + (agreement.materialCost || 0)

  // Mark agreement as agreed
  await db.agreement.update({
    where: { bookingId },
    data: { status: 'AGREED', agreedAt: new Date() }
  })

  // Create payment in Escrow
  await db.payment.create({
    data: {
      bookingId,
      amount: totalAmount,
      status: 'HELD_IN_ESCROW',
      paidAt: new Date(),
      paymentMethod: 'VIRTUAL_ACCOUNT' // Simulated
    }
  })

  // Update booking to IN_PROGRESS
  await db.booking.update({
    where: { id: bookingId },
    data: { status: 'IN_PROGRESS' }
  })

  revalidatePath('/dashboard/bookings')
}

export async function completeWork(formData: FormData) {
  const bookingId = formData.get('bookingId') as string

  await db.booking.update({
    where: { id: bookingId },
    data: { status: 'COMPLETED' }
  })

  revalidatePath('/dashboard/bookings')
}

export async function releaseEscrow(formData: FormData) {
  const bookingId = formData.get('bookingId') as string

  await db.payment.update({
    where: { bookingId },
    data: { status: 'RELEASED', releasedAt: new Date() }
  })

  revalidatePath('/dashboard/bookings')
}
