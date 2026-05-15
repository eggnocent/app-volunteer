import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Migunani home">
      <span className="flex size-10 items-center justify-center rounded-md bg-primary font-heading text-xl font-extrabold text-primary-foreground shadow-sm">
        M
      </span>
      <span className="leading-none">
        <span className="block font-heading text-lg font-extrabold text-foreground">
          Migunani
        </span>
        <span className="block text-xs font-medium text-muted-foreground">
          Volunteer marketplace
        </span>
      </span>
    </Link>
  )
}
