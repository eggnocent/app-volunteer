import {
  Building2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader, StatsCard } from '@/components'
import { getOrganizerEvents, organizers } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { adminApi, mapOrganizer } from '@/services/api'

export function AdminOrganizersPage() {
  const loadOrganizers = useCallback(async () => {
    return (await adminApi.getAdminOrganizers()).map(mapOrganizer)
  }, [])
  const {
    data: adminOrganizers,
    error: organizersError,
    isLoading,
    reload,
  } = useAsyncResource(loadOrganizers, organizers)
  const [organizerOverrides, setOrganizerOverrides] = useState<typeof organizers>([])
  const [query, setQuery] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const visibleOrganizers = getVisibleOrganizers(adminOrganizers, organizerOverrides)

  const filteredOrganizers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return visibleOrganizers.filter((org) => {
      const matchesVerified =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && org.verified) ||
        (verifiedFilter === 'unverified' && !org.verified)

      const matchesQuery =
        !normalizedQuery ||
        [org.name, org.type, org.city]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesVerified && matchesQuery
    })
  }, [query, verifiedFilter, visibleOrganizers])

  const verifiedCount = visibleOrganizers.filter((o) => o.verified).length
  const totalEvents = visibleOrganizers.reduce(
    (sum, org) => sum + (org.totalEvents || getOrganizerEvents(org.id).length),
    0,
  )

  async function updateVerification(organizerId: string, verified: boolean) {
    const previousOverrides = organizerOverrides
    const baseOrganizer = visibleOrganizers.find((org) => org.id === organizerId)

    if (!baseOrganizer) {
      return
    }

    setOrganizerOverrides((current) =>
      upsertOrganizer(current, { ...baseOrganizer, verified }),
    )

    try {
      const updatedOrganizer = mapOrganizer(
        await adminApi.updateOrganizerVerification(organizerId, verified),
      )
      setOrganizerOverrides((current) => upsertOrganizer(current, updatedOrganizer))
      void reload()
    } catch {
      setOrganizerOverrides(previousOverrides)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin / Organizers"
        title="Kelola organizer platform."
        description="Pantau status verifikasi, performa, dan event yang dikelola oleh setiap organizer di Migunani."
      />

      {isLoading ? (
        <ApiNotice message="Memuat organizer..." tone="loading" />
      ) : null}
      {organizersError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${organizersError}`}
          tone="error"
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Total organizer"
          value={visibleOrganizers.length.toString()}
          helper="terdaftar di platform"
          icon={Building2}
          tone="green"
        />
        <StatsCard
          label="Terverifikasi"
          value={verifiedCount.toString()}
          helper={`dari ${visibleOrganizers.length} organizer`}
          icon={ShieldCheck}
          tone="yellow"
        />
        <StatsCard
          label="Total event dikelola"
          value={totalEvents.toString()}
          helper="dari semua organizer"
          icon={Star}
          tone="dark"
        />
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari organizer, tipe, kota..."
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">Semua status</option>
            <option value="verified">Terverifikasi</option>
            <option value="unverified">Belum verifikasi</option>
          </select>
        </div>
      </section>

      <p className="text-sm font-semibold text-muted-foreground">
        Menampilkan <span className="text-foreground">{filteredOrganizers.length}</span>{' '}
        dari {visibleOrganizers.length} organizer
      </p>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredOrganizers.map((org) => {
          const orgEvents = getOrganizerEvents(org.id)

          return (
            <article
              key={org.id}
              className="rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-xl font-extrabold text-accent-foreground">
                  {org.logoInitial}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-extrabold">
                      {org.name}
                    </h2>
                    {org.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                        <CheckCircle2 size={11} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {org.type}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-sm font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-primary" />
                  {org.city}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Star size={15} className="text-secondary" />
                  Rating {org.rating}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={15} className="text-primary" />
                  Response time {org.responseTime}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Building2 size={15} className="text-primary" />
                  {org.totalEvents || orgEvents.length} event di platform
                </span>
              </div>
              <button
                type="button"
                onClick={() => void updateVerification(org.id, !org.verified)}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
              >
                {org.verified ? 'Tandai unverified' : 'Verifikasi organizer'}
              </button>
            </article>
          )
        })}
      </section>

      {filteredOrganizers.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-extrabold">Organizer tidak ditemukan.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba ubah filter atau kata kunci pencarian.
          </p>
        </section>
      ) : null}
    </div>
  )
}

function getVisibleOrganizers(
  adminOrganizers: typeof organizers,
  overrides: typeof organizers,
) {
  const overrideMap = new Map(overrides.map((organizer) => [organizer.id, organizer]))

  return adminOrganizers.map((organizer) => overrideMap.get(organizer.id) ?? organizer)
}

function upsertOrganizer(
  currentOrganizers: typeof organizers,
  nextOrganizer: (typeof organizers)[number],
) {
  const hasOrganizer = currentOrganizers.some(
    (organizer) => organizer.id === nextOrganizer.id,
  )

  return hasOrganizer
    ? currentOrganizers.map((organizer) =>
        organizer.id === nextOrganizer.id ? nextOrganizer : organizer,
      )
    : [...currentOrganizers, nextOrganizer]
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
