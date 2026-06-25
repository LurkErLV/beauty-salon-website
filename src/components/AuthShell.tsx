import { Link } from '@tanstack/react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { m } from '#/paraglide/messages'
import type { AppLocale } from '#/lib/locale'

type AuthShellProps = {
  children: React.ReactNode
  description?: string
  eyebrow?: string
  locale: AppLocale
  title?: string
}

export const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full border-0 bg-transparent shadow-none',
    headerTitle: 'font-[Inter] text-[var(--ink)] text-2xl font-semibold',
    headerSubtitle: 'font-[Inter] text-[var(--muted-ink)] text-sm',
    socialButtonsBlockButton:
      'rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]',
    formButtonPrimary:
      'rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]',
    formFieldInput:
      'rounded-lg border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]',
    footerActionLink: 'text-[var(--accent-strong)]',
  },
}

export function AuthShell({
  children,
  description,
  eyebrow,
  locale,
  title,
}: AuthShellProps) {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="page-wrap grid min-h-[calc(100vh-16rem)] items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
        <section>
          <div className="mb-8 flex flex-col items-start gap-6">
            <Link
              to="/$locale"
              params={{ locale }}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--muted-ink)] no-underline transition hover:text-[var(--ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {m.auth_back_home({}, { locale })}
            </Link>
            <p className="eyebrow m-0 inline-flex w-fit items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {eyebrow ?? m.auth_page_eyebrow({}, { locale })}
            </p>
          </div>
          <h1 className="display-title text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
            {title ?? m.auth_page_title({}, { locale })}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted-ink)]">
            {description ?? m.auth_page_description({}, { locale })}
          </p>
        </section>

        <section className="auth-page-panel">{children}</section>
      </div>
    </main>
  )
}

export function AuthSkeleton() {
  return (
    <div className="auth-form-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}
