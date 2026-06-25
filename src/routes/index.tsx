import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Scissors,
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
  const services = [
    {
      title: m.service_hair_title({}, { locale }),
      description: m.service_hair_description({}, { locale }),
    },
    {
      title: m.service_skin_title({}, { locale }),
      description: m.service_skin_description({}, { locale }),
    },
    {
      title: m.service_makeup_title({}, { locale }),
      description: m.service_makeup_description({}, { locale }),
    },
  ]
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
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <img
          src="/salon-room-chairs.webp"
          alt=""
          className="hero-image-entrance absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,250,246,0.96)_0%,rgba(255,250,246,0.86)_43%,rgba(255,250,246,0.35)_78%)] dark:bg-[linear-gradient(90deg,rgba(18,22,25,0.92)_0%,rgba(18,22,25,0.78)_46%,rgba(18,22,25,0.32)_82%)]" />

        <div className="page-wrap flex min-h-[calc(100vh-12rem)] items-center">
          <div className="max-w-2xl">
            <p className="animate-rise eyebrow mb-5 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {m.hero_eyebrow({}, { locale })}
            </p>
            <h1 className="animate-rise display-title text-5xl font-semibold leading-[1.02] text-[var(--ink)] [animation-delay:120ms] sm:text-6xl lg:text-7xl">
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
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
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

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="animate-rise service-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <Scissors className="h-6 w-6 text-[var(--accent)]" />
                <h3 className="mt-5 text-xl font-semibold text-[var(--ink)]">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="studio" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="animate-rise overflow-hidden rounded-lg">
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
                className="animate-rise overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_50px_rgba(37,39,45,0.08)]"
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
      className="animate-rise rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3"
      style={{ animationDelay: delay }}
    >
      <p className="text-2xl font-semibold text-[var(--ink)]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
        {label}
      </p>
    </div>
  )
}
