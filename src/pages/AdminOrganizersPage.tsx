import {
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { ConfirmDialog, PageHeader, StatsCard } from '@/components'
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
  const [pendingOrganizerIds, setPendingOrganizerIds] = useState<string[]>([])
  const [pendingVerification, setPendingVerification] = useState<{
    organizerId: string
    organizerName: string
    verified: boolean
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
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

    setActionError(null)
    setPendingOrganizerIds((current) =>
      current.includes(organizerId) ? current : [...current, organizerId],
    )
    setOrganizerOverrides((current) =>
      upsertOrganizer(current, { ...baseOrganizer, verified }),
    )

    try {
      const updatedOrganizer = mapOrganizer(
        await adminApi.updateOrganizerVerification(organizerId, verified),
      )
      setOrganizerOverrides((current) => upsertOrganizer(current, updatedOrganizer))
      void reload()
    } catch (error) {
      setOrganizerOverrides(previousOverrides)
      setActionError(getErrorMessage(error))
    } finally {
      setPendingOrganizerIds((current) => current.filter((id) => id !== organizerId))
      setPendingVerification(null)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin platform"
        title="Kelola organizer"
        description="Pantau verifikasi, performa, dan jumlah event yang dikelola setiap organizer."
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
      {actionError ? (
        <ApiNotice message={actionError} tone="error" />
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
        <span className="text-foreground">{filteredOrganizers.length}</span> dari{' '}
        {visibleOrganizers.length} organizer ditampilkan
      </p>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1fr_150px_120px_140px_180px]">
          <span>Organizer</span>
          <span className="hidden lg:block">Kota</span>
          <span className="hidden lg:block">Rating</span>
          <span className="hidden lg:block">Event</span>
          <span>Verifikasi</span>
        </div>
        <div className="divide-y">
          {filteredOrganizers.map((org) => {
            const orgEvents = getOrganizerEvents(org.id)
            const isPending = pendingOrganizerIds.includes(org.id)

            return (
              <article
                key={org.id}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_150px_120px_140px_180px] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-base font-extrabold text-accent-foreground">
                      {org.logoInitial}
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-base font-extrabold">
                          {org.name}
                        </h2>
                        {org.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                            <CheckCircle2 size={11} />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                            Belum verifikasi
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {org.type} · {org.city}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {org.city}
                </span>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {org.rating}
                </span>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {org.totalEvents || orgEvents.length} event
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    setPendingVerification({
                      organizerId: org.id,
                      organizerName: org.name,
                      verified: !org.verified,
                    })
                  }
                  className="inline-flex h-9 items-center justify-center rounded-md border bg-card px-3 text-xs font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? 'Menyimpan...'
                    : org.verified
                      ? 'Cabut verifikasi'
                      : 'Verifikasi organizer'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {filteredOrganizers.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-extrabold">Organizer tidak ditemukan.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba ubah filter atau kata kunci pencarian.
          </p>
        </section>
      ) : null}

      {pendingVerification ? (
        <ConfirmDialog
          tone={pendingVerification.verified ? 'default' : 'danger'}
          title={
            pendingVerification.verified
              ? 'Verifikasi organizer?'
              : 'Cabut verifikasi organizer?'
          }
          description={`${pendingVerification.organizerName} akan ${
            pendingVerification.verified ? 'ditandai terverifikasi' : 'ditandai belum terverifikasi'
          }. Perubahan ini memengaruhi kepercayaan dan visibilitas organizer di platform.`}
          confirmLabel={pendingVerification.verified ? 'Verifikasi' : 'Cabut verifikasi'}
          isPending={pendingOrganizerIds.includes(pendingVerification.organizerId)}
          onCancel={() => setPendingVerification(null)}
          onConfirm={() =>
            void updateVerification(
              pendingVerification.organizerId,
              pendingVerification.verified,
            )
          }
        />
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Status verifikasi organizer belum bisa diperbarui.'
}
