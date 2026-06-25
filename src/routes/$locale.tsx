import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { isAppLocale } from '#/lib/locale'

export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de' })
    }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  return <Outlet />
}
