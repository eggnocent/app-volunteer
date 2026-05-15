import { CalendarPlus, Compass, Home, LayoutDashboard, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const mobileItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Explore', to: '/events', icon: Search },
  { label: 'Volunteer', to: '/volunteer/dashboard', icon: LayoutDashboard },
  { label: 'Organizer', to: '/organizer', icon: Compass },
  { label: 'Create', to: '/organizer/create', icon: CalendarPlus },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-lg border bg-card/95 p-1 shadow-lg backdrop-blur lg:hidden">
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
