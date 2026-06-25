import {
  TaskChooseOrganization,
  TaskResetPassword,
  TaskSetupMFA,
  useSession,
} from '@clerk/tanstack-react-start'
import { ClientOnly, createFileRoute, redirect } from '@tanstack/react-router'

import { AuthShell, AuthSkeleton, clerkAppearance } from '#/components/AuthShell'
import { isAppLocale, useCurrentLocale } from '#/lib/locale'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/$locale/tasks')({
  beforeLoad: ({ params }) => {
    if (!isAppLocale(params.locale)) {
      throw redirect({ to: '/de/tasks' })
    }
  },
  component: TasksPage,
})

function TasksPage() {
  const locale = useCurrentLocale()

  return (
    <AuthShell
      locale={locale}
      eyebrow={m.auth_signup_eyebrow({}, { locale })}
      title={m.auth_signup_title({}, { locale })}
      description={m.auth_signup_description({}, { locale })}
    >
      <ClientOnly fallback={<AuthSkeleton />}>
        <TaskContent />
      </ClientOnly>
    </AuthShell>
  )
}

function TaskContent() {
  const { session, isLoaded } = useSession()

  if (!isLoaded) {
    return <AuthSkeleton />
  }

  const taskKey = session?.currentTask?.key

  if (taskKey === 'choose-organization') {
    return <TaskChooseOrganization appearance={clerkAppearance} />
  }

  if (taskKey === 'reset-password') {
    return <TaskResetPassword appearance={clerkAppearance} />
  }

  if (taskKey === 'setup-mfa') {
    return <TaskSetupMFA appearance={clerkAppearance} />
  }

  return <AuthSkeleton />
}
