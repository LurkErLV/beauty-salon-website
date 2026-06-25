import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { AuthShell, AuthSkeleton, clerkAppearance } from '#/components/AuthShell'
import { useLastKnownAuthState } from '#/hooks/useLastKnownAuthState'
import { getLocaleFromPathname, isAppLocale, useCurrentLocale } from '#/lib/locale'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/$locale/sign-up')({
  beforeLoad: ({ location, params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de/sign-up' })
    }

    if (getLocaleFromPathname(location.pathname) !== params.locale) {
      throw redirect({ to: `/${params.locale}/sign-up` })
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  const locale = useCurrentLocale()
  const homePath = `/${locale}`
  const signInPath = `/${locale}/sign-in`
  const signUpPath = `/${locale}/sign-up`
  const { isLoaded, isSignedIn } = useLastKnownAuthState()

  return (
    <AuthShell
      locale={locale}
      eyebrow={m.auth_signup_eyebrow({}, { locale })}
      title={m.auth_signup_title({}, { locale })}
      description={m.auth_signup_description({}, { locale })}
    >
      {!isLoaded && <AuthSkeleton />}
      {isLoaded && !isSignedIn && (
        <SignUp
          key={signUpPath}
          routing="path"
          path={signUpPath}
          signInUrl={signInPath}
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
