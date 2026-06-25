import { useRouterState } from '@tanstack/react-router'

export const appLocales = ['de', 'en', 'ru'] as const

export type AppLocale = (typeof appLocales)[number]

export function isAppLocale(locale: string): locale is AppLocale {
  return appLocales.includes(locale as AppLocale)
}

export function getLocaleFromPathname(pathname: string): AppLocale {
  const segment = pathname.split('/').filter(Boolean)[0]

  if (isAppLocale(segment)) {
    return segment
  }

  return 'de'
}

export function useCurrentLocale() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return getLocaleFromPathname(pathname)
}
