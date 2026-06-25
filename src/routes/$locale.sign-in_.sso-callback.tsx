import { HandleSSOCallback } from '@clerk/tanstack-react-start'
import { ClientOnly, createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

import { AuthLoadingState } from '#/components/AuthShell'
import { isAppLocale } from '#/lib/locale'

export const Route = createFileRoute('/$locale/sign-in_/sso-callback')({
  beforeLoad: ({ params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de/sign-in/sso-callback' })
    }
  },
  component: SsoCallbackPage,
})

function SsoCallbackPage() {
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
      <div className="w-full max-w-md">
        <AuthLoadingState />
      </div>
      <ClientOnly fallback={null}>
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
