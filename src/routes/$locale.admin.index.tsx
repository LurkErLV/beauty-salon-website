import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Boxes, ClipboardList, Scissors, Settings } from 'lucide-react'

import { checkAdminAccess } from '#/lib/preorder'

export const Route = createFileRoute('/$locale/admin/')({
  beforeLoad: async ({ params }) => {
    if (!(await checkAdminAccess())) {
      throw redirect({ to: '/$locale', params: { locale: params.locale } })
    }
  },
  component: AdminHomePage,
})

const sections = [
  {
    to: '/$locale/admin/products',
    title: 'Products',
    description: 'Manage preorder products, prices, images and stock.',
    icon: Boxes,
  },
  {
    to: '/$locale/admin/services',
    title: 'Services',
    description: 'Manage salon treatments, duration and prices.',
    icon: Scissors,
  },
  {
    to: '/$locale/admin/preorders',
    title: 'Preorders',
    description: 'Review client preorders and update their status.',
    icon: ClipboardList,
  },
] as const

function AdminHomePage() {
  const { locale } = Route.useParams()

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <p className="eyebrow mb-4 inline-flex items-center gap-2">
          <Settings className="h-4 w-4" /> Admin
        </p>
        <h1 className="section-title">Salon management.</h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted-ink)]">
          Choose the area you want to update.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {sections.map(({ to, title, description, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              params={{ locale }}
              className="animate-rise admin-link-card"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <Icon className="h-7 w-7 text-[var(--accent)]" />
              <h2 className="mt-6 text-xl font-semibold text-[var(--ink)]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
