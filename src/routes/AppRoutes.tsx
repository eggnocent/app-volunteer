import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ApplyPage } from '@/pages/ApplyPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrganizerDashboardPage } from '@/pages/OrganizerDashboardPage'
import { VolunteerDashboardPage } from '@/pages/VolunteerDashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:slug" element={<EventDetailPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<DashboardLayout area="volunteer" />}>
        <Route path="volunteer/dashboard" element={<VolunteerDashboardPage />} />
        <Route path="volunteer/apply/:eventId" element={<ApplyPage />} />
      </Route>

      <Route element={<DashboardLayout area="organizer" />}>
        <Route path="organizer" element={<OrganizerDashboardPage />} />
        <Route path="organizer/create" element={<CreateEventPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
