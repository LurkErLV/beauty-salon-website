import { HandleSSOCallback } from '@clerk/tanstack-react-start'
import { ClientOnly, createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

import { isAppLocale } from '#/lib/locale'

export const Route = createFileRoute('/$locale/sign-up_/sso-callback')({
  beforeLoad: ({ params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de/sign-up/sso-callback' })
    }
  },
  component: SignUpSsoCallbackPage,
})

function SignUpSsoCallbackPage() {
  const { locale } = Route.useParams()
  const homePath = `/${locale}`
  const navigate = useNavigate()

  const goTo = (destination: string) => {
    if (destination.startsWith('http')) {
      window.location.href = destination
      return
    }

    void navigate({ to: destination })
  }

  return (
    <main className="grid min-h-[calc(100vh-12rem)] place-items-center px-4">
      <ClientOnly
        fallback={
          <div className="auth-form-skeleton w-full max-w-md" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        }
      >
        <HandleSSOCallback
          navigateToApp={({ decorateUrl, session }) => {
            if (session?.currentTask) {
              goTo(decorateUrl(`/${locale}/tasks/${session.currentTask.key}`))
              return
            }

            goTo(decorateUrl(homePath))
          }}
          navigateToSignIn={() => goTo(`/${locale}/sign-in`)}
          navigateToSignUp={() => goTo(`/${locale}/sign-up/continue`)}
        />
      </ClientOnly>
    </main>
  )
}
