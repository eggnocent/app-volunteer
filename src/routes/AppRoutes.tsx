import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ApplyPage } from '@/pages/ApplyPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { HomePage } from '@/pages/HomePage'
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
        <Route path="apply/:eventId" element={<ApplyPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<VolunteerDashboardPage />} />
        <Route path="organizer" element={<OrganizerDashboardPage />} />
        <Route path="organizer/create" element={<CreateEventPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
