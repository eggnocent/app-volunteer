import {
  CalendarDays,
  CheckCircle2,
  Lock,
  Search,
  Users,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import {
  CategoryChip,
  ConfirmDialog,
  PageHeader,
  StatsCard,
  StatusBadge,
} from '@/components'
import { events } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import {
  eventStatusOptions,
  getEventModeLabel,
  getEventStatusLabel,
} from '@/lib/display-labels'
import { formatDate, getFillPercentage } from '@/lib/format'
import { adminApi, mapEvent } from '@/services/api'
import type { EventCategory, EventStatus } from '@/types/migunani'

type CategoryFilter = EventCategory | 'Semua'
type StatusFilterType = EventStatus | 'Semua'
type PendingEventStatusChange = {
  eventId: string
  eventTitle: string
  status: EventStatus
}

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
  const [pendingEventIds, setPendingEventIds] = useState<string[]>([])
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingEventStatusChange | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
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

    setActionError(null)
    setPendingEventIds((current) =>
      current.includes(eventId) ? current : [...current, eventId],
    )
    setEventOverrides((current) => upsertEvent(current, { ...baseEvent, status }))

    try {
      const updatedEvent = mapEvent(await adminApi.updateEventStatus(eventId, status))
      setEventOverrides((current) => upsertEvent(current, updatedEvent))
      void reload()
    } catch (error) {
      setEventOverrides(previousOverrides)
      setActionError(getErrorMessage(error))
    } finally {
      setPendingEventIds((current) => current.filter((id) => id !== eventId))
      setPendingStatusChange(null)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin platform"
        title="Kelola event"
        description="Pantau kategori, keterisian, dan status publikasi event dari satu daftar kerja."
      />

      {isLoading ? (
        <ApiNotice message="Memuat daftar event..." tone="loading" />
      ) : null}
      {eventsError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${eventsError}`}
          tone="error"
        />
      ) : null}
      {actionError ? (
        <ApiNotice message={actionError} tone="error" />
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
            {eventStatusOptions.map((status) => (
              <option key={status} value={status}>
                {getEventStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <p className="text-sm font-semibold text-muted-foreground">
        <span className="text-foreground">{filteredEvents.length}</span> dari{' '}
        {visibleEvents.length} event ditampilkan
      </p>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1fr_140px_140px_150px_150px]">
          <span>Event</span>
          <span className="hidden lg:block">Kategori</span>
          <span className="hidden lg:block">Jadwal</span>
          <span className="hidden lg:block">Keterisian</span>
          <span>Status</span>
        </div>
        <div className="divide-y">
          {filteredEvents.map((event) => {
            const isPending = pendingEventIds.includes(event.id)
            const fill = getFillPercentage(event.registered, event.quota)

            return (
              <article
                key={event.id}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_140px_140px_150px_150px] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground lg:hidden">
                      {event.category}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate font-heading text-base font-extrabold text-foreground">
                    {event.title}
                  </h2>
                  <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">
                    {event.city} · {getEventModeLabel(event.mode)}
                  </p>
                </div>
                <span className="hidden lg:block">
                  <CategoryChip category={event.category} />
                </span>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {formatDate(event.date)}
                </span>
                <div className="hidden min-w-0 lg:block">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users size={13} className="text-primary" />
                      {event.registered}/{event.quota}
                    </span>
                    <span>{fill}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
                  </div>
                </div>
                <select
                  value={event.status}
                  disabled={isPending}
                  onChange={(selectEvent) =>
                    setPendingStatusChange({
                      eventId: event.id,
                      eventTitle: event.title,
                      status: selectEvent.target.value as EventStatus,
                    })
                  }
                  className="h-9 rounded-md border bg-background px-2 text-xs font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {eventStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getEventStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </article>
            )
          })}
        </div>
      </section>

      {filteredEvents.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-extrabold">Event tidak ditemukan.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba ubah filter kategori, status, atau kata kunci pencarian.
          </p>
        </section>
      ) : null}

      {pendingStatusChange ? (
        <ConfirmDialog
          tone={pendingStatusChange.status === 'Closed' ? 'danger' : 'default'}
          title="Ubah status event?"
          description={`${pendingStatusChange.eventTitle} akan diubah menjadi ${getEventStatusLabel(pendingStatusChange.status)}. Perubahan ini memengaruhi visibilitas dan pendaftaran relawan.`}
          confirmLabel="Ubah status"
          isPending={pendingEventIds.includes(pendingStatusChange.eventId)}
          onCancel={() => setPendingStatusChange(null)}
          onConfirm={() =>
            void updateStatus(pendingStatusChange.eventId, pendingStatusChange.status)
          }
        />
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Status event belum bisa diperbarui.'
}
