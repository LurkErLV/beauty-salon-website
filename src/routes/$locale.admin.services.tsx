import { createFileRoute, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Eye, EyeOff, ImageUp, Save, Scissors, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { checkAdminAccess, uploadProductImage } from '#/lib/preorder'
import { deleteService, listAdminServices, upsertService } from '#/lib/services'
import type { ServiceDto } from '#/lib/services'

export const Route = createFileRoute('/$locale/admin/services')({
  beforeLoad: async ({ params }) => {
    if (!(await checkAdminAccess())) {
      throw redirect({ to: '/$locale', params: { locale: params.locale } })
    }
  },
  component: AdminServicesPage,
})

type ServiceForm = {
  id?: number
  name: string
  nameEn: string
  nameRu: string
  description: string
  descriptionEn: string
  descriptionRu: string
  category: string
  categoryEn: string
  categoryRu: string
  imageUrl: string
  price: string
  duration: string
  currency: string
  isActive: boolean
}

const emptyForm: ServiceForm = {
  name: '',
  nameEn: '',
  nameRu: '',
  description: '',
  descriptionEn: '',
  descriptionRu: '',
  category: '',
  categoryEn: '',
  categoryRu: '',
  imageUrl: '',
  price: '',
  duration: '',
  currency: 'CHF',
  isActive: true,
}

function AdminServicesPage() {
  const loadServices = useServerFn(listAdminServices)
  const saveService = useServerFn(upsertService)
  const removeService = useServerFn(deleteService)
  const uploadImage = useServerFn(uploadProductImage)
  const [services, setServices] = useState<Array<ServiceDto>>([])
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function refresh() {
    try {
      setServices(await loadServices())
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Services could not be loaded.',
      )
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number.parseFloat(form.price.replace(',', '.'))
    const duration = form.duration
      ? Number.parseInt(form.duration, 10)
      : undefined
    if (
      !Number.isFinite(price) ||
      (duration !== undefined && !Number.isFinite(duration))
    ) {
      setError('Enter a valid price and duration.')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await saveService({
        data: {
          id: form.id,
          name: form.name,
          nameEn: form.nameEn || undefined,
          nameRu: form.nameRu || undefined,
          description: form.description,
          descriptionEn: form.descriptionEn || undefined,
          descriptionRu: form.descriptionRu || undefined,
          category: form.category || undefined,
          categoryEn: form.categoryEn || undefined,
          categoryRu: form.categoryRu || undefined,
          imageUrl: form.imageUrl || undefined,
          durationMinutes: duration,
          priceCents: Math.round(price * 100),
          currency: form.currency,
          isActive: form.isActive,
        },
      })
      setForm(emptyForm)
      await refresh()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Service could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function edit(service: ServiceDto) {
    setForm({
      id: service.id,
      name: service.name,
      nameEn: service.nameEn ?? '',
      nameRu: service.nameRu ?? '',
      description: service.description,
      descriptionEn: service.descriptionEn ?? '',
      descriptionRu: service.descriptionRu ?? '',
      category: service.category ?? '',
      categoryEn: service.categoryEn ?? '',
      categoryRu: service.categoryRu ?? '',
      imageUrl: service.imageUrl ?? '',
      duration: service.durationMinutes?.toString() ?? '',
      price: (service.priceCents / 100).toString(),
      currency: service.currency,
      isActive: service.isActive,
    })
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this service?')) return
    setError(null)
    try {
      await removeService({ data: { id } })
      if (form.id === id) setForm(emptyForm)
      await refresh()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Service could not be deleted.',
      )
    }
  }

  async function toggle(service: ServiceDto) {
    setError(null)
    try {
      await saveService({
        data: {
          ...service,
          category: service.category ?? undefined,
          durationMinutes: service.durationMinutes ?? undefined,
          isActive: !service.isActive,
        },
      })
      await refresh()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Visibility could not be updated.',
      )
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const data = new FormData()
      data.set('image', file)
      const result = await uploadImage({ data })
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Image could not be uploaded.',
      )
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <main className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="page-wrap grid gap-8 lg:grid-cols-[24rem_1fr] lg:items-start">
        <form onSubmit={handleSubmit} className="admin-form-panel">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--ink)]">
            <Scissors className="h-5 w-5 text-[var(--accent)]" />
            {form.id ? 'Edit service' : 'Add service'}
          </h1>
          <LanguageFields
            language="Deutsch"
            name={form.name}
            category={form.category}
            description={form.description}
            required
            onChange={(values) => setForm({ ...form, ...values })}
          />
          <LanguageFields
            language="English"
            name={form.nameEn}
            category={form.categoryEn}
            description={form.descriptionEn}
            onChange={(values) =>
              setForm({
                ...form,
                nameEn: values.name,
                categoryEn: values.category,
                descriptionEn: values.description,
              })
            }
          />
          <LanguageFields
            language="Русский"
            name={form.nameRu}
            category={form.categoryRu}
            description={form.descriptionRu}
            onChange={(values) =>
              setForm({
                ...form,
                nameRu: values.name,
                categoryRu: values.category,
                descriptionRu: values.description,
              })
            }
          />
          <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--ink)]">
            <ImageUp className="h-4 w-4 text-[var(--accent)]" />
            {isUploading ? 'Uploading image...' : 'Upload service image'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              onChange={handleImageUpload}
            />
          </label>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt=""
              className="mt-3 aspect-[4/3] w-full rounded-lg object-cover"
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(price) => setForm({ ...form, price })}
            />
            <Field
              label="Duration, min"
              required={false}
              type="number"
              min="1"
              value={form.duration}
              onChange={(duration) => setForm({ ...form, duration })}
            />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
            />{' '}
            Visible to clients
          </label>
          <div className="mt-5 flex gap-2">
            <button className="primary-action" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setForm(emptyForm)}
            >
              Reset
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm font-semibold text-[var(--accent-strong)]">
              {error}
            </p>
          )}
        </form>

        <section>
          <p className="eyebrow mb-4">Admin</p>
          <h2 className="section-title">Services and prices.</h2>
          <div className="mt-8 grid gap-4">
            {services.map((service) => (
              <article key={service.id} className="product-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    {service.category && (
                      <span className="category-pill">{service.category}</span>
                    )}
                    <span className="status-pill">
                      {service.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
                    {service.description}
                  </p>
                  <p className="mt-2 font-bold">
                    {formatMoney(service.priceCents, service.currency)}
                    {service.durationMinutes
                      ? ` · ${service.durationMinutes} min`
                      : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    className="secondary-action px-4 py-2"
                    onClick={() => edit(service)}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary-action px-4 py-2"
                    onClick={() => toggle(service)}
                  >
                    {service.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {service.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    className="secondary-action px-4 py-2"
                    onClick={() => remove(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  required = true,
  ...props
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
>) {
  return (
    <label className="admin-field">
      {label}
      <input
        {...props}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-control"
      />
    </label>
  )
}

function LanguageFields({
  language,
  name,
  category,
  description,
  required = false,
  onChange,
}: {
  language: string
  name: string
  category: string
  description: string
  required?: boolean
  onChange: (values: {
    name: string
    category: string
    description: string
  }) => void
}) {
  return (
    <fieldset className="mt-5 border-t border-[var(--line)] pt-4">
      <legend className="eyebrow pr-3">{language}</legend>
      <Field
        label="Name"
        required={required}
        value={name}
        onChange={(value) => onChange({ name: value, category, description })}
      />
      <Field
        label="Category"
        required={false}
        value={category}
        onChange={(value) => onChange({ name, category: value, description })}
      />
      <label className="admin-field">
        Description
        <textarea
          required={required}
          value={description}
          onChange={(event) =>
            onChange({ name, category, description: event.target.value })
          }
          className="admin-control min-h-24"
        />
      </label>
    </fieldset>
  )
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(
    cents / 100,
  )
}
