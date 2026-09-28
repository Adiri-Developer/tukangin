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
