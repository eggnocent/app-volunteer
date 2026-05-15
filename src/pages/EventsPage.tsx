import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EventCard, FilterBar, PageHeader } from '@/components'
import { events, getOrganizerById, volunteerProfile } from '@/data'
import type { EventCategory, EventMode } from '@/types/migunani'

type EventsPageProps = {
  viewer?: 'public' | 'volunteer' | 'organizer'
}

export function EventsPage({ viewer = 'public' }: EventsPageProps) {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'Semua'>(
    'Semua',
  )
  const [selectedMode, setSelectedMode] = useState<EventMode | 'Semua'>('Semua')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [savedEventIds, setSavedEventIds] = useState<string[]>(
    volunteerProfile.savedEventIds,
  )
  const detailPathPrefix =
    viewer === 'volunteer'
      ? '/volunteer/events'
      : viewer === 'organizer'
        ? '/organizer/events'
        : '/events'

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return events.filter((event) => {
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
  }, [search, selectedCategory, selectedMode])

  function toggleSaved(eventId: string) {
    setSavedEventIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Explore Events"
        title="Cari event volunteer yang cocok dengan waktu, minat, dan target kontribusimu."
        description="Gunakan filter kategori dan mode kegiatan untuk menemukan event yang paling relevan. Semua data masih statis, tapi interaksi frontend sudah dibuat seperti marketplace."
      />

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
          Menampilkan <span className="text-foreground">{filteredEvents.length}</span>{' '}
          dari {events.length} event
        </p>
        <select className="h-10 w-fit rounded-md border bg-card px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <option>Paling relevan</option>
          <option>Terbaru</option>
          <option>Kuota tersisa</option>
        </select>
      </div>

      {filteredEvents.length > 0 ? (
        <section
          className={
            view === 'grid'
              ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
              : 'grid gap-5'
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
              saved={savedEventIds.includes(event.id)}
              onSavedChange={toggleSaved}
              detailPathPrefix={detailPathPrefix}
              variant={view}
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
