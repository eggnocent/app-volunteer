import {
  Building2,
  CalendarPlus,
  FileCheck,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/useAuth'
import type { UserRole } from '@/types/migunani'
import type { LucideIcon } from 'lucide-react'

type MobileNavProps = {
  area: 'public' | 'admin' | 'volunteer' | 'organizer'
}

type MobileNavItem = {
  label: string
  to: string
  icon: LucideIcon
  logout?: boolean
}

const publicItems: MobileNavItem[] = [
  { label: 'Beranda', to: '/home', icon: Home },
  { label: 'Event', to: '/events', icon: Search },
  { label: 'Masuk', to: '/', icon: LogIn },
  { label: 'Daftar', to: '/register', icon: UserPlus },
]

const volunteerItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/volunteer/dashboard', icon: Home },
  { label: 'Event', to: '/volunteer/events', icon: Search },
  {
    label: 'Aplikasi',
    to: '/volunteer/dashboard?tab=applications',
    icon: LayoutDashboard,
  },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

const organizerItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/organizer/dashboard', icon: Home },
  { label: 'Pendaftar', to: '/organizer/applicants', icon: LayoutDashboard },
  { label: 'Sertifikat', to: '/organizer/certificates', icon: FileCheck },
  { label: 'Buat', to: '/organizer/create', icon: CalendarPlus },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

const adminItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/portal/dashboard', icon: Home },
  { label: 'Pengguna', to: '/portal/users', icon: Users },
  { label: 'Event', to: '/portal/events', icon: CalendarPlus },
  { label: 'Organizers', to: '/portal/organizers', icon: Building2 },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

export function MobileNav({ area }: MobileNavProps) {
  const navigate = useNavigate()
  const { logout, status, user } = useAuth()
  const publicSessionItems: MobileNavItem[] =
    status === 'authenticated' && user
      ? [
          { label: 'Beranda', to: '/home', icon: Home },
          {
            label: 'Event',
            to: getRoleEvents(user.role),
            icon: Search,
          },
          { label: 'Dashboard', to: getRoleHome(user.role), icon: LayoutDashboard },
          { label: 'Logout', to: '/', icon: LogOut, logout: true },
        ]
      : publicItems
  const mobileItems =
    area === 'admin'
      ? adminItems
      : area === 'public'
        ? publicSessionItems
        : area === 'volunteer'
          ? volunteerItems
          : organizerItems

  return (
    <nav
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 grid rounded-lg border bg-card/95 p-1 shadow-lg backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}
      aria-label="Mobile navigation"
    >
      {mobileItems.map((item) =>
        item.logout ? (
          <button
            key={`${area}-${item.label}`}
            type="button"
            disabled={status === 'loading'}
            onClick={async () => {
              try {
                await logout()
              } finally {
                navigate('/', { replace: true })
              }
            }}
            className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          >
            <item.icon size={17} />
            <span className="max-w-full truncate">{item.label}</span>
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition',
                'min-w-0 px-1',
                isActive && 'bg-primary text-primary-foreground',
              )
            }
          >
            <item.icon size={17} />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ),
      )}
    </nav>
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
