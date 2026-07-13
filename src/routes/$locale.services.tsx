import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarCheck, Clock, Sparkles } from 'lucide-react'

import { listServices } from '#/lib/services'
import { useCurrentLocale } from '#/lib/locale'

export const Route = createFileRoute('/$locale/services')({
  loader: () => listServices(),
  component: ServicesPage,
})

const copy = {
  de: {
    eyebrow: 'Behandlungen',
    title: 'Pflege, präzise auf Sie abgestimmt.',
    description:
      'Entdecken Sie unsere Leistungen und transparenten Preise. Für die passende Behandlung beraten wir Sie gerne persönlich.',
    empty: 'Die Preisliste wird gerade aktualisiert.',
    from: 'ab',
    book: 'Termin vereinbaren',
  },
  en: {
    eyebrow: 'Treatments',
    title: 'Care, precisely tailored to you.',
    description:
      'Explore our services and transparent prices. We will gladly help you choose the right treatment in person.',
    empty: 'The service menu is currently being updated.',
    from: 'from',
    book: 'Book an appointment',
  },
  ru: {
    eyebrow: 'Услуги',
    title: 'Уход, подобранный именно для вас.',
    description:
      'Познакомьтесь с нашими услугами и прозрачными ценами. Мы поможем выбрать подходящую процедуру лично.',
    empty: 'Прайс-лист сейчас обновляется.',
    from: 'от',
    book: 'Записаться',
  },
} as const

function ServicesPage() {
  const services = Route.useLoaderData()
  const locale = useCurrentLocale()
  const text = copy[locale]
  const fallbackCategory =
    locale === 'de'
      ? 'Weitere Behandlungen'
      : locale === 'ru'
        ? 'Другие услуги'
        : 'Other treatments'
  const localizedServices = services.map((service) => ({
    ...service,
    name:
      locale === 'ru'
        ? service.nameRu || service.name
        : locale === 'en'
          ? service.nameEn || service.name
          : service.name,
    description:
      locale === 'ru'
        ? service.descriptionRu || service.description
        : locale === 'en'
          ? service.descriptionEn || service.description
          : service.description,
    category:
      locale === 'ru'
        ? service.categoryRu || service.category
        : locale === 'en'
          ? service.categoryEn || service.category
          : service.category,
  }))
  const categories = Object.entries(
    localizedServices.reduce<
      Record<string, Array<(typeof localizedServices)[number]>>
    >((groups, service) => {
      const category = service.category?.trim() || fallbackCategory
      ;(groups[category] ??= []).push(service)
      return groups
    }, {}),
  )

  return (
    <main>
      <section className="premium-page-hero px-4 py-16 sm:px-6 lg:px-8">
        <div className="page-wrap max-w-4xl text-center">
          <p className="animate-rise eyebrow mb-5 inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {text.eyebrow}
          </p>
          <h1 className="animate-rise display-title text-5xl font-semibold leading-tight text-[var(--ink)] [animation-delay:80ms] sm:text-6xl">
            {text.title}
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-ink)] [animation-delay:150ms]">
            {text.description}
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="page-wrap max-w-5xl">
          {services.length === 0 ? (
            <p className="text-center text-[var(--muted-ink)]">{text.empty}</p>
          ) : (
            <div className="grid gap-14">
              {categories.map(([category, categoryServices], categoryIndex) => (
                <section
                  key={category}
                  className="animate-rise"
                  style={{ animationDelay: `${categoryIndex * 80}ms` }}
                >
                  <div className="service-category-heading">
                    <p className="eyebrow">{category}</p>
                    <span>{categoryServices.length}</span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {categoryServices.map((service) => (
                      <article key={service.id} className="service-price-card">
                        {service.imageUrl && (
                          <img
                            src={service.imageUrl}
                            alt=""
                            loading="lazy"
                            className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-[var(--ink)]">
                            {service.name}
                          </h2>
                          <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                            {service.description}
                          </p>
                        </div>
                        <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4">
                          {service.durationMinutes ? (
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sage)]">
                              <Clock className="h-4 w-4" />{' '}
                              {service.durationMinutes} min
                            </p>
                          ) : (
                            <span />
                          )}
                          <p className="shrink-0 text-right font-semibold text-[var(--ink)]">
                            <span className="mr-1 text-xs uppercase text-[var(--muted-ink)]">
                              {text.from}
                            </span>
                            <span className="display-title text-2xl">
                              {formatMoney(
                                service.priceCents,
                                service.currency,
                              )}
                            </span>
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/$locale"
              params={{ locale }}
              hash="booking"
              className="primary-action"
            >
              <CalendarCheck className="h-5 w-5" /> {text.book}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(
    cents / 100,
  )
}
