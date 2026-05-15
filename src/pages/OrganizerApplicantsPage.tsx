import { CalendarDays, CheckCircle2, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CategoryChip, PageHeader, StatsCard, StatusBadge } from '@/components'
import {
  getEventById,
  volunteerApplications,
  volunteerProfile,
} from '@/data'
import { formatDate } from '@/lib/format'

export function OrganizerApplicantsPage() {
  const [searchParams] = useSearchParams()
  const focusedEventId = searchParams.get('event')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return volunteerApplications
      .map((application) => ({
        application,
        event: getEventById(application.eventId),
      }))
      .filter(({ event }) => !focusedEventId || event?.id === focusedEventId)
      .filter(({ application, event }) => {
        if (!normalizedQuery) {
          return true
        }

        return [
          volunteerProfile.name,
          volunteerProfile.university,
          volunteerProfile.major,
          application.role,
          application.status,
          event?.title ?? '',
          event?.category ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
  }, [focusedEventId, query])

  const focusedEvent = focusedEventId ? getEventById(focusedEventId) : undefined
  const acceptedCount = rows.filter(({ application }) => application.status === 'Accepted').length
  const submittedCount = rows.filter(
    ({ application }) => application.status === 'Submitted',
  ).length

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Organizer Applicants"
        title="Kelola daftar applicant relawan."
        description={
          focusedEvent
            ? `Menampilkan applicant untuk ${focusedEvent.title}.`
            : 'Pantau pendaftar, role, status, dan event yang mereka pilih dalam satu tabel.'
        }
        action={
          <Link
            to="/organizer/create"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Buat event baru
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Total applicant"
          value={rows.length.toString()}
          helper="sesuai filter saat ini"
          icon={Users}
          tone="green"
        />
        <StatsCard
          label="Accepted"
          value={acceptedCount.toString()}
          helper="siap briefing"
          icon={CheckCircle2}
          tone="yellow"
        />
        <StatsCard
          label="Submitted"
          value={submittedCount.toString()}
          helper="perlu review"
          icon={CalendarDays}
          tone="dark"
        />
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, role, status, atau event"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <select className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
            <option>Semua status</option>
            <option>Submitted</option>
            <option>Accepted</option>
            <option>Completed</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1fr_1fr_180px_140px_130px]">
          <span>Applicant</span>
          <span className="hidden lg:block">Event</span>
          <span className="hidden lg:block">Role</span>
          <span className="hidden lg:block">Submitted</span>
          <span>Status</span>
        </div>
        <div className="divide-y">
          {rows.map(({ application, event }) => (
            <article
              key={application.id}
              className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_1fr_180px_140px_130px] lg:items-center"
            >
              <div className="min-w-0">
                <p className="font-heading text-base font-extrabold">
                  {volunteerProfile.name}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {volunteerProfile.major} · {volunteerProfile.university}
                </p>
              </div>
              <div className="hidden min-w-0 lg:block">
                <Link
                  to={event ? `/organizer/events/${event.slug}` : '/organizer/events'}
                  className="truncate font-bold text-foreground transition hover:text-primary"
                >
                  {event?.title ?? 'Event Migunani'}
                </Link>
                <div className="mt-1">
                  {event ? <CategoryChip category={event.category} /> : null}
                </div>
              </div>
              <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                {application.role}
              </span>
              <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                {formatDate(application.submittedAt)}
              </span>
              <StatusBadge status={application.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
