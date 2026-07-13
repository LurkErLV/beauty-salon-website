import { createServerFn } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { z } from 'zod'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

import { prisma } from '#/db'

export const PICKUP_MAP_URL =
  'https://www.google.com/maps/place/%C3%8Ele+de+Beaut%C3%A9+beauty+salon/@47.363784,8.5336094,17z'
export const PICKUP_ADDRESS = 'Île de Beauté Beauty Salon, Zürich'

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20),
})

const createPreorderSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(30),
  note: z.string().max(800).optional(),
})

const upsertProductSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(1200),
  brand: z.string().max(80).optional(),
  imageUrl: z.string().max(500).optional(),
  priceCents: z.number().int().min(0).max(1000000),
  currency: z.string().min(3).max(3).default('CHF'),
  isActive: z.boolean().default(true),
  inStock: z.boolean().default(true),
})

const productIdSchema = z.object({
  id: z.number().int().positive(),
})

const availabilitySchema = productIdSchema.extend({
  inStock: z.boolean(),
})

const visibilitySchema = productIdSchema.extend({
  isActive: z.boolean(),
})

const preorderStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']),
})

export type ProductDto = {
  id: number
  name: string
  description: string
  brand: string | null
  imageUrl: string | null
  priceCents: number
  currency: string
  isActive: boolean
  inStock: boolean
}

export type PreorderDto = {
  id: number
  totalCents: number
  currency: string
  pickupAddress: string
  createdAt: string
}

export type AdminPreorderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'

export type AdminPreorderDto = {
  id: number
  customerEmail: string
  customerName: string | null
  status: AdminPreorderStatus
  note: string | null
  pickupAddress: string
  totalCents: number
  currency: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: number
    productId: number
    productName: string
    productBrand: string | null
    quantity: number
    unitPriceCents: number
    currency: string
  }>
}

export const listProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ProductDto>> => {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ inStock: 'desc' }, { createdAt: 'desc' }],
    })

    return products.map(serializeProduct)
  },
)

export const listAdminProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ProductDto>> => {
    await requireAdmin()

    const products = await prisma.product.findMany({
      orderBy: [{ createdAt: 'desc' }],
    })

    return products.map(serializeProduct)
  },
)

export const checkAdminAccess = createServerFn({ method: 'GET' }).handler(
  async (): Promise<boolean> => {
    try {
      await requireAdmin()
      return true
    } catch {
      return false
    }
  },
)

export const listAdminPreorders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<AdminPreorderDto>> => {
    await requireAdmin()

    const preorders = await prisma.preorder.findMany({
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    return preorders.map(serializeAdminPreorder)
  },
)

export const createPreorder = createServerFn({ method: 'POST' })
  .validator(createPreorderSchema)
  .handler(async ({ data }): Promise<PreorderDto> => {
    const user = await requireVerifiedUser()
    const productIds = data.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        inStock: true,
      },
    })
    const productsById = new Map(products.map((product) => [product.id, product]))

    if (products.length !== new Set(productIds).size) {
      throw new Error('One or more products are unavailable.')
    }

    const items = data.items.map((item) => {
      const product = productsById.get(item.productId)

      if (!product) {
        throw new Error('Product is unavailable.')
      }

      return {
        product,
        quantity: item.quantity,
        lineTotal: product.priceCents * item.quantity,
      }
    })
    const totalCents = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const currency = items[0]?.product.currency ?? 'CHF'

    const preorder = await prisma.preorder.create({
      data: {
        clerkUserId: user.userId,
        customerEmail: user.email,
        customerName: user.name,
        note: data.note?.trim() || undefined,
        pickupAddress: PICKUP_ADDRESS,
        totalCents,
        currency,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productBrand: item.product.brand,
            quantity: item.quantity,
            unitPriceCents: item.product.priceCents,
            currency: item.product.currency,
          })),
        },
      },
    })

    return {
      id: preorder.id,
      totalCents: preorder.totalCents,
      currency: preorder.currency,
      pickupAddress: preorder.pickupAddress,
      createdAt: preorder.createdAt.toISOString(),
    }
  })

export const upsertProduct = createServerFn({ method: 'POST' })
  .validator(upsertProductSchema)
  .handler(async ({ data }): Promise<ProductDto> => {
    await requireAdmin()

    const product = await prisma.product.upsert({
      where: {
        id: data.id ?? 0,
      },
      create: {
        name: data.name.trim(),
        description: data.description.trim(),
        brand: data.brand?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        priceCents: data.priceCents,
        currency: data.currency.toUpperCase(),
        isActive: data.isActive,
        inStock: data.inStock,
      },
      update: {
        name: data.name.trim(),
        description: data.description.trim(),
        brand: data.brand?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        priceCents: data.priceCents,
        currency: data.currency.toUpperCase(),
        isActive: data.isActive,
        inStock: data.inStock,
      },
    })

    return serializeProduct(product)
  })

