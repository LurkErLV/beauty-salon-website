import { createCsrfMiddleware, createStart } from '@tanstack/react-start'
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

const requestMiddleware = process.env.CLERK_SECRET_KEY
  ? [csrfMiddleware, clerkMiddleware()]
  : [csrfMiddleware]

if (!process.env.CLERK_SECRET_KEY) {
  console.warn(
    'CLERK_SECRET_KEY is missing. Clerk SSR auth is disabled until the key is added.',
  )
}

export const startInstance = createStart(() => ({
  requestMiddleware,
}))
