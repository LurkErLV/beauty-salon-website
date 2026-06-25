import { createFileRoute, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  checkAdminAccess,
  listAdminPreorders,
  setPreorderStatus,
  type AdminPreorderDto,
  type AdminPreorderStatus,
} from '#/lib/preorder'

export const Route = createFileRoute('/$locale/admin/preorders')({
  beforeLoad: async ({ params }) => {
    const hasAdminAccess = await checkAdminAccess()

    if (!hasAdminAccess) {
      throw redirect({ to: `/${params.locale}` })
    }
  },
  component: AdminPreordersPage,
})

const statusOptions: Array<AdminPreorderStatus> = [
  'PENDING',
  'CONFIRMED',
  'READY',
  'COMPLETED',
  'CANCELLED',
]

const statusLabels: Record<AdminPreorderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function AdminPreordersPage() {
  const loadPreorders = useServerFn(listAdminPreorders)
  const updateStatus = useServerFn(setPreorderStatus)
  const [preorders, setPreorders] = useState<Array<AdminPreorderDto>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    return {
      all: preorders.length,
      pending: preorders.filter((preorder) => preorder.status === 'PENDING')
        .length,
      ready: preorders.filter((preorder) => preorder.status === 'READY').length,
    }
  }, [preorders])

  async function refreshPreorders() {
    setIsLoading(true)
    setError(null)

    try {
      setPreorders(await loadPreorders())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Preorders could not be loaded.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshPreorders()
  }, [])

  async function handleStatusChange(
    preorder: AdminPreorderDto,
    status: AdminPreorderStatus,
  ) {
    if (preorder.status === status) {
      return
    }

    setUpdatingId(preorder.id)
    setError(null)

    try {
      const updated = await updateStatus({
        data: {
          id: preorder.id,
          status,
        },
      })
      setPreorders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : 'Preorder status could not be updated.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-4">Admin</p>
            <h1 className="section-title">Preorders.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-ink)]">
              View product reservations, prepare pickup orders, and update their
              salon status.
            </p>
          </div>
          <button
            type="button"
            className="secondary-action w-fit"
            onClick={refreshPreorders}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="All preorders" value={totals.all} />
          <SummaryCard label="Pending" value={totals.pending} />
          <SummaryCard label="Ready for pickup" value={totals.ready} />
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-semibold text-[var(--accent-strong)]">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="mt-8 text-sm text-[var(--muted-ink)]">
            Loading preorders...
          </p>
        )}

        {!isLoading && preorders.length === 0 && (
          <div className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[0_20px_50px_rgba(37,39,45,0.08)]">
            <ReceiptText className="mx-auto h-8 w-8 text-[var(--accent)]" />
            <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">
              No preorders yet.
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              New reservations will appear here after clients submit the preorder
              cart.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {preorders.map((preorder) => (
            <article
              key={preorder.id}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(37,39,45,0.08)]"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[var(--ink)]">
                      Preorder #{preorder.id}
                    </h2>
                    <StatusPill status={preorder.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--muted-ink)] sm:grid-cols-2">
                    <p className="m-0">
                      <span className="font-semibold text-[var(--ink)]">
                        Client:
                      </span>{' '}
                      {preorder.customerName || 'No name'}
                    </p>
                    <p className="m-0">
                      <span className="font-semibold text-[var(--ink)]">
                        Email:
                      </span>{' '}
                      {preorder.customerEmail}
                    </p>
                    <p className="m-0">
                      <span className="font-semibold text-[var(--ink)]">
                        Created:
                      </span>{' '}
                      {formatDate(preorder.createdAt)}
                    </p>
                    <p className="m-0">
                      <span className="font-semibold text-[var(--ink)]">
                        Total:
                      </span>{' '}
                      {formatMoney(preorder.totalCents, preorder.currency)}
                    </p>
                  </div>
                  {preorder.note && (
                    <p className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-sm leading-6 text-[var(--ink)]">
                      {preorder.note}
                    </p>
                  )}
                </div>

                <label className="block min-w-48 text-sm font-semibold text-[var(--ink)]">
                  Status
                  <select
                    value={preorder.status}
                    onChange={(event) =>
                      handleStatusChange(
                        preorder,
                        event.target.value as AdminPreorderStatus,
                      )
                    }
                    disabled={updatingId === preorder.id}
                    className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-[var(--line)]">
                <div className="grid grid-cols-[1fr_4rem_7rem] gap-3 bg-[var(--surface-soft)] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
                  <span>Product</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Total</span>
                </div>
                {preorder.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_4rem_7rem] gap-3 border-t border-[var(--line)] px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="m-0 font-semibold text-[var(--ink)]">
                        {item.productName}
                      </p>
                      {item.productBrand && (
                        <p className="m-0 mt-1 text-xs text-[var(--muted-ink)]">
                          {item.productBrand}
                        </p>
                      )}
                    </div>
                    <p className="m-0 text-right text-[var(--muted-ink)]">
                      {item.quantity}
                    </p>
                    <p className="m-0 text-right font-semibold text-[var(--ink)]">
                      {formatMoney(
                        item.unitPriceCents * item.quantity,
                        item.currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_42px_rgba(37,39,45,0.07)]">
      <p className="m-0 text-sm font-semibold text-[var(--muted-ink)]">{label}</p>
      <p className="m-0 mt-2 text-3xl font-semibold text-[var(--ink)]">
        {value}
      </p>
    </div>
  )
}

function StatusPill({ status }: { status: AdminPreorderStatus }) {
  const Icon = getStatusIcon(status)

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
      <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
      {statusLabels[status]}
    </span>
  )
}

function getStatusIcon(status: AdminPreorderStatus) {
  if (status === 'CONFIRMED') return CheckCircle2
  if (status === 'READY') return PackageCheck
  if (status === 'COMPLETED') return PackageOpen
  if (status === 'CANCELLED') return XCircle
  return Clock
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
