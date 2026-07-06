import { ArrowRight, LayoutDashboard, LogIn, LogOut, Search, UserPlus } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Logo } from '@/layouts/Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/useAuth'
import type { UserRole } from '@/types/migunani'

export function SiteHeader() {
  const navigate = useNavigate()
  const { logout, refresh, status, user } = useAuth()
  const isSessionBusy = status === 'loading'
  const isAuthenticated = status === 'authenticated' && user
  const dashboardHref = user ? getRoleHome(user.role) : '/'
  const eventsHref = user ? getRoleEvents(user.role) : '/events'
  const navItems = [
    { label: 'Discover', to: '/home' },
    { label: 'Explore Events', to: eventsHref },
  ]

  useEffect(() => {
    if (status === 'idle') {
      void refresh()
    }
  }, [refresh, status])

  return (
    <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-4 lg:px-5">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
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
            to={eventsHref}
            className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            <Search size={16} />
            Cari event
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to={dashboardHref}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-deep-green"
              >
                <LayoutDashboard size={16} />
                Dashboard
                <ArrowRight size={16} />
              </NavLink>
              <button
                type="button"
                disabled={isSessionBusy}
                onClick={async () => {
                  try {
                    await logout()
                  } finally {
                    navigate('/', { replace: true })
                  }
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
              >
                <LogIn size={16} />
                Masuk
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-deep-green"
              >
                <UserPlus size={16} />
                Daftar
                <ArrowRight size={16} />
              </NavLink>
            </>
          )}
        </div>

        <NavLink
          to={isAuthenticated ? dashboardHref : '/'}
          className="inline-flex size-10 items-center justify-center rounded-md border bg-card text-foreground shadow-sm md:hidden"
          aria-label={isAuthenticated ? 'Open dashboard' : 'Open login'}
        >
          {isAuthenticated ? <LayoutDashboard size={18} /> : <LogIn size={18} />}
        </NavLink>
      </div>
    </header>
  )
}

function getRoleEvents(role: UserRole) {
  if (role === 'admin') {
    return '/portal/events'
  }

  if (role === 'organizer') {
    return '/organizer/events'
  }

  return '/volunteer/events'
}

function getRoleHome(role: UserRole) {
  if (role === 'admin') {
    return '/portal/dashboard'
  }

  if (role === 'organizer') {
    return '/organizer/dashboard'
  }

  return '/volunteer/dashboard'
}
