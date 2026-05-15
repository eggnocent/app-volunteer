import { ArrowRight, LogIn, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Logo } from '@/layouts/Logo'
import { cn } from '@/lib/utils'

const publicNavItems = [
  { label: 'Discover', to: '/' },
  { label: 'Explore Events', to: '/events' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-4 lg:px-5">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink
            to="/events"
            className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            <Search size={16} />
            Cari event
          </NavLink>
          <NavLink
            to="/login"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-deep-green"
          >
            <LogIn size={16} />
            Masuk
            <ArrowRight size={16} />
          </NavLink>
        </div>

        <NavLink
          to="/login"
          className="inline-flex size-10 items-center justify-center rounded-md border bg-card text-foreground shadow-sm md:hidden"
          aria-label="Open login"
        >
          <LogIn size={18} />
        </NavLink>
      </div>
    </header>
  )
}
