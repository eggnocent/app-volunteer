import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EventCard, FilterBar, PageHeader } from '@/components'
import { events, getOrganizerById, volunteerProfile } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { getEventMatch } from '@/lib/match'
import { mapEvent, organizerApi, publicApi, volunteerApi } from '@/services/api'
import { useAuth } from '@/providers/useAuth'
import type { EventCategory, EventMode } from '@/types/migunani'

type EventsPageProps = {
  viewer?: 'public' | 'volunteer' | 'organizer'
}

type SortOption = 'relevant' | 'newest' | 'remaining' | 'match'

export function EventsPage({ viewer = 'public' }: EventsPageProps) {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'Semua'>(
    'Semua',
  )
  const [selectedMode, setSelectedMode] = useState<EventMode | 'Semua'>('Semua')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<SortOption>('relevant')
  const initialResource = useMemo(
    () => ({
      events,
      savedEventIds: volunteerProfile.savedEventIds,
    }),
    [],
  )
  const organizerId = user?.organizerId
  const loadEvents = useCallback(async () => {
    const apiEvents =
      viewer === 'organizer' && organizerId
        ? await organizerApi.getOrganizerEvents(organizerId)
        : await publicApi.getEvents()
    const mappedEvents = apiEvents.map(mapEvent)
    const savedEventIds =
      viewer === 'volunteer'
        ? (await volunteerApi.getSavedEvents()).map((event) => event.id)
        : mappedEvents
            .filter((event) => 'isSaved' in event && Boolean(event.isSaved))
            .map((event) => event.id)

    return {
      events: mappedEvents,
      savedEventIds,
    }
  }, [organizerId, viewer])
  const {
    data: resource,
    error: resourceError,
    isLoading,
  } = useAsyncResource(loadEvents, initialResource)
  const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({})
  const detailPathPrefix =
    viewer === 'volunteer'
      ? '/volunteer/events'
      : viewer === 'organizer'
        ? '/organizer/events'
        : '/events'

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return resource.events.filter((event) => {
      const organizer = getOrganizerById(event.organizerId)
      const matchesSearch =
        query.length === 0 ||
        [
          event.title,
          event.shortDescription,
          event.city,
          event.location,
          event.category,
          event.mode,
          organizer?.name ?? '',
          ...event.tags,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesCategory =
        selectedCategory === 'Semua' || event.category === selectedCategory
      const matchesMode = selectedMode === 'Semua' || event.mode === selectedMode

      return matchesSearch && matchesCategory && matchesMode
    })
  }, [resource.events, search, selectedCategory, selectedMode])

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sort === 'newest') {
        return b.date.localeCompare(a.date)
      }

      if (sort === 'remaining') {
        return b.quota - b.registered - (a.quota - a.registered)
      }

      if (sort === 'match') {
        return (
          getEventMatch(b, volunteerProfile).matchScore -
          getEventMatch(a, volunteerProfile).matchScore
        )
      }

      const aRelevant = Number(a.featured) * 20 + Number(a.status === 'Open') * 10
      const bRelevant = Number(b.featured) * 20 + Number(b.status === 'Open') * 10

      return bRelevant - aRelevant || a.date.localeCompare(b.date)
    })
  }, [filteredEvents, sort])

  async function toggleSaved(eventId: string) {
    const currentSaved = isEventSaved(eventId, resource.savedEventIds, savedOverrides)
    setSavedOverrides((current) => ({ ...current, [eventId]: !currentSaved }))

    try {
      if (currentSaved) {
        await volunteerApi.removeSavedEvent(eventId)
      } else {
        await volunteerApi.saveEvent(eventId)
      }
    } catch {
      setSavedOverrides((current) => ({ ...current, [eventId]: currentSaved }))
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Explore Events"
        title="Cari event volunteer yang cocok dengan waktu, minat, dan target kontribusimu."
        description="Gunakan filter kategori dan mode kegiatan untuk menemukan event yang paling relevan."
      />

      {isLoading ? (
        <ApiNotice message="Memuat event..." tone="loading" />
      ) : null}
      {resourceError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${resourceError}`}
          tone="error"
        />
      ) : null}

      <FilterBar
        search={search}
        selectedCategory={selectedCategory}
        selectedMode={selectedMode}
        view={view}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategory}
        onModeChange={setSelectedMode}
        onViewChange={setView}
      />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Menampilkan <span className="text-foreground">{sortedEvents.length}</span>{' '}
          dari {resource.events.length} event
        </p>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="h-10 w-fit rounded-md border bg-card px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="relevant">Paling relevan</option>
          <option value="newest">Terbaru</option>
          <option value="remaining">Kuota tersisa</option>
          {viewer === 'volunteer' ? (
            <option value="match">Match tertinggi</option>
          ) : null}
        </select>
      </div>

      {sortedEvents.length > 0 ? (
        <section
          className={
            view === 'grid'
              ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
              : 'grid gap-5'
          }
        >
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
              saved={isEventSaved(event.id, resource.savedEventIds, savedOverrides)}
              onSavedChange={viewer === 'volunteer' ? toggleSaved : undefined}
              detailPathPrefix={detailPathPrefix}
              variant={view}
              {...(viewer === 'volunteer'
                ? getEventMatch(event, volunteerProfile)
                : {})}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-extrabold">Event tidak ditemukan.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba ubah kata kunci, kategori, atau mode kegiatan.
          </p>
        </section>
      )}
    </div>
  )
}

function isEventSaved(
  eventId: string,
  savedEventIds: string[],
  overrides: Record<string, boolean>,
) {
  return overrides[eventId] ?? savedEventIds.includes(eventId)
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
