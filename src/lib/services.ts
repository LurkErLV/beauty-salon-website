import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { prisma } from '#/db'
import { requireAdmin } from '#/lib/preorder'

const serviceSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  nameEn: z.string().max(120).nullish(),
  nameRu: z.string().max(120).nullish(),
  description: z.string().trim().min(2).max(1200),
  descriptionEn: z.string().max(1200).nullish(),
  descriptionRu: z.string().max(1200).nullish(),
  category: z.string().max(80).optional(),
  categoryEn: z.string().max(80).nullish(),
  categoryRu: z.string().max(80).nullish(),
  imageUrl: z.string().max(500).nullish(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  priceCents: z.number().int().min(0).max(1000000),
  currency: z
    .string()
    .regex(/^[a-z]{3}$/i)
    .default('CHF'),
  isActive: z.boolean().default(true),
})

const serviceIdSchema = z.object({ id: z.number().int().positive() })

export type ServiceDto = {
  id: number
  name: string
  nameEn: string | null
  nameRu: string | null
  description: string
  descriptionEn: string | null
  descriptionRu: string | null
  category: string | null
  categoryEn: string | null
  categoryRu: string | null
  imageUrl: string | null
  durationMinutes: number | null
  priceCents: number
  currency: string
  isActive: boolean
}

export const listServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ServiceDto>> => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return services.map(serializeService)
  },
)

export const listAdminServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ServiceDto>> => {
    await requireAdmin()
    const services = await prisma.service.findMany({
      orderBy: [{ createdAt: 'desc' }],
    })

    return services.map(serializeService)
  },
)

export const upsertService = createServerFn({ method: 'POST' })
  .validator(serviceSchema)
  .handler(async ({ data }): Promise<ServiceDto> => {
    await requireAdmin()
    const values = {
      name: data.name.trim(),
      nameEn: data.nameEn?.trim() || null,
      nameRu: data.nameRu?.trim() || null,
      description: data.description.trim(),
      descriptionEn: data.descriptionEn?.trim() || null,
      descriptionRu: data.descriptionRu?.trim() || null,
      category: data.category?.trim() || null,
      categoryEn: data.categoryEn?.trim() || null,
      categoryRu: data.categoryRu?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      durationMinutes: data.durationMinutes ?? null,
      priceCents: data.priceCents,
      currency: data.currency.toUpperCase(),
      isActive: data.isActive,
    }

    const service = await prisma.service.upsert({
      where: { id: data.id ?? 0 },
      create: values,
      update: values,
    })

    return serializeService(service)
  })

export const deleteService = createServerFn({ method: 'POST' })
  .validator(serviceIdSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    await prisma.service.delete({ where: { id: data.id } })
    return { id: data.id }
  })

function serializeService(service: ServiceDto): ServiceDto {
  return {
    id: service.id,
    name: service.name,
    nameEn: service.nameEn,
    nameRu: service.nameRu,
    description: service.description,
    descriptionEn: service.descriptionEn,
    descriptionRu: service.descriptionRu,
    category: service.category,
    categoryEn: service.categoryEn,
    categoryRu: service.categoryRu,
    imageUrl: service.imageUrl,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    currency: service.currency,
    isActive: service.isActive,
  }
}
