import { Outlet } from 'react-router-dom'

import { DashboardSidebar } from '@/layouts/DashboardSidebar'
import { MobileNav } from '@/layouts/MobileNav'

export function DashboardLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
