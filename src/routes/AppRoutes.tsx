import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminEventsPage } from '@/pages/AdminEventsPage'
import { AdminOrganizersPage } from '@/pages/AdminOrganizersPage'
import { AdminPortalPage } from '@/pages/AdminPortalPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { ApplyPage } from '@/pages/ApplyPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrganizerApplicantsPage } from '@/pages/OrganizerApplicantsPage'
import { OrganizerDashboardPage } from '@/pages/OrganizerDashboardPage'
import { OrganizerLoginPage } from '@/pages/OrganizerLoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { VolunteerDashboardPage } from '@/pages/VolunteerDashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:slug" element={<EventDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage role="volunteer" />} />
        <Route path="organizer" element={<OrganizerLoginPage />} />
        <Route
          path="organizer/register"
          element={<RegisterPage role="organizer" />}
        />
        <Route path="portal" element={<AdminPortalPage />} />
      </Route>

      {/* Super Admin area — /portal/* */}
      <Route element={<DashboardLayout area="admin" />}>
        <Route path="portal/dashboard" element={<AdminDashboardPage />} />
        <Route path="portal/users" element={<AdminUsersPage />} />
        <Route path="portal/events" element={<AdminEventsPage />} />
        <Route path="portal/organizers" element={<AdminOrganizersPage />} />
      </Route>

      {/* Volunteer area — /volunteer/* */}
      <Route element={<DashboardLayout area="volunteer" />}>
        <Route path="volunteer/dashboard" element={<VolunteerDashboardPage />} />
        <Route path="volunteer/events" element={<EventsPage viewer="volunteer" />} />
        <Route path="volunteer/apply/:eventId" element={<ApplyPage />} />
        <Route
          path="volunteer/events/:slug"
          element={<EventDetailPage viewer="volunteer" />}
        />
      </Route>

      {/* Organizer area — /organizer/* */}
      <Route element={<DashboardLayout area="organizer" />}>
        <Route path="organizer/dashboard" element={<OrganizerDashboardPage />} />
        <Route path="organizer/applicants" element={<OrganizerApplicantsPage />} />
        <Route path="organizer/events" element={<EventsPage viewer="organizer" />} />
        <Route
          path="organizer/events/:slug"
          element={<EventDetailPage viewer="organizer" />}
        />
        <Route path="organizer/create" element={<CreateEventPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
