import {
  CalendarDays,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  OrganizerEventRow,
  PageHeader,
  StatsCard,
} from '@/components'
import { events } from '@/data'
import type { EventCategory, EventStatus } from '@/types/migunani'

type CategoryFilter = EventCategory | 'Semua'
type StatusFilterType = EventStatus | 'Semua'

export function AdminEventsPage() {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Semua')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('Semua')

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return events.filter((event) => {
      const matchesCategory =
        categoryFilter === 'Semua' || event.category === categoryFilter
      const matchesStatus =
        statusFilter === 'Semua' || event.status === statusFilter

      const matchesQuery =
        !normalizedQuery ||
        [event.title, event.city, event.location, event.category, event.mode]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesStatus && matchesQuery
    })
  }, [query, categoryFilter, statusFilter])

  const openCount = events.filter((e) => e.status === 'Open').length
  const nearlyFullCount = events.filter((e) => e.status === 'Nearly Full').length
  const closedCount = events.filter((e) => e.status === 'Closed').length

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin / Events"
        title="Kelola semua event di platform."
        description="Pantau, review, dan kelola seluruh event volunteer yang dipublikasikan oleh organizer di Migunani."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Event aktif"
          value={openCount.toString()}
          helper="menerima pendaftaran"
          icon={CalendarDays}
          tone="green"
        />
        <StatsCard
          label="Hampir penuh"
          value={nearlyFullCount.toString()}
          helper="kuota hampir habis"
          icon={CheckCircle2}
          tone="yellow"
        />
        <StatsCard
          label="Ditutup"
          value={closedCount.toString()}
          helper="pendaftaran selesai"
          icon={Lock}
          tone="dark"
        />
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari event, kota, lokasi..."
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="Semua">Semua kategori</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Lingkungan">Lingkungan</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Sosial">Sosial</option>
            <option value="Bencana">Bencana</option>
            <option value="Literasi">Literasi</option>
            <option value="Komunitas">Komunitas</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="Semua">Semua status</option>
            <option value="Open">Open</option>
            <option value="Nearly Full">Nearly Full</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </section>

      <p className="text-sm font-semibold text-muted-foreground">
        Menampilkan <span className="text-foreground">{filteredEvents.length}</span>{' '}
        dari {events.length} event
      </p>

      <section className="grid gap-4">
        {filteredEvents.map((event) => (
          <OrganizerEventRow
            key={event.id}
            event={event}
            detailPathPrefix="/portal/events"
          />
        ))}
      </section>

      {filteredEvents.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-extrabold">Event tidak ditemukan.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba ubah filter kategori, status, atau kata kunci pencarian.
          </p>
        </section>
      ) : null}
    </div>
  )
}
