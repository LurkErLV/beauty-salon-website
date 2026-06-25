import { Clock, ExternalLink, MapPin, Phone } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'

const MAP_URL =
  'https://www.google.com/maps?q=47.363784,8.5336094&z=17&output=embed'
const MAP_LINK = 'https://maps.app.goo.gl/BzKGjF37ch34Dp2c7'

export default function Footer() {
  const year = new Date().getFullYear()
  const locale = useCurrentLocale()

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-4 py-10 text-[var(--muted-ink)]">
      <div className="page-wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-stretch">
          <section className="flex flex-col justify-between gap-8">
            <div>
              <p className="eyebrow mb-4">
                {m.footer_visit_label({}, { locale })}
              </p>
              <h2 className="section-title text-3xl">
                {m.footer_visit_title({}, { locale })}
              </h2>
              <div className="mt-6 grid gap-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--ink)]">
                      {m.footer_address_label({}, { locale })}
                    </p>
                    <p className="m-0 mt-1 leading-7">
                      Alfred-Escher-Strasse 27, 8002 Zürich, Switzerland
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--ink)]">
                      {m.footer_phone_label({}, { locale })}
                    </p>
                    <a
                      href="tel:+41799132382"
                      className="mt-1 inline-block font-semibold leading-7 text-[var(--ink)] no-underline transition hover:text-[var(--accent-strong)]"
                    >
                      +41 79 913 23 82
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--ink)]">
                      {m.footer_hours_label({}, { locale })}
                    </p>
                    <p className="m-0 mt-1 leading-7">
                      {m.footer_hours_weekdays({}, { locale })}
                    </p>
                    <p className="m-0 leading-7">
                      {m.footer_hours_sunday({}, { locale })}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noreferrer"
                className="secondary-action mt-6"
              >
                <ExternalLink className="h-4 w-4" />
                {m.footer_open_map({}, { locale })}
              </a>
            </div>
            <div className="text-sm">
              <p className="m-0">
                &copy; {year} {m.brand_name({}, { locale })}.{' '}
                {m.footer_rights({}, { locale })}
              </p>
              <p className="m-0 mt-2 font-semibold text-[var(--ink)]">
                {m.footer_tagline({}, { locale })}
              </p>
            </div>
          </section>

          <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_50px_rgba(37,39,45,0.08)]">
            <iframe
              title={m.footer_map_title({}, { locale })}
              src={MAP_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 sm:h-96 lg:h-full lg:min-h-96"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
