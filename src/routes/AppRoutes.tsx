import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminEventsPage } from '@/pages/AdminEventsPage'
import { AdminOrganizersPage } from '@/pages/AdminOrganizersPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { ApplyPage } from '@/pages/ApplyPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrganizerApplicantsPage } from '@/pages/OrganizerApplicantsPage'
import { OrganizerCertificatesPage } from '@/pages/OrganizerCertificatesPage'
import { OrganizerDashboardPage } from '@/pages/OrganizerDashboardPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { VolunteerDashboardPage } from '@/pages/VolunteerDashboardPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<AppLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:slug" element={<EventDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage role="volunteer" />} />
        <Route
          path="organizer"
          element={<Navigate to="/?next=%2Forganizer%2Fdashboard" replace />}
        />
        <Route
          path="organizer/register"
          element={<RegisterPage role="organizer" />}
        />
        <Route
          path="portal"
          element={<Navigate to="/?next=%2Fportal%2Fdashboard" replace />}
        />
      </Route>

      {/* Super Admin area — /portal/* */}
      <Route
        element={
          <ProtectedRoute roles={['admin']} loginPath="/">
            <DashboardLayout area="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="portal/dashboard" element={<AdminDashboardPage />} />
        <Route path="portal/users" element={<AdminUsersPage />} />
        <Route path="portal/events" element={<AdminEventsPage />} />
        <Route path="portal/organizers" element={<AdminOrganizersPage />} />
      </Route>

      {/* Volunteer area — /volunteer/* */}
      <Route
        element={
          <ProtectedRoute roles={['volunteer']} loginPath="/">
            <DashboardLayout area="volunteer" />
          </ProtectedRoute>
        }
      >
        <Route path="volunteer/dashboard" element={<VolunteerDashboardPage />} />
        <Route path="volunteer/events" element={<EventsPage viewer="volunteer" />} />
        <Route path="volunteer/apply/:eventId" element={<ApplyPage />} />
        <Route
          path="volunteer/events/:slug"
          element={<EventDetailPage viewer="volunteer" />}
        />
      </Route>

      {/* Organizer area — /organizer/* */}
      <Route
        element={
          <ProtectedRoute roles={['organizer']} loginPath="/">
            <DashboardLayout area="organizer" />
          </ProtectedRoute>
        }
      >
        <Route path="organizer/dashboard" element={<OrganizerDashboardPage />} />
        <Route path="organizer/applicants" element={<OrganizerApplicantsPage />} />
        <Route path="organizer/certificates" element={<OrganizerCertificatesPage />} />
        <Route path="organizer/events" element={<EventsPage viewer="organizer" />} />
        <Route
          path="organizer/events/:slug"
          element={<EventDetailPage viewer="organizer" />}
        />
        <Route path="organizer/create" element={<CreateEventPage />} />
        <Route path="organizer/events/:eventId/edit" element={<CreateEventPage pageMode="edit" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
