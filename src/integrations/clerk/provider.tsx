import { ClerkProvider } from '@clerk/tanstack-react-start'

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/de/sign-in"
      signUpUrl="/de/sign-up"
      taskUrls={{
        'choose-organization': '/de/tasks/choose-organization',
        'reset-password': '/de/tasks/reset-password',
        'setup-mfa': '/de/tasks/setup-mfa',
      }}
      afterSignOutUrl="/de"
    >
      {children}
    </ClerkProvider>
  )
}
