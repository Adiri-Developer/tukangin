'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Unauthorized' }

  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return { error: 'User not found' }

  if (user.role === 'CUSTOMER') {
    await db.customerProfile.update({
      where: { userId: user.id },
      data: { phone, address }
    })
  } else if (user.role === 'PROVIDER') {
    const businessName = formData.get('businessName') as string
    const description = formData.get('description') as string
    const experience = parseInt(formData.get('experience') as string) || 0

    await db.providerProfile.update({
      where: { userId: user.id },
      data: { phone, address, businessName, description, experience }
    })
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function requestVerification(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Unauthorized' }

  const ktpNumber = formData.get('ktpNumber') as string
  // Uploads would go to Supabase Storage, but for MVP we mock the image paths
  const ktpImage = 'mock-ktp-url' 
  const faceImage = 'mock-face-url'

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || user.role !== 'PROVIDER') return { error: 'Invalid user' }

  await db.providerProfile.update({
    where: { userId: user.id },
    data: { 
      ktpNumber,
      ktpImage,
      faceImage,
      // Automatically verify for MVP simulation
      isVerified: true 
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return { success: true }
}
