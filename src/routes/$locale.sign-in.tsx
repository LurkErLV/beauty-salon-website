import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'

import { AuthShell, AuthSkeleton, clerkAppearance } from '#/components/AuthShell'
import { m } from '#/paraglide/messages'
import { getLocaleFromPathname, isAppLocale, useCurrentLocale } from '#/lib/locale'
import { useLastKnownAuthState } from '#/hooks/useLastKnownAuthState'

export const Route = createFileRoute('/$locale/sign-in')({
  beforeLoad: ({ location, params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de/sign-in' })
    }

    if (getLocaleFromPathname(location.pathname) !== params.locale) {
      throw redirect({ to: `/${params.locale}/sign-in` })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const locale = useCurrentLocale()
  const homePath = `/${locale}`
  const signInPath = `/${locale}/sign-in`
  const signUpPath = `/${locale}/sign-up`
  const { isLoaded, isSignedIn } = useLastKnownAuthState()

  return (
    <AuthShell locale={locale}>
      {!isLoaded && <AuthSkeleton />}
      {isLoaded && !isSignedIn && (
        <SignIn
          key={signInPath}
          routing="path"
          path={signInPath}
          signUpUrl={signUpPath}
          fallbackRedirectUrl={homePath}
          appearance={clerkAppearance}
        />
      )}
      {isLoaded && isSignedIn && (
        <div className="text-center">
          <p className="eyebrow mb-4">
            {m.auth_signed_in_eyebrow({}, { locale })}
          </p>
          <h2 className="section-title">
            {m.auth_signed_in_title({}, { locale })}
          </h2>
          <Link to="/$locale" params={{ locale }} className="primary-action mt-8">
            {m.auth_signed_in_cta({}, { locale })}
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
