import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'
import AuthCallout from '#/components/AuthCallout'
import LatestReviews from '#/components/LatestReviews'
import { useTreatwellReviews } from '#/hooks/useTreatwellReviews'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/de' })
  },
})

export function HomePage() {
  const locale = useCurrentLocale()
  const { data: treatwellData, isLoading: isTreatwellLoading } =
    useTreatwellReviews()
  const features = [
    m.feature_private({}, { locale }),
    m.feature_consultation({}, { locale }),
    m.feature_products({}, { locale }),
  ]
  const studioPhotos = [
    {
      src: '/salon-room-chairs.webp',
      alt: 'Private beauty chairs inside the salon',
    },
    {
      src: '/salon-hair-station.webp',
      alt: 'Hair styling station with professional products',
    },
    {
      src: '/salon-nail-products.webp',
      alt: 'Manicure desk and illuminated product shelves',
    },
  ]

  return (
    <main>
      <section className="premium-hero px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="page-wrap premium-hero-grid">
          <div className="premium-hero-copy">
            <p className="animate-rise eyebrow mb-5 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {m.hero_eyebrow({}, { locale })}
            </p>
            <h1 className="animate-rise display-title premium-hero-title [animation-delay:120ms]">
              {m.hero_title({}, { locale })}
            </h1>
            <p className="animate-rise mt-6 max-w-xl text-lg leading-8 text-[var(--muted-ink)] [animation-delay:220ms] sm:text-xl">
              {m.hero_description({}, { locale })}
            </p>
            <div className="animate-rise mt-8 flex flex-col gap-3 [animation-delay:320ms] sm:flex-row">
              <a href="#booking" className="primary-action">
                <CalendarCheck className="h-5 w-5" />
                {m.hero_primary_cta({}, { locale })}
              </a>
              <a href="#services" className="secondary-action">
                {m.hero_secondary_cta({}, { locale })}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              <Stat
                value="12+"
                label={m.stat_years({}, { locale })}
                delay="420ms"
              />
              <Stat
                value={
                  treatwellData?.rating || (isTreatwellLoading ? '...' : '—')
                }
                label={m.stat_rating({}, { locale })}
                delay="500ms"
              />
              <Stat
                value="3"
                label={m.stat_zones({}, { locale })}
                delay="580ms"
              />
            </div>
          </div>

          <div className="animate-rise premium-hero-visual [animation-delay:180ms]">
            <div className="premium-hero-frame">
              <img
                src="/salon-room-chairs.webp"
                alt="Interior of Île de Beauté Beauty Salon"
                className="hero-image-entrance h-full w-full object-cover"
              />
            </div>
            <div className="premium-hero-inset">
              <img
                src="/salon-treatment-room.webp"
                alt="Private treatment room at Île de Beauté Beauty Salon"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="premium-hero-mark" aria-hidden="true">ÎB</div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="section-band px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="page-wrap">
          <div className="animate-rise section-heading">
            <p className="eyebrow">{m.services_eyebrow({}, { locale })}</p>
            <h2 className="section-title">
              {m.services_title({}, { locale })}
            </h2>
            <p className="section-copy">
              {m.services_description({}, { locale })}
            </p>
          </div>

          <div className="animate-rise mt-10 flex flex-col gap-6 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">
              {m.service_hair_description({}, { locale })}
            </p>
            <Link to="/$locale/services" params={{ locale }} className="primary-action shrink-0">
              {m.hero_secondary_cta({}, { locale })}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="studio" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="animate-rise editorial-frame">
            <img
              src="/salon-treatment-room.webp"
              alt="Private treatment room at Île de Beauté Beauty Salon"
              className="image-drift aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="animate-rise [animation-delay:140ms]">
            <p className="eyebrow mb-4">{m.studio_eyebrow({}, { locale })}</p>
            <h2 className="section-title">{m.studio_title({}, { locale })}</h2>
            <p className="mt-5 text-base leading-8 text-[var(--muted-ink)]">
              {m.studio_description({}, { locale })}
            </p>
            <div className="mt-8 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="feature-row">
                  <Star className="h-4 w-4 text-[var(--accent)]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-band px-4 py-20 sm:px-6 lg:px-8">
        <div className="page-wrap">
          <div className="grid gap-4 md:grid-cols-3">
            {studioPhotos.map((photo, index) => (
              <figure
                key={photo.src}
                className={`animate-rise premium-gallery-item ${index === 0 ? 'md:translate-y-8' : index === 2 ? 'md:-translate-y-8' : ''}`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="image-drift aspect-[4/3] w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <LatestReviews />

      <AuthCallout />

      <section id="booking" className="section-band px-4 py-20 sm:px-6 lg:px-8">
        <div className="page-wrap grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="animate-rise">
            <p className="eyebrow mb-4">{m.booking_eyebrow({}, { locale })}</p>
            <h2 className="section-title">{m.booking_title({}, { locale })}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-ink)]">
              {m.booking_description({}, { locale })}
            </p>
          </div>
          <div className="animate-rise booking-panel [animation-delay:140ms]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-[var(--accent)]" />
              <div>
                <p className="font-semibold text-[var(--ink)]">
                  {m.booking_address_title({}, { locale })}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">
                  {m.booking_address({}, { locale })}
                </p>
              </div>
            </div>
            <a href="tel:+41799132382" className="primary-action mt-6 w-full">
              <CalendarCheck className="h-5 w-5" />
              {m.booking_cta({}, { locale })}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({
  value,
  label,
  delay,
}: {
  value: string
  label: string
  delay: string
}) {
  return (
    <div
      className="animate-rise premium-stat"
      style={{ animationDelay: delay }}
    >
      <p className="text-2xl font-semibold text-[var(--ink)]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
        {label}
      </p>
    </div>
  )
}
