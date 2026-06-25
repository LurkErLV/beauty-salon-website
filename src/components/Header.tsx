import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'

import ClerkHeader from '../integrations/clerk/header-user.tsx'
import ParaglideLocaleSwitcher from './LocaleSwitcher.tsx'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { hash: 'services', label: () => m.nav_services },
  { hash: 'studio', label: () => m.nav_studio },
  { hash: 'reviews', label: () => m.nav_reviews },
  { hash: 'booking', label: () => m.nav_booking },
]

export default function Header() {
  const locale = useCurrentLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="site-header-entrance sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-xl">
      <nav className="page-wrap flex min-h-16 min-w-0 items-center gap-4 py-3">
        <Link
          to="/$locale"
          params={{ locale }}
          onClick={closeMenu}
          className="inline-flex shrink-0 items-center text-sm font-semibold text-[var(--ink)] no-underline"
          aria-label={m.brand_name({}, { locale })}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fffaf6] shadow-[0_10px_24px_rgba(159,70,81,0.14)] ring-1 ring-[rgba(199,109,118,0.22)]">
            <LogoMark />
          </span>
          <span className="ml-2.5 flex min-w-0 flex-col leading-none">
            <span className="whitespace-nowrap font-[Georgia,serif] text-[1.08rem] font-semibold text-[var(--ink)] sm:text-[1.22rem]">
              {"\u00cele de Beaut\u00e9"}
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[0.58rem] font-bold uppercase tracking-[0.28em] text-[var(--accent-strong)] sm:block">
              Beauty Salon
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-sm font-semibold min-[950px]:flex">
          {navItems.map((item) => (
            <Link
              key={item.hash}
              to="/$locale"
              params={{ locale }}
              hash={item.hash}
              className="nav-link"
            >
              {item.label()({}, { locale })}
            </Link>
          ))}
          <Link
            to="/$locale/preorder"
            params={{ locale }}
            className="nav-link"
          >
            {m.nav_preorder({}, { locale })}
          </Link>
        </div>

        <div className="ml-auto flex min-w-fit shrink-0 items-center gap-2">
          <div className="hidden shrink-0 min-[950px]:block">
            <ClerkHeader />
          </div>
          <div className="hidden shrink-0 min-[950px]:block">
            <ParaglideLocaleSwitcher />
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="inline-grid h-9 w-9 place-items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--ink)] transition hover:bg-[var(--surface-soft)] min-[950px]:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="page-wrap border-t border-[var(--line)] py-4 min-[950px]:hidden"
        >
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.hash}
                to="/$locale"
                params={{ locale }}
                hash={item.hash}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--ink)] no-underline transition hover:bg-[var(--surface-soft)]"
                onClick={closeMenu}
              >
                {item.label()({}, { locale })}
              </Link>
            ))}
            <Link
              to="/$locale/preorder"
              params={{ locale }}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--ink)] no-underline transition hover:bg-[var(--surface-soft)]"
              onClick={closeMenu}
            >
              {m.nav_preorder({}, { locale })}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <ParaglideLocaleSwitcher onNavigate={closeMenu} />
            <div className="lg:hidden">
              <ClerkHeader onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function LogoMark() {
  return (
    <svg
      className="h-10 w-10 rounded-full"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="30" fill="#fffaf6" />
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="#c76d76"
        strokeWidth="3"
      />
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="#e6a2b1"
        strokeDasharray="92 18"
        strokeWidth="2"
      />
      <text
        x="32"
        y="39"
        fill="#9f4651"
        fontFamily="Georgia, serif"
        fontSize="19"
        fontWeight="700"
        textAnchor="middle"
      >
        {"\u00ceB"}
      </text>
    </svg>
  )
}
