import { useAuth } from '@clerk/tanstack-react-start'
import { useEffect, useState } from 'react'

type LastKnownAuthState = 'signed-in' | 'signed-out'

const AUTH_STORAGE_KEY = 'maison-glow:last-auth-state'

export function useLastKnownAuthState() {
  const { isLoaded, isSignedIn } = useAuth()
  const [lastKnownState, setLastKnownState] =
    useState<LastKnownAuthState>('signed-out')

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (stored === 'signed-in' || stored === 'signed-out') {
      setLastKnownState(stored)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    const nextState = isSignedIn ? 'signed-in' : 'signed-out'
    setLastKnownState(nextState)
    window.localStorage.setItem(AUTH_STORAGE_KEY, nextState)
  }, [isLoaded, isSignedIn])

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    lastKnownState,
  }
}
