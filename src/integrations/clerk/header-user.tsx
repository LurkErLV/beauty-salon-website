import { Link } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { LogIn } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'
import { useLastKnownAuthState } from '#/hooks/useLastKnownAuthState'

export default function HeaderUser({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const locale = useCurrentLocale()
  const { isLoaded, isSignedIn, lastKnownState } = useLastKnownAuthState()

  if (!isLoaded) {
    return (
      <div className="auth-slot" aria-hidden="true">
        {lastKnownState === 'signed-in' ? (
          <span className="auth-avatar-shell" />
        ) : (
          <span className="auth-button auth-button-loading">
            <span className="h-4 w-4 rounded-full bg-current opacity-35" />
            <span>{m.auth_button({}, { locale })}</span>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="auth-slot">
      {isSignedIn ? (
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-[0_10px_28px_rgba(37,39,45,0.08)]">
          <UserButton
            appearance={{
              elements: {
                userButtonBox: 'h-8 w-8 justify-center!',
                userButtonTrigger: 'h-8 w-8 rounded-full',
                avatarBox: 'h-8 w-8 rounded-full',
              },
            }}
          />
        </div>
      ) : (
        <Link
          to="/$locale/sign-in"
          params={{ locale }}
          className="auth-button"
          onClick={onNavigate}
        >
          <LogIn className="h-4 w-4" />
          <span className="min-w-fit">{m.auth_button({}, { locale })}</span>
        </Link>
      )}
    </div>
  )
}
