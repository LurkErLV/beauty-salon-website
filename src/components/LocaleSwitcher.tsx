import { Link, useRouterState } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import {
  appLocales,
  getLocaleFromPathname,
  useCurrentLocale,
} from '#/lib/locale'
import { cn } from '#/lib/utils'

function getLocalizedPath(pathname: string, locale: string) {
  const parts = pathname.split('/').filter(Boolean)
  const [, ...rest] = parts
  const suffix = rest.length > 0 ? `/${rest.join('/')}` : ''

  return `/${locale}${suffix}`
}

export default function ParaglideLocaleSwitcher() {
  const currentLocale = useCurrentLocale()
  const { pathname, hash } = useRouterState({
    select: (state) => state.location,
  })

  return (
    <div
      className="flex items-center gap-1"
      aria-label={m.language_label({}, { locale: currentLocale })}
    >
      {appLocales.map((locale) => (
        <Link
          key={locale}
          to={getLocalizedPath(pathname, locale)}
          hash={hash}
          aria-current={
            locale === getLocaleFromPathname(pathname) ? 'true' : undefined
          }
          className={cn(
            'rounded-full border border-[var(--chip-line)] px-2.5 py-1 text-xs font-semibold uppercase text-[var(--muted-ink)] no-underline transition hover:bg-[var(--surface-soft)] hover:text-[var(--muted-ink)]',
            locale === currentLocale && 'bg-[var(--ink)] text-[var(--surface)]',
          )}
        >
          {locale}
        </Link>
      ))}
    </div>
  )
}
