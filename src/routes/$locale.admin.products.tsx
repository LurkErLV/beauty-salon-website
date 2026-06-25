import { createFileRoute, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Check, Eye, EyeOff, ImageUp, PackagePlus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  checkAdminAccess,
  listAdminProducts,
  setProductAvailability,
  setProductVisibility,
  uploadProductImage,
  upsertProduct,
  type ProductDto,
} from '#/lib/preorder'

export const Route = createFileRoute('/$locale/admin/products')({
  beforeLoad: async ({ params }) => {
    const hasAdminAccess = await checkAdminAccess()

    if (!hasAdminAccess) {
      throw redirect({ to: `/${params.locale}` })
    }
  },
  component: AdminProductsPage,
})

type ProductForm = {
  id?: number
  name: string
  description: string
  brand: string
  imageUrl: string
  price: string
  currency: string
  isActive: boolean
  inStock: boolean
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  brand: '',
  imageUrl: '',
  price: '',
  currency: 'CHF',
  isActive: true,
  inStock: true,
}

function AdminProductsPage() {
  const loadProducts = useServerFn(listAdminProducts)
  const saveProduct = useServerFn(upsertProduct)
  const toggleAvailability = useServerFn(setProductAvailability)
  const toggleVisibility = useServerFn(setProductVisibility)
  const uploadImage = useServerFn(uploadProductImage)
  const [products, setProducts] = useState<Array<ProductDto>>([])
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refreshProducts() {
    setIsLoading(true)
    setError(null)

    try {
      setProducts(await loadProducts())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Products could not be loaded.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshProducts()
  }, [])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number.parseFloat(form.price.replace(',', '.'))

    if (!Number.isFinite(price)) {
      setError('Enter a valid price, for example 123.45.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveProduct({
        data: {
          id: form.id,
          name: form.name,
          description: form.description,
          brand: form.brand || undefined,
          imageUrl: form.imageUrl || undefined,
          priceCents: Math.round(price * 100),
          currency: form.currency,
          isActive: form.isActive,
          inStock: form.inStock,
        },
      })
      setForm(emptyForm)
      await refreshProducts()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Product could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function editProduct(product: ProductDto) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand ?? '',
      imageUrl: product.imageUrl ?? '',
      price: String(product.priceCents / 100),
      currency: product.currency,
      isActive: product.isActive,
      inStock: product.inStock,
    })
  }

  async function setStock(product: ProductDto, inStock: boolean) {
    setError(null)

    try {
      await toggleAvailability({ data: { id: product.id, inStock } })
      await refreshProducts()
    } catch (stockError) {
      setError(
        stockError instanceof Error
          ? stockError.message
          : 'Availability could not be updated.',
      )
    }
  }

  async function setVisibility(product: ProductDto, isActive: boolean) {
    setError(null)

    try {
      await toggleVisibility({ data: { id: product.id, isActive } })
      await refreshProducts()
    } catch (visibilityError) {
      setError(
        visibilityError instanceof Error
          ? visibilityError.message
          : 'Visibility could not be updated.',
      )
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const data = new FormData()
      data.set('image', file)
      const result = await uploadImage({ data })
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Image could not be uploaded.',
      )
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <main className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <div className="grid gap-8 lg:grid-cols-[24rem_1fr] lg:items-start">
          <form
            onSubmit={handleSave}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(37,39,45,0.08)]"
          >
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-[var(--accent)]" />
              <h1 className="text-xl font-semibold text-[var(--ink)]">
                {form.id ? 'Edit product' : 'Add product'}
              </h1>
            </div>
            <AdminInput
              label="Name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <AdminInput
              label="Brand"
              value={form.brand}
              onChange={(value) => setForm((current) => ({ ...current, brand: value }))}
            />
            <label className="mt-4 block text-sm font-semibold text-[var(--ink)]">
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 min-h-28 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-sm"
                required
              />
            </label>
            <AdminInput
              label="Image URL"
              value={form.imageUrl}
              onChange={(value) =>
                setForm((current) => ({ ...current, imageUrl: value }))
              }
            />
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--surface)]">
              <ImageUp className="h-4 w-4 text-[var(--accent)]" />
              {isUploading ? 'Uploading image...' : 'Upload local image'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt=""
                className="mt-3 aspect-[4/3] w-full rounded-lg object-cover"
              />
            )}
            <div className="mt-4 grid grid-cols-[1fr_5rem] gap-3">
              <AdminInput
                label="Price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(value) =>
                  setForm((current) => ({ ...current, price: value }))
                }
              />
              <AdminInput
                label="Currency"
                value={form.currency}
                onChange={(value) =>
                  setForm((current) => ({ ...current, currency: value }))
                }
              />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    inStock: event.target.checked,
                  }))
                }
              />
              In stock
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              Visible to clients
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="submit" className="primary-action" disabled={isSaving}>
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
            <h2 className="section-title">Products for preorder.</h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted-ink)]">
              Add products, hide them from clients, or mark them out of stock.
            </p>
            {isLoading && (
              <p className="mt-8 text-sm text-[var(--muted-ink)]">
                Loading products...
              </p>
            )}
            <div className="mt-8 grid gap-4">
              {products.map((product) => (
                <article key={product.id} className="product-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[var(--ink)]">
                        {product.name}
                      </h3>
                      <StatusPill active={product.isActive}>
                        {product.isActive ? 'Visible' : 'Hidden'}
                      </StatusPill>
                      <StatusPill active={product.inStock}>
                        {product.inStock ? 'In stock' : 'Out of stock'}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
                      {product.description}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[var(--ink)]">
                      {formatMoney(product.priceCents, product.currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      className="secondary-action px-4 py-2"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-action px-4 py-2"
                      onClick={() => setStock(product, !product.inStock)}
                    >
                      {product.inStock ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {product.inStock ? 'Out of stock' : 'In stock'}
                    </button>
                    <button
                      type="button"
                      className="secondary-action px-4 py-2"
                      onClick={() => setVisibility(product, !product.isActive)}
                    >
                      {product.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {product.isActive ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function AdminInput({
  label,
  value,
  onChange,
  ...props
}: {
  label: string
  value: string
  onChange: (value: string) => void
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mt-4 block text-sm font-semibold text-[var(--ink)]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-sm"
        required={label !== 'Brand' && label !== 'Image URL'}
        {...props}
      />
    </label>
  )
}

function StatusPill({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return (
    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
      {children}
    </span>
  )
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
