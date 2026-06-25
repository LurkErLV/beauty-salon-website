import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useUser } from '@clerk/tanstack-react-start'
import {
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  PICKUP_MAP_URL,
  createPreorder,
  listProducts,
  type PreorderDto,
  type ProductDto,
} from '#/lib/preorder'
import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'

export const Route = createFileRoute('/$locale/preorder')({
  loader: () => listProducts(),
  component: PreorderPage,
})

type Cart = Record<number, number>

function PreorderPage() {
  const products = Route.useLoaderData()
  const locale = useCurrentLocale()
  const { isLoaded, isSignedIn, user } = useUser()
  const submitPreorder = useServerFn(createPreorder)
  const [cart, setCart] = useState<Cart>({})
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdPreorder, setCreatedPreorder] = useState<PreorderDto | null>(
    null,
  )
  const isVerified = Boolean(
    user?.emailAddresses.some(
      (email) => email.verification?.status === 'verified',
    ),
  )
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([productId, quantity]) => {
          const product = products.find(
            (candidate) => candidate.id === Number(productId),
          )

          return product ? { product, quantity } : null
        })
        .filter(Boolean) as Array<{ product: ProductDto; quantity: number }>,
    [cart, products],
  )
  const totalCents = cartItems.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  )

  function updateQuantity(productId: number, nextQuantity: number) {
    setCreatedPreorder(null)
    setError(null)
    setCart((current) => {
      const next = { ...current }

      if (nextQuantity <= 0) {
        delete next[productId]
      } else {
        next[productId] = Math.min(nextQuantity, 20)
      }

      return next
    })
  }

  async function handleSubmit() {
    if (!isLoaded || !isSignedIn || !isVerified || cartItems.length === 0) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const preorder = await submitPreorder({
        data: {
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          note,
        },
      })
      setCart({})
      setNote('')
      setCreatedPreorder(preorder)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : m.preorder_submit_error({}, { locale }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <section>
            <p className="animate-rise eyebrow mb-4">
              {m.preorder_eyebrow({}, { locale })}
            </p>
            <h1 className="animate-rise section-title [animation-delay:90ms]">
              {m.preorder_title({}, { locale })}
            </h1>
            <p className="animate-rise mt-5 max-w-3xl text-base leading-8 text-[var(--muted-ink)] [animation-delay:160ms]">
              {m.preorder_description({}, { locale })}
            </p>

            {!isLoaded && (
              <Notice>{m.preorder_checking_account({}, { locale })}</Notice>
            )}

            {isLoaded && !isSignedIn && (
              <Notice>
                {m.preorder_sign_in_required({}, { locale })}{' '}
                <Link
                  to="/$locale/sign-in"
                  params={{ locale }}
                  className="font-bold text-[var(--accent-strong)]"
                >
                  {m.preorder_sign_in_link({}, { locale })}
                </Link>
              </Notice>
            )}

            {isLoaded && isSignedIn && !isVerified && (
              <Notice>
                {m.preorder_verify_email_required({}, { locale })}
              </Notice>
            )}

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {products.map((product, index) => {
                const quantity = cart[product.id] ?? 0

                return (
                  <article
                    key={product.id}
                    className="animate-rise product-card"
                    style={{ animationDelay: `${220 + index * 70}ms` }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="aspect-[4/3] w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid aspect-[4/3] w-full place-items-center rounded-lg bg-[var(--muted)] text-[var(--accent-strong)]">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        {product.brand && (
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                            {product.brand}
                          </p>
                        )}
                        <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
                          {product.name}
                        </h2>
                      </div>
                      <p className="shrink-0 font-bold text-[var(--ink)]">
                        {formatMoney(product.priceCents, product.currency)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                      {product.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[var(--muted-ink)]">
                        {product.inStock
                          ? m.preorder_available({}, { locale })
                          : m.preorder_out_of_stock({}, { locale })}
                      </span>
                      {quantity > 0 ? (
                        <QuantityControl
                          quantity={quantity}
                          onDecrease={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          onIncrease={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          className="secondary-action px-4 py-2"
                          disabled={!product.inStock}
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                          {m.preorder_add({}, { locale })}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="animate-rise sticky top-24 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(37,39,45,0.08)] [animation-delay:260ms]">
            <div className="flex items-center gap-2 text-[var(--ink)]">
              <ShoppingBag className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold">
                {m.preorder_cart_title({}, { locale })}
              </h2>
            </div>

            <div className="mt-5 grid gap-3">
              {cartItems.length === 0 && (
                <p className="text-sm leading-7 text-[var(--muted-ink)]">
                  {m.preorder_cart_empty({}, { locale })}
                </p>
              )}
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-lg border border-[var(--line)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--ink)]">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-ink)]">
                        {item.quantity} x{' '}
                        {formatMoney(
                          item.product.priceCents,
                          item.product.currency,
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full text-[var(--muted-ink)] transition hover:bg-[var(--muted)] hover:text-[var(--ink)]"
                      aria-label={m.preorder_remove({}, { locale })}
                      onClick={() => updateQuantity(item.product.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label className="mt-5 block text-sm font-semibold text-[var(--ink)]">
              {m.preorder_note_label({}, { locale })}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--ink)]"
                placeholder={m.preorder_note_placeholder({}, { locale })}
              />
            </label>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
              <span className="font-semibold text-[var(--muted-ink)]">
                {m.preorder_total_label({}, { locale })}
              </span>
              <span className="text-xl font-bold text-[var(--ink)]">
                {formatMoney(totalCents, cartItems[0]?.product.currency ?? 'CHF')}
              </span>
            </div>

            <a
              href={PICKUP_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--muted)] p-3 text-sm font-semibold text-[var(--ink)] no-underline"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              {m.preorder_pickup_location({}, { locale })}
            </a>

            <button
              type="button"
              className="primary-action mt-5 w-full"
              disabled={
                !isLoaded ||
                !isSignedIn ||
                !isVerified ||
                cartItems.length === 0 ||
                isSubmitting
              }
              onClick={handleSubmit}
            >
              {isSubmitting
                ? m.preorder_submitting({}, { locale })
                : m.preorder_submit({}, { locale })}
            </button>

            {error && (
              <p className="mt-4 text-sm font-semibold text-[var(--accent-strong)]">
                {error}
              </p>
            )}
            {createdPreorder && (
              <div className="mt-4 rounded-lg border border-[rgba(113,134,113,0.35)] bg-[rgba(113,134,113,0.12)] p-3 text-sm text-[var(--ink)]">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[var(--sage)]" />
                  {m.preorder_created(
                    { id: createdPreorder.id },
                    { locale },
                  )}
                </div>
                <p className="mt-2 text-[var(--muted-ink)]">
                  {m.preorder_created_description({}, { locale })}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-rise mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-7 text-[var(--muted-ink)] [animation-delay:210ms]">
      {children}
    </div>
  )
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)]">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center text-[var(--ink)]"
        onClick={onDecrease}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-[var(--ink)]">
        {quantity}
      </span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center text-[var(--ink)]"
        onClick={onIncrease}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
