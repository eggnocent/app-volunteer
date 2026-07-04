import { useLocation } from 'react-router-dom'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div
      key={location.pathname + location.search}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
    >
      {children}
    </div>
  )
}
