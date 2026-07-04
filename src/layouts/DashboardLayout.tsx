import { Outlet } from 'react-router-dom'

import { NotificationCenter } from '@/components/NotificationCenter'
import { PageTransition } from '@/components/PageTransition'
import { DashboardSidebar } from '@/layouts/DashboardSidebar'
import { MobileNav } from '@/layouts/MobileNav'

type DashboardLayoutProps = {
  area: 'admin' | 'volunteer' | 'organizer'
}

export function DashboardLayout({ area }: DashboardLayoutProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex w-full gap-4 px-3 py-3 sm:px-4 lg:gap-5 lg:px-5">
        <DashboardSidebar area={area} />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <div className="mb-4 flex justify-end">
            <NotificationCenter area={area} />
          </div>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav area={area} />
    </div>
  )
}
