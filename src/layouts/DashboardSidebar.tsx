import {
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarPlus,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Logo } from '@/layouts/Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/useAuth'

const volunteerItems = [
  { label: 'Dashboard Saya', to: '/volunteer/dashboard', icon: LayoutDashboard },
  {
    label: 'Aplikasi Saya',
    to: '/volunteer/dashboard?tab=applications',
    icon: ListChecks,
  },
  {
    label: 'Sertifikat',
    to: '/volunteer/dashboard?tab=certificates',
    icon: BadgeCheck,
  },
  { label: 'Jelajahi Event', to: '/volunteer/events', icon: Home },
]

const organizerItems = [
  { label: 'Dashboard', to: '/organizer/dashboard', icon: BarChart3 },
  { label: 'Applicants', to: '/organizer/applicants', icon: ListChecks },
  { label: 'Certificates', to: '/organizer/certificates', icon: BadgeCheck },
  { label: 'Explore Events', to: '/organizer/events', icon: Home },
  { label: 'Create Event', to: '/organizer/create', icon: CalendarPlus },
]

const adminItems = [
  { label: 'Dashboard', to: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/portal/users', icon: Users },
  { label: 'Events', to: '/portal/events', icon: CalendarPlus },
  { label: 'Organizers', to: '/portal/organizers', icon: Building2 },
]

type DashboardSidebarProps = {
  area: 'admin' | 'volunteer' | 'organizer'
}

export function DashboardSidebar({ area }: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { logout, status } = useAuth()
  const items =
    area === 'admin'
      ? adminItems
      : area === 'volunteer'
        ? volunteerItems
        : organizerItems

  return (
    <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-72 shrink-0 rounded-lg border bg-card p-4 shadow-sm lg:flex lg:flex-col">
      <Logo to={area === 'admin' ? '/portal/dashboard' : area === 'volunteer' ? '/volunteer/dashboard' : '/organizer/dashboard'} />

      <div className="mt-8 space-y-6">
        <SidebarGroup label={area === 'admin' ? 'Super Admin' : area === 'volunteer' ? 'Volunteer' : 'Organizer'} items={items} />
      </div>
      <button
        type="button"
        disabled={status === 'loading'}
        onClick={async () => {
          try {
            await logout()
          } finally {
            navigate('/', { replace: true })
          }
        }}
        className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={17} />
        Keluar
      </button>
    </aside>
  )
}

type SidebarGroupProps = {
  label: string
  items: typeof volunteerItems
}

function SidebarGroup({ label, items }: SidebarGroupProps) {
  const location = useLocation()

  return (
    <div>
      <p className="px-3 text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <nav className="mt-2 space-y-1" aria-label={`${label} navigation`}>
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
              isSidebarItemActive(item.to, location.pathname, location.search) &&
                'bg-accent text-accent-foreground',
            )}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function isSidebarItemActive(to: string, pathname: string, search: string) {
  const [toPath, toSearch = ''] = to.split('?')

  if (to === '/') {
    return pathname === '/'
  }

  if (toSearch) {
    return pathname === toPath && search === `?${toSearch}`
  }

  return pathname === toPath && search === ''
}
