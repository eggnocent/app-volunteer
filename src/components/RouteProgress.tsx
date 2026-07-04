import { useLocation } from 'react-router-dom'

export function RouteProgress() {
  const location = useLocation()

  return (
    <div
      key={location.pathname + location.search}
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left animate-[route-progress_620ms_ease-out_forwards] bg-primary"
    />
  )
}