export const setProductAvailability = createServerFn({ method: 'POST' })
  .validator(availabilitySchema)
  .handler(async ({ data }): Promise<ProductDto> => {
    await requireAdmin()

    const product = await prisma.product.update({
      where: { id: data.id },
      data: { inStock: data.inStock },
    })

    return serializeProduct(product)
  })

export const setProductVisibility = createServerFn({ method: 'POST' })
  .validator(visibilitySchema)
  .handler(async ({ data }): Promise<ProductDto> => {
    await requireAdmin()

    const product = await prisma.product.update({
      where: { id: data.id },
      data: { isActive: data.isActive },
    })

    return serializeProduct(product)
  })

export const archiveProduct = createServerFn({ method: 'POST' })
  .validator(productIdSchema)
  .handler(async ({ data }): Promise<ProductDto> => {
    await requireAdmin()

    const product = await prisma.product.update({
      where: { id: data.id },
      data: { isActive: false, inStock: false },
    })

    return serializeProduct(product)
  })

export const uploadProductImage = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected image upload form data.')
    }

    const file = data.get('image')

    if (!(file instanceof File)) {
      throw new Error('Choose an image file.')
    }

    return { file }
  })
  .handler(async ({ data }): Promise<{ imageUrl: string }> => {
    await requireAdmin()

    if (!data.file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.')
    }

    if (data.file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5 MB.')
    }

    const fallbackExtension = data.file.type.split('/')[1] || 'jpg'
    const extension = sanitizeExtension(extname(data.file.name)) || fallbackExtension
    const filename = `${randomUUID()}.${extension}`
    const bytes = Buffer.from(await data.file.arrayBuffer())

    await Promise.all(
      getProductImageUploadDirs().map(async (uploadDir) => {
        await mkdir(uploadDir, { recursive: true })
        await writeFile(join(uploadDir, filename), bytes)
      }),
    )

    return { imageUrl: `/preorder-products/${filename}` }
  })

export const setPreorderStatus = createServerFn({ method: 'POST' })
  .validator(preorderStatusSchema)
  .handler(async ({ data }): Promise<AdminPreorderDto> => {
    await requireAdmin()

    const preorder = await prisma.preorder.update({
      where: { id: data.id },
      data: { status: data.status },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
      },
    })

    return serializeAdminPreorder(preorder)
  })

function serializeProduct(product: ProductDto): ProductDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
    currency: product.currency,
    isActive: product.isActive,
    inStock: product.inStock,
  }
}

function serializeAdminPreorder(
  preorder: Awaited<ReturnType<typeof prisma.preorder.findMany>>[number] & {
    items: Array<{
      id: number
      productId: number
      productName: string
      productBrand: string | null
      quantity: number
      unitPriceCents: number
      currency: string
    }>
  },
): AdminPreorderDto {
  return {
    id: preorder.id,
    customerEmail: preorder.customerEmail,
    customerName: preorder.customerName,
    status: preorder.status,
    note: preorder.note,
    pickupAddress: preorder.pickupAddress,
    totalCents: preorder.totalCents,
    currency: preorder.currency,
    createdAt: preorder.createdAt.toISOString(),
    updatedAt: preorder.updatedAt.toISOString(),
    items: preorder.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productBrand: item.productBrand,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      currency: item.currency,
    })),
  }
}

function sanitizeExtension(extension: string) {
  const normalized = extension.replace('.', '').toLowerCase()
  const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])

  return allowed.has(normalized) ? normalized : ''
}

function getProductImageUploadDirs() {
  const cwd = process.cwd()
  const dirs = [
    join(cwd, 'public', 'preorder-products'),
    join(cwd, '.output', 'public', 'preorder-products'),
  ]

  return [...new Set(dirs)]
}

async function requireVerifiedUser() {
  const session = await auth()

  if (!session.userId) {
    throw new Error('Sign in is required.')
  }

  const user = await clerkClient().users.getUser(session.userId)
  const primaryEmail =
    user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    ) ?? user.emailAddresses[0]
  const isVerified = primaryEmail?.verification?.status === 'verified'

  if (!primaryEmail?.emailAddress || !isVerified) {
    throw new Error('A verified email address is required.')
  }

  return {
    userId: session.userId,
    email: primaryEmail.emailAddress,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      null,
  }
}

export async function requireAdmin() {
  const user = await requireVerifiedUser()
  const adminEmails = (process.env.PREORDER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.length === 0) {
    throw new Error('Set PREORDER_ADMIN_EMAILS in .env.local.')
  }

  if (!adminEmails.includes(user.email.toLowerCase())) {
    throw new Error('Admin access is required.')
  }

  return user
}
