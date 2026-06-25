import { useEffect, useState } from 'react'

import {
  getLatestReviews,
  type TreatwellReviewsResponse,
} from '#/lib/treatwell'

let cachedReviews: TreatwellReviewsResponse | null = null
let pendingReviews: Promise<TreatwellReviewsResponse> | null = null

export function useTreatwellReviews() {
  const [data, setData] = useState<TreatwellReviewsResponse | null>(
    cachedReviews,
  )
  const [isLoading, setIsLoading] = useState(!cachedReviews)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadReviews() {
      if (cachedReviews) {
        setData(cachedReviews)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        pendingReviews ??= getLatestReviews()
        const reviews = await pendingReviews
        cachedReviews = reviews

        if (isCurrent) {
          setData(reviews)
        }
      } catch (reviewError) {
        pendingReviews = null

        if (isCurrent) {
          setError(
            reviewError instanceof Error
              ? reviewError
              : new Error('Failed to load reviews'),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isCurrent = false
    }
  }, [])

  return { data, isLoading, error }
}
