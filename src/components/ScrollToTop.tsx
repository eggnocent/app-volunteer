import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const scrollDelayMs = 220

export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, scrollDelayMs)

    return () => window.clearTimeout(timeoutId)
  }, [pathname, search])

  return null
}
