import {
  BadgeCheck,
  BarChart3,
  CalendarPlus,
  Home,
  LayoutDashboard,
  ListChecks,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Logo } from '@/layouts/Logo'
import { cn } from '@/lib/utils'

const volunteerItems = [
  { label: 'Discover', to: '/', icon: Home },
  { label: 'My Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', to: '/dashboard?tab=applications', icon: ListChecks },
  { label: 'Certificates', to: '/dashboard?tab=certificates', icon: BadgeCheck },
]

const organizerItems = [
  { label: 'Organizer', to: '/organizer', icon: BarChart3 },
  { label: 'Create Event', to: '/organizer/create', icon: CalendarPlus },
]

export function DashboardSidebar() {
  return (
    <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-72 shrink-0 rounded-lg border bg-card p-4 shadow-sm lg:flex lg:flex-col">
      <Logo />

      <div className="mt-8 space-y-6">
        <SidebarGroup label="Volunteer" items={volunteerItems} />
        <SidebarGroup label="Organizer" items={organizerItems} />
      </div>
    </aside>
  )
}

type SidebarGroupProps = {
  label: string
  items: typeof volunteerItems
}

function SidebarGroup({ label, items }: SidebarGroupProps) {
  return (
    <div>
      <p className="px-3 text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <nav className="mt-2 space-y-1" aria-label={`${label} navigation`}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={!item.to.includes('?') && item.to !== '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
