'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'CUSTOMER' | 'PROVIDER'

  if (!email || !password || !name) {
    return { error: 'Semua kolom harus diisi' }
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'Email sudah terdaftar' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER'
    }
  })

  if (user.role === 'CUSTOMER') {
    await db.customerProfile.create({ data: { userId: user.id } })
  } else if (user.role === 'PROVIDER') {
    await db.providerProfile.create({ data: { userId: user.id } })
  }

  redirect('/login')
}

export async function authenticate(
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard'
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email atau password salah.'
        default:
          return 'Terjadi kesalahan sistem.'
      }
    }
    throw error
  }
}
