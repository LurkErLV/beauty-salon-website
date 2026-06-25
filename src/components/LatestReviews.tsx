import { ExternalLink, RefreshCw, Star } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useCurrentLocale } from '#/lib/locale'
import { useTreatwellReviews } from '#/hooks/useTreatwellReviews'

export default function LatestReviews() {
  const locale = useCurrentLocale()
  const { data, isLoading, error } = useTreatwellReviews()

  return (
    <section id="reviews" className="section-band px-4 py-20 sm:px-6 lg:px-8">
      <div className="page-wrap">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="animate-rise section-heading">
            <p className="eyebrow">{m.reviews_eyebrow({}, { locale })}</p>
            <h2 className="section-title">{m.reviews_title({}, { locale })}</h2>
            <p className="section-copy">
              {m.reviews_description({}, { locale })}
            </p>
          </div>

          <div className="animate-rise review-summary [animation-delay:120ms]">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              {data?.rating || '...'}
            </p>
            <p className="text-sm text-[var(--muted-ink)]">
              {data
                ? m.reviews_count({ count: data.count }, { locale })
                : m.reviews_loading({}, { locale })}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-rise review-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="review-skeleton h-5 w-28" />
                <div className="review-skeleton mt-5 h-4 w-full" />
                <div className="review-skeleton mt-3 h-4 w-5/6" />
                <div className="review-skeleton mt-3 h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="animate-rise review-card mt-10">
            <RefreshCw className="h-5 w-5 text-[var(--accent)]" />
            <p className="mt-4 font-semibold text-[var(--ink)]">
              {m.reviews_error_title({}, { locale })}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
              {m.reviews_error_description({}, { locale })}
            </p>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {data.reviews.map((review, index) => (
                <article
                  key={`${review.author}-${review.date}`}
                  className="animate-rise review-card"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-base leading-7 text-[var(--ink)]">
                    "{review.text}"
                  </p>
                  <div className="mt-6 border-t border-[var(--line)] pt-4">
                    <p className="font-semibold text-[var(--ink)]">
                      {review.author}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
                      {review.date}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted-ink)]">
                      {review.service}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-action mt-8 w-fit"
            >
              {m.reviews_source_link({}, { locale })}
              <ExternalLink className="h-4 w-4" />
            </a>
          </>
        )}
      </div>
    </section>
  )
}
