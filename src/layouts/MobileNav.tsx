import {
  Building2,
  CalendarPlus,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

type MobileNavProps = {
  area: 'public' | 'admin' | 'volunteer' | 'organizer'
}

const publicItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Explore', to: '/events', icon: Search },
  { label: 'Masuk', to: '/login', icon: LogIn },
  { label: 'Daftar', to: '/register', icon: UserPlus },
]

const volunteerItems = [
  { label: 'Dashboard', to: '/volunteer/dashboard', icon: Home },
  { label: 'Explore', to: '/volunteer/events', icon: Search },
  {
    label: 'Apps',
    to: '/volunteer/dashboard?tab=applications',
    icon: LayoutDashboard,
  },
  { label: 'Logout', to: '/', icon: LogOut },
]

const organizerItems = [
  { label: 'Dashboard', to: '/organizer/dashboard', icon: Home },
  { label: 'Applicants', to: '/organizer/applicants', icon: LayoutDashboard },
  { label: 'Explore', to: '/organizer/events', icon: Search },
  { label: 'Create', to: '/organizer/create', icon: CalendarPlus },
  { label: 'Logout', to: '/', icon: LogOut },
]

const adminItems = [
  { label: 'Dashboard', to: '/portal/dashboard', icon: Home },
  { label: 'Users', to: '/portal/users', icon: Users },
  { label: 'Events', to: '/portal/events', icon: CalendarPlus },
  { label: 'Organizers', to: '/portal/organizers', icon: Building2 },
  { label: 'Logout', to: '/', icon: LogOut },
]

export function MobileNav({ area }: MobileNavProps) {
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
      {mobileItems.map((item) => (
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
      ))}
    </nav>
  )
}
