import { Outlet } from 'react-router-dom'

import { MobileNav } from '@/layouts/MobileNav'
import { PageTransition } from '@/components/PageTransition'
import { SiteHeader } from '@/layouts/SiteHeader'

export function AppLayout() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main className="px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 lg:px-5 lg:pb-5">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <MobileNav area="public" />
    </div>
  )
}
