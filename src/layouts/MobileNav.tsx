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
  { label: 'Home', to: '/home', icon: Home },
  { label: 'Explore', to: '/events', icon: Search },
  { label: 'Masuk', to: '/', icon: LogIn },
  { label: 'Daftar', to: '/register', icon: UserPlus },
]

const volunteerItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/volunteer/dashboard', icon: Home },
  { label: 'Explore', to: '/volunteer/events', icon: Search },
  {
    label: 'Apps',
    to: '/volunteer/dashboard?tab=applications',
    icon: LayoutDashboard,
  },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

const organizerItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/organizer/dashboard', icon: Home },
  { label: 'Applicants', to: '/organizer/applicants', icon: LayoutDashboard },
  { label: 'Certs', to: '/organizer/certificates', icon: FileCheck },
  { label: 'Create', to: '/organizer/create', icon: CalendarPlus },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

const adminItems: MobileNavItem[] = [
  { label: 'Dashboard', to: '/portal/dashboard', icon: Home },
  { label: 'Users', to: '/portal/users', icon: Users },
  { label: 'Events', to: '/portal/events', icon: CalendarPlus },
  { label: 'Organizers', to: '/portal/organizers', icon: Building2 },
  { label: 'Logout', to: '/', icon: LogOut, logout: true },
]

export function MobileNav({ area }: MobileNavProps) {
  const navigate = useNavigate()
  const { logout, status } = useAuth()
  const mobileItems =
    area === 'admin'
      ? adminItems
      : area === 'public'
        ? publicItems
        : area === 'volunteer'
          ? volunteerItems
          : organizerItems

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 grid rounded-lg border bg-card/95 p-1 shadow-lg backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}
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
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition',
                isActive && 'bg-primary text-primary-foreground',
              )
            }
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ),
      )}
    </nav>
  )
}
