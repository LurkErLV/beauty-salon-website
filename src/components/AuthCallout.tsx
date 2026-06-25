import { Link } from '@tanstack/react-router'
import { CalendarCheck, LogIn, Sparkles } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'
import { useLastKnownAuthState } from '#/hooks/useLastKnownAuthState'

export default function AuthCallout() {
  const locale = useCurrentLocale()
  const { isLoaded, isSignedIn, lastKnownState } = useLastKnownAuthState()

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <div className="animate-rise auth-callout">
          <div>
            <p className="eyebrow mb-4 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {m.auth_callout_eyebrow({}, { locale })}
            </p>
            <h2 className="section-title">
              {m.auth_callout_title({}, { locale })}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-ink)]">
              {m.auth_callout_description({}, { locale })}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            {!isLoaded && (
              <span className="primary-action auth-action-loading" aria-hidden="true">
                <span className="h-5 w-5 rounded-full bg-current opacity-35" />
                {lastKnownState === 'signed-in'
                  ? m.auth_callout_signed_in_cta({}, { locale })
                  : m.auth_callout_cta({}, { locale })}
              </span>
            )}
            {isLoaded &&
              (isSignedIn ? (
                <a href="#booking" className="primary-action">
                  <CalendarCheck className="h-5 w-5" />
                  {m.auth_callout_signed_in_cta({}, { locale })}
                </a>
              ) : (
                <Link
                  to="/$locale/sign-in"
                  params={{ locale }}
                  className="primary-action"
                >
                  <LogIn className="h-5 w-5" />
                  {m.auth_callout_cta({}, { locale })}
                </Link>
              ))}
            <a href="#services" className="secondary-action">
              {m.auth_callout_secondary({}, { locale })}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
