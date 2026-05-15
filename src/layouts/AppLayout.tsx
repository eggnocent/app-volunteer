import { Outlet } from 'react-router-dom'

import { MobileNav } from '@/layouts/MobileNav'
import { SiteHeader } from '@/layouts/SiteHeader'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
