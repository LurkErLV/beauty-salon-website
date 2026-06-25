import { createServerFn } from '@tanstack/react-start'

export const TREATWELL_URL = 'https://www.treatwell.ch/ort/ile-de-beaute-2'

export type TreatwellReview = {
  author: string
  date: string
  service: string
  text: string
}

export type TreatwellReviewsResponse = {
  rating: string
  count: string
  reviews: Array<TreatwellReview>
  sourceUrl: string
}

export const getLatestReviews = createServerFn({
  method: 'GET',
}).handler(async (): Promise<TreatwellReviewsResponse> => {
  const response = await fetch(TREATWELL_URL, {
    headers: {
      'accept-language': 'de-CH,de;q=0.9,en;q=0.8',
      'user-agent':
        'Mozilla/5.0 (compatible; IleDeBeauteReviews/1.0; +https://localhost)',
    },
  })

  if (!response.ok) {
    throw new Error(`Treatwell responded with ${response.status}`)
  }

  const html = await response.text()
  return parseTreatwellReviews(html)
})

function parseTreatwellReviews(html: string): TreatwellReviewsResponse {
  const lines = htmlToLines(html)
  const salonRatingIndex = lines.findIndex(
    (line) => line === 'Salonbewertungen',
  )
  const rating = lines[salonRatingIndex + 1] ?? ''
  const countLine = lines[salonRatingIndex + 2] ?? ''
  const count = countLine.match(/\d+/)?.[0] ?? ''
  const start = lines.findIndex((line) => line === 'Verifizierte Bewertungen')
  const end = lines.findIndex((line) => line === 'Lerne das Team kennen')
  const reviewLines = lines.slice(start + 1, end === -1 ? undefined : end)
  const reviews: Array<TreatwellReview> = []

  for (let index = 0; index < reviewLines.length; index += 1) {
    const serviceLine = reviewLines[index]

    if (!serviceLine?.startsWith('Behandelt von ')) {
      continue
    }

    const service = reviewLines[index + 2] ?? ''
    const author = reviewLines[index + 3] ?? ''
    const date = reviewLines[index + 5] ?? ''
    const verifiedLine = reviewLines[index + 6] ?? ''

    if (verifiedLine !== 'Verifizierte Bewertung') {
      continue
    }

    const textParts: Array<string> = []
    let cursor = index + 7

    while (
      cursor < reviewLines.length &&
      !reviewLines[cursor]?.startsWith('Behandelt von ') &&
      reviewLines[cursor] !== 'Mehr anzeigen...'
    ) {
      textParts.push(reviewLines[cursor])
      cursor += 1
    }

    const text = textParts.join(' ').trim()

    if (author && date && service && text) {
      reviews.push({
        author: author.trim(),
        date: date.trim(),
        service,
        text,
      })
    }

    index = cursor - 1
  }

  return {
    rating,
    count,
    reviews: reviews.slice(0, 3),
    sourceUrl: TREATWELL_URL,
  }
}

function htmlToLines(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((line) => decodeHtml(line).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
