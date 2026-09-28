'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const managementPath = '/dashboard/services'

function redirectWithMessage(status: 'success' | 'error', message: string): never {
  const params = new URLSearchParams({ status, message })
  redirect(`${managementPath}?${params.toString()}`)
}

async function requireProvider() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      role: true,
      providerProfile: { select: { id: true } },
    },
  })

  if (user?.role !== 'PROVIDER' || !user.providerProfile) {
    redirect('/dashboard')
  }

  return user.providerProfile
}

function parsePrice(value: FormDataEntryValue | null) {
  const price = Number(value)

  if (!Number.isFinite(price) || price < 10_000 || price > 1_000_000_000) {
    redirectWithMessage('error', 'Harga harus berada di antara Rp10.000 dan Rp1.000.000.000.')
  }

  return price
}

function parseImageUrl(value: FormDataEntryValue | null) {
  const imageUrl = String(value ?? '').trim()

  if (!imageUrl) return null

  try {
    const parsed = new URL(imageUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error()
  } catch {
    redirectWithMessage('error', 'URL gambar harus memakai alamat http atau https yang valid.')
  }

  return imageUrl
}

export async function saveProviderService(formData: FormData) {
  const provider = await requireProvider()
  const categoryId = String(formData.get('categoryId') ?? '').trim()
  const price = parsePrice(formData.get('price'))

  if (!categoryId) {
    redirectWithMessage('error', 'Pilih kategori layanan terlebih dahulu.')
  }

  const category = await db.serviceCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true },
  })

  if (!category) {
    redirectWithMessage('error', 'Kategori layanan tidak ditemukan.')
  }

  const existingService = await db.providerService.findFirst({
    where: {
      providerProfileId: provider.id,
      serviceCategoryId: category.id,
    },
    select: { id: true },
  })

  if (existingService) {
    await db.providerService.update({
      where: { id: existingService.id },
      data: { price },
    })
  } else {
    await db.providerService.create({
      data: {
        providerProfileId: provider.id,
        serviceCategoryId: category.id,
        price,
      },
    })
  }

  revalidatePath(managementPath)
  revalidatePath('/services')
  revalidatePath(`/services/${category.id}`)
  redirectWithMessage('success', `${category.name} berhasil disimpan dengan harga terbaru.`)
}

export async function deleteProviderService(formData: FormData) {
  const provider = await requireProvider()
  const serviceId = String(formData.get('serviceId') ?? '').trim()

  const service = await db.providerService.findFirst({
    where: { id: serviceId, providerProfileId: provider.id },
    select: { id: true, serviceCategoryId: true, serviceCategory: { select: { name: true } } },
  })

  if (!service) {
    redirectWithMessage('error', 'Layanan tidak ditemukan atau bukan milik akun ini.')
  }

  await db.providerService.delete({ where: { id: service.id } })

  revalidatePath(managementPath)
  revalidatePath('/services')
  revalidatePath(`/services/${service.serviceCategoryId}`)
  redirectWithMessage('success', `${service.serviceCategory.name} dihapus dari layanan Anda.`)
}

export async function savePortfolioProject(formData: FormData) {
  const provider = await requireProvider()
  const portfolioId = String(formData.get('portfolioId') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const imageUrl = parseImageUrl(formData.get('imageUrl'))

  if (title.length < 3 || title.length > 100) {
    redirectWithMessage('error', 'Judul portfolio harus terdiri dari 3 sampai 100 karakter.')
  }

  if (description.length > 600) {
    redirectWithMessage('error', 'Deskripsi portfolio maksimal 600 karakter.')
  }

  const data = {
    title,
    description: description || null,
    imageUrl,
  }

  if (portfolioId) {
    const project = await db.portfolioProject.findFirst({
      where: { id: portfolioId, providerProfileId: provider.id },
      select: { id: true },
    })

    if (!project) {
      redirectWithMessage('error', 'Portfolio tidak ditemukan atau bukan milik akun ini.')
    }

    await db.portfolioProject.update({ where: { id: project.id }, data })
    revalidatePath(managementPath)
    redirectWithMessage('success', 'Portfolio berhasil diperbarui.')
  }

  await db.portfolioProject.create({
    data: {
      ...data,
      providerProfileId: provider.id,
    },
  })

  revalidatePath(managementPath)
  redirectWithMessage('success', 'Portfolio baru berhasil ditambahkan.')
}

export async function deletePortfolioProject(formData: FormData) {
  const provider = await requireProvider()
  const portfolioId = String(formData.get('portfolioId') ?? '').trim()

  const project = await db.portfolioProject.findFirst({
    where: { id: portfolioId, providerProfileId: provider.id },
    select: { id: true, title: true },
  })

  if (!project) {
    redirectWithMessage('error', 'Portfolio tidak ditemukan atau bukan milik akun ini.')
  }

  await db.portfolioProject.delete({ where: { id: project.id } })

  revalidatePath(managementPath)
  redirectWithMessage('success', `Portfolio ${project.title} berhasil dihapus.`)
}
