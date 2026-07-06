import {
  CalendarDays,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import {
  OrganizerEventRow,
  PageHeader,
  StatsCard,
} from '@/components'
import { events } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { adminApi, mapEvent } from '@/services/api'
import type { EventCategory, EventStatus } from '@/types/migunani'

type CategoryFilter = EventCategory | 'Semua'
type StatusFilterType = EventStatus | 'Semua'

export function AdminEventsPage() {
  const loadEvents = useCallback(async () => {
    return (await adminApi.getAdminEvents()).map(mapEvent)
  }, [])
  const {
    data: adminEvents,
    error: eventsError,
    isLoading,
    reload,
  } = useAsyncResource(loadEvents, events)
  const [eventOverrides, setEventOverrides] = useState<typeof events>([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Semua')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('Semua')
  const visibleEvents = getVisibleEvents(adminEvents, eventOverrides)

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return visibleEvents.filter((event) => {
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
  }, [categoryFilter, query, statusFilter, visibleEvents])

  const openCount = visibleEvents.filter((e) => e.status === 'Open').length
  const nearlyFullCount = visibleEvents.filter((e) => e.status === 'Nearly Full').length
  const closedCount = visibleEvents.filter((e) => e.status === 'Closed').length

  async function updateStatus(eventId: string, status: EventStatus) {
    const previousOverrides = eventOverrides
    const baseEvent = visibleEvents.find((event) => event.id === eventId)

    if (!baseEvent) {
      return
    }

    setEventOverrides((current) => upsertEvent(current, { ...baseEvent, status }))

    try {
      const updatedEvent = mapEvent(await adminApi.updateEventStatus(eventId, status))
      setEventOverrides((current) => upsertEvent(current, updatedEvent))
      void reload()
    } catch {
      setEventOverrides(previousOverrides)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin / Events"
        title="Kelola semua event di platform."
        description="Pantau, review, dan kelola seluruh event volunteer yang dipublikasikan oleh organizer di Migunani."
      />

      {isLoading ? (
        <ApiNotice message="Memuat event admin..." tone="loading" />
      ) : null}
      {eventsError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${eventsError}`}
          tone="error"
        />
      ) : null}

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
        dari {visibleEvents.length} event
      </p>

      <section className="grid gap-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="space-y-2">
            <OrganizerEventRow event={event} detailPathPrefix="/portal/events" />
            <select
              value={event.status}
              onChange={(selectEvent) =>
                void updateStatus(event.id, selectEvent.target.value as EventStatus)
              }
              className="h-10 w-fit rounded-md border bg-background px-3 text-xs font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="Open">Open</option>
              <option value="Nearly Full">Nearly Full</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
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

function getVisibleEvents(
  adminEvents: typeof events,
  overrides: typeof events,
) {
  const overrideMap = new Map(overrides.map((event) => [event.id, event]))

  return adminEvents.map((event) => overrideMap.get(event.id) ?? event)
}

function upsertEvent(
  currentEvents: typeof events,
  nextEvent: (typeof events)[number],
) {
  const hasEvent = currentEvents.some((event) => event.id === nextEvent.id)

  return hasEvent
    ? currentEvents.map((event) => (event.id === nextEvent.id ? nextEvent : event))
    : [...currentEvents, nextEvent]
}

function ApiNotice({
  tone,
  message,
}: {
  tone: 'loading' | 'error'
  message: string
}) {
  return (
    <div
      className={
        tone === 'loading'
          ? 'rounded-lg border bg-accent p-3 text-sm font-semibold text-accent-foreground'
          : 'rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive'
      }
    >
      {message}
    </div>
  )
}
