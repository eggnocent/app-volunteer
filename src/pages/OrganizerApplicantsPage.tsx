import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Search,
  Users,
  Check,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CategoryChip, ConfirmDialog, Dialog, PageHeader, StatsCard, StatusBadge } from '@/components'
import {
  getEventById,
  platformUsers,
  volunteerApplications as initialApplications,
  volunteerProfile,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { getVolunteerRoleLabel } from '@/lib/display-labels'
import { formatDate } from '@/lib/format'
import { mapApplication, mapEvent, organizerApi } from '@/services/api'
import { useAuth } from '@/providers/useAuth'
import type { ApiApplication, ApiEvent } from '@/services/api'
import type { ApplicationStatus, VolunteerApplication, VolunteerEvent } from '@/types/migunani'

type ApplicantIdentity = {
  name: string
  profileLine: string
  city?: string
}

export function OrganizerApplicantsPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const focusedEventId = searchParams.get('event')
  const organizerId = user?.organizerId
  const fallbackResource = useMemo(
    () => ({
      applications: organizerId ? initialApplications : [],
      events: organizerId
        ? initialApplications
            .map((application) => getEventById(application.eventId))
            .filter((event): event is VolunteerEvent => Boolean(event))
        : [],
      applicantIdentities: organizerId
        ? getFallbackApplicantIdentities(initialApplications)
        : {},
    }),
    [organizerId],
  )
  const loadApplications = useCallback(async () => {
    if (!organizerId) {
      return fallbackResource
    }

    const apiApplications = await organizerApi.getOrganizerApplications(organizerId)
    const mappedApplications = apiApplications.map(mapApplication)
    const apiEvents = apiApplications
      .map((application) => application.event)
      .filter((event): event is ApiEvent => Boolean(event))
      .map(mapEvent)

    return {
      applications: mappedApplications,
      events: dedupeEvents([...fallbackResource.events, ...apiEvents]),
      applicantIdentities: getApplicantIdentities(apiApplications, mappedApplications),
    }
  }, [fallbackResource, organizerId])
  const {
    data: resource,
    error: applicantsError,
    isLoading,
    reload,
  } = useAsyncResource(loadApplications, fallbackResource)

  // State for applications to allow interactive approve/reject actions
  const [applicationsOverride, setApplicationsOverride] =
    useState<VolunteerApplication[] | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua status')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [checkedInIds, setCheckedInIds] = useState<string[]>([])
  const [issuedCertificateIds, setIssuedCertificateIds] = useState<string[]>([])
  const [pendingApplicationIds, setPendingApplicationIds] = useState<string[]>([])
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const applications = applicationsOverride ?? resource.applications

  // Handle Approve Action
  const handleApprove = (applicationId: string) => {
    void updateStatus(applicationId, 'Accepted')
  }

  // Handle Reject Action
  const handleReject = (applicationId: string) => {
    setRejectApplicationId(applicationId)
  }

  const handleCheckIn = async (applicationId: string) => {
    if (!organizerId) {
      setActionError('Profil organizer belum siap. Coba muat ulang akun organizer.')
      return
    }

    setActionError(null)
    setPendingApplicationIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    )
    setCheckedInIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    )

    try {
      const updatedApplication = mapApplication(
        await organizerApi.checkInApplication(organizerId, applicationId),
      )
      replaceApplication(updatedApplication)
      void reload()
    } catch (error) {
      setCheckedInIds((current) => current.filter((id) => id !== applicationId))
      setActionError(getErrorMessage(error))
    } finally {
      setPendingApplicationIds((current) => current.filter((id) => id !== applicationId))
    }
  }

  async function handleIssueCertificate(applicationId: string) {
    if (!organizerId) {
      setActionError('Profil organizer belum siap. Coba muat ulang akun organizer.')
      return
    }

    setActionError(null)
    setPendingApplicationIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    )
    setIssuedCertificateIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    )

    try {
      await organizerApi.issueCertificate(organizerId, applicationId)
      void reload()
    } catch (error) {
      setIssuedCertificateIds((current) =>
        current.filter((id) => id !== applicationId),
      )
      setActionError(getErrorMessage(error))
    } finally {
      setPendingApplicationIds((current) => current.filter((id) => id !== applicationId))
    }
  }

  async function updateStatus(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    if (!organizerId) {
      setActionError('Profil organizer belum siap. Coba muat ulang akun organizer.')
      return
    }

    const previousApplications = applications
    setActionError(null)
    setPendingApplicationIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    )
    setApplicationsOverride(
      previousApplications.map((app) =>
        app.id === applicationId ? { ...app, status } : app,
      ),
    )

    try {
      const updatedApplication = mapApplication(
        await organizerApi.updateApplicationStatus(organizerId, applicationId, status),
      )
      replaceApplication(updatedApplication)
      void reload()
    } catch (error) {
      setApplicationsOverride(previousApplications)
      setActionError(getErrorMessage(error))
    } finally {
      setPendingApplicationIds((current) => current.filter((id) => id !== applicationId))
      setRejectApplicationId(null)
    }
  }

  function replaceApplication(updatedApplication: VolunteerApplication) {
    setApplicationsOverride((current) =>
      (current ?? applications).map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app,
      ),
    )
  }

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return applications
      .map((application) => ({
        application,
        event: resource.events.find((event) => event.id === application.eventId) ??
          getEventById(application.eventId),
        applicantIdentity: resource.applicantIdentities[application.id],
      }))
      .filter(({ event }) => !focusedEventId || event?.id === focusedEventId)
      .filter(({ application }) => {
        if (statusFilter === 'Semua status') return true
        return application.status.toLowerCase() === statusFilter.toLowerCase()
      })
      .filter(({ application, applicantIdentity, event }) => {
        if (!normalizedQuery) {
          return true
        }

        return [
          applicantIdentity?.name ?? '',
          applicantIdentity?.profileLine ?? '',
          application.role,
          getVolunteerRoleLabel(application.role),
          application.status,
          event?.title ?? '',
          event?.category ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
  }, [
    applications,
    focusedEventId,
    query,
    resource.applicantIdentities,
    resource.events,
    statusFilter,
  ])

  const focusedEvent = focusedEventId
    ? resource.events.find((event) => event.id === focusedEventId) ??
      getEventById(focusedEventId)
    : undefined
  const acceptedCount = applications.filter(
    (app) => (!focusedEventId || app.eventId === focusedEventId) && app.status === 'Accepted'
  ).length
  const submittedCount = applications.filter(
    (app) => (!focusedEventId || app.eventId === focusedEventId) && app.status === 'Submitted'
  ).length
  const totalCount = applications.filter(
    (app) => !focusedEventId || app.eventId === focusedEventId
  ).length
  const checkedInCount = checkedInIds.filter((id) => {
    const application = applications.find((app) => app.id === id)
    return application && (!focusedEventId || application.eventId === focusedEventId)
  }).length
  const selectedApplication = selectedApplicationId
    ? applications.find((app) => app.id === selectedApplicationId)
    : undefined
  const rejectApplication = rejectApplicationId
    ? applications.find((app) => app.id === rejectApplicationId)
    : undefined
  const selectedEvent = selectedApplication
    ? resource.events.find((event) => event.id === selectedApplication.eventId) ??
      getEventById(selectedApplication.eventId)
    : undefined

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Pendaftar Organizer"
        title="Kelola daftar pendaftar relawan."
        description={
          focusedEvent
            ? `Menampilkan pendaftar untuk ${focusedEvent.title}.`
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

      {isLoading ? (
        <ApiNotice message="Memuat pendaftar..." tone="loading" />
      ) : null}
      {applicantsError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${applicantsError}`}
          tone="error"
        />
      ) : null}
      {actionError ? (
        <ApiNotice message={actionError} tone="error" />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total pendaftar"
          value={totalCount.toString()}
          helper={focusedEventId ? "untuk event ini" : "seluruh event"}
          icon={Users}
          tone="green"
        />
        <StatsCard
          label="Diterima"
          value={acceptedCount.toString()}
          helper="siap briefing"
          icon={CheckCircle2}
          tone="yellow"
        />
        <StatsCard
          label="Terkirim"
          value={submittedCount.toString()}
          helper="perlu review"
          icon={CalendarDays}
          tone="dark"
        />
        <StatsCard
          label="Check-in"
          value={checkedInCount.toString()}
          helper="hadir di lokasi"
          icon={ClipboardCheck}
          tone="neutral"
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option>Semua status</option>
            <option value="Submitted">Terkirim</option>
            <option value="Accepted">Diterima</option>
            <option value="Rejected">Ditolak</option>
            <option value="Completed">Selesai</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1.2fr_1fr_150px_130px_120px_150px]">
          <span>Pendaftar</span>
          <span className="hidden lg:block">Event</span>
          <span className="hidden lg:block">Peran</span>
          <span className="hidden lg:block">Dikirim</span>
          <span>Status</span>
          <span className="text-right lg:text-left">Tindakan</span>
        </div>
        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-muted-foreground">
              Tidak ada pendaftar yang cocok dengan filter.
            </div>
          ) : (
            rows.map(({ application, event }) => {
              const isPending = pendingApplicationIds.includes(application.id)

              return (
              <article
                key={application.id}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1.2fr_1fr_150px_130px_120px_150px] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base font-extrabold">
                    {resource.applicantIdentities[application.id]?.name ?? volunteerProfile.name}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {resource.applicantIdentities[application.id]?.profileLine ??
                      `${volunteerProfile.major} · ${volunteerProfile.university}`}
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
                  {getVolunteerRoleLabel(application.role)}
                </span>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {formatDate(application.submittedAt)}
                </span>
                <div>
                  <StatusBadge status={application.status} />
                </div>
                <div className="flex items-center justify-end gap-2 lg:justify-start">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setSelectedApplicationId(application.id)}
                    className="inline-flex size-8 items-center justify-center rounded bg-accent text-accent-foreground transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    title="Lihat Detail"
                  >
                    <Eye size={16} />
                  </button>
                  {application.status === 'Submitted' ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleApprove(application.id)}
                        className="inline-flex size-8 items-center justify-center rounded bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        title="Terima Relawan"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReject(application.id)}
                        className="inline-flex size-8 items-center justify-center rounded bg-destructive/10 text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        title="Tolak Relawan"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : application.status === 'Accepted' && !checkedInIds.includes(application.id) ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCheckIn(application.id)}
                      className="inline-flex h-8 items-center justify-center rounded bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      title="Check-in Relawan"
                    >
                      {isPending ? 'Menyimpan...' : 'Check-in'}
                    </button>
                  ) : application.status === 'Completed' &&
                    !issuedCertificateIds.includes(application.id) ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => void handleIssueCertificate(application.id)}
                      className="inline-flex h-8 items-center justify-center rounded bg-secondary/30 px-3 text-xs font-bold text-secondary-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      title="Terbitkan sertifikat"
                    >
                      {isPending ? 'Menerbitkan...' : 'Terbitkan'}
                    </button>
                  ) : checkedInIds.includes(application.id) ||
                    issuedCertificateIds.includes(application.id) ? (
                    <span className="text-xs font-bold text-primary">
                      {issuedCertificateIds.includes(application.id)
                        ? 'Sertifikat terbit'
                        : 'Sudah hadir'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground/50">
                      Selesai ditinjau
                    </span>
                  )}
                </div>
              </article>
              )
            })
          )}
        </div>
      </section>

      {selectedApplication && organizerId ? (
        <ApplicantDetailModal
          application={selectedApplication}
          event={selectedEvent}
          organizerId={organizerId}
          fallbackApplicantIdentity={resource.applicantIdentities[selectedApplication.id]}
          checkedIn={checkedInIds.includes(selectedApplication.id)}
          isPending={pendingApplicationIds.includes(selectedApplication.id)}
          onClose={() => setSelectedApplicationId(null)}
          onApprove={() => handleApprove(selectedApplication.id)}
          onReject={() => handleReject(selectedApplication.id)}
          onCheckIn={() => handleCheckIn(selectedApplication.id)}
          onIssueCertificate={() => void handleIssueCertificate(selectedApplication.id)}
          certificateIssued={issuedCertificateIds.includes(selectedApplication.id)}
        />
      ) : null}

      {rejectApplication ? (
        <ConfirmDialog
          tone="danger"
          title="Tolak pendaftar?"
          description={`Aplikasi ${
            resource.applicantIdentities[rejectApplication.id]?.name ?? volunteerProfile.name
          } untuk ${getEventTitle(resource.events, rejectApplication.eventId)} akan ditolak.`}
          confirmLabel="Tolak pendaftar"
          isPending={pendingApplicationIds.includes(rejectApplication.id)}
          onCancel={() => setRejectApplicationId(null)}
          onConfirm={() => void updateStatus(rejectApplication.id, 'Rejected')}
        />
      ) : null}
    </div>
  )
}

function ApplicantDetailModal({
  application,
  event,
  organizerId,
  fallbackApplicantIdentity,
  checkedIn,
  isPending,
  onClose,
  onApprove,
  onReject,
  onCheckIn,
  onIssueCertificate,
  certificateIssued,
}: {
  application: VolunteerApplication
  event?: VolunteerEvent
  organizerId: string
  fallbackApplicantIdentity?: ApplicantIdentity
  checkedIn: boolean
  isPending: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onCheckIn: () => void
  onIssueCertificate: () => void
  certificateIssued: boolean
}) {
  const loadApplicationDetail = useCallback(
    () => organizerApi.getOrganizerApplication(organizerId, application.id),
    [application.id, organizerId],
  )
  const { data: detail, error, isLoading } = useAsyncResource<ApiApplication | null>(
    loadApplicationDetail,
    null,
  )
  const volunteerName =
    detail?.volunteer?.name ?? fallbackApplicantIdentity?.name ?? volunteerProfile.name
  const volunteerProfileLine =
    [
      detail?.volunteer?.city,
      detail?.volunteer?.email,
    ]
      .filter(Boolean)
      .join(' · ') ||
    fallbackApplicantIdentity?.profileLine ||
    `${volunteerProfile.major} · ${volunteerProfile.university}`
  const motivation = detail?.motivation ?? application.motivation
  const availability = detail?.availability ?? application.availability
  const volunteerCity =
    detail?.volunteer?.city ?? fallbackApplicantIdentity?.city ?? volunteerProfile.city
  const matchNotes = [
    application.role,
    event?.category,
    volunteerCity === event?.city
      ? `Dekat ${event?.city}`
      : null,
  ].filter(Boolean)

  return (
    <Dialog
      open
      title={volunteerName}
      description={volunteerProfileLine}
      icon={<Users size={18} />}
      className="max-w-2xl"
      bodyClassName="grid gap-5 p-5 md:grid-cols-[1fr_240px]"
      isDismissDisabled={isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tutup
          </button>
          {application.status === 'Submitted' ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={onReject}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-destructive/20 bg-card px-4 text-sm font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={16} />
                Tolak
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={onApprove}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={16} />
                {isPending ? 'Menyimpan...' : 'Terima'}
              </button>
            </>
          ) : application.status === 'Accepted' && !checkedIn ? (
            <button
              type="button"
              disabled={isPending}
              onClick={onCheckIn}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ClipboardCheck size={16} />
              {isPending ? 'Menyimpan...' : 'Check-in relawan'}
            </button>
          ) : application.status === 'Completed' && !certificateIssued ? (
            <button
              type="button"
              disabled={isPending}
              onClick={onIssueCertificate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              {isPending ? 'Menerbitkan...' : 'Terbitkan sertifikat'}
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        {isLoading ? (
          <ApiNotice message="Memuat detail pendaftar..." tone="loading" />
        ) : null}
        {error ? (
          <ApiNotice
            message={`Sebagian detail pendaftar belum bisa dimuat. Menampilkan informasi dari daftar utama. ${error}`}
            tone="error"
          />
        ) : null}
        <DetailBlock label="Event" value={event?.title ?? 'Event Migunani'} />
        <DetailBlock label="Peran dipilih" value={getVolunteerRoleLabel(application.role)} />
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Motivasi
          </p>
          <p className="mt-2 rounded-md bg-muted p-3 text-sm leading-6 text-muted-foreground">
            {motivation}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Ketersediaan
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availability.map((item) => (
              <span
                key={item}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg border bg-deep-green p-4 text-primary-foreground">
          <p className="text-xs font-bold uppercase text-primary-foreground/70">
            Sinyal review
          </p>
          <h3 className="mt-2 font-heading text-2xl font-extrabold">
            Rekomendasi: review
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {matchNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold"
              >
                {note}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Kehadiran
          </p>
          <p className="mt-2 text-sm font-bold text-foreground">
            {checkedIn ? 'Relawan sudah check-in' : 'Belum check-in'}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Simulasi check-in ini membantu organizer melihat siapa yang hadir di
            hari kegiatan.
          </p>
        </section>
      </aside>
    </Dialog>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

function getEventTitle(sourceEvents: VolunteerEvent[], eventId: string) {
  return sourceEvents.find((event) => event.id === eventId)?.title ??
    getEventById(eventId)?.title ??
    'Event Migunani'
}

function dedupeEvents(sourceEvents: VolunteerEvent[]) {
  return Array.from(
    sourceEvents
      .reduce((eventMap, event) => eventMap.set(event.id, event), new Map<string, VolunteerEvent>())
      .values(),
  )
}

function getApplicantIdentities(
  apiApplications: ApiApplication[],
  mappedApplications: VolunteerApplication[],
) {
  const fallbackIdentities = getFallbackApplicantIdentities(mappedApplications)

  return apiApplications.reduce<Record<string, ApplicantIdentity>>(
    (identityMap, application) => {
      identityMap[application.id] = getApplicantIdentity(application, fallbackIdentities[application.id])
      return identityMap
    },
    {},
  )
}

function getApplicantIdentity(
  application: ApiApplication,
  fallbackIdentity?: ApplicantIdentity,
): ApplicantIdentity {
  const volunteer = application.volunteer
  const profileLine = [
    volunteer?.city,
    volunteer?.email,
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    name: volunteer?.name ?? fallbackIdentity?.name ?? volunteerProfile.name,
    profileLine:
      profileLine ||
      fallbackIdentity?.profileLine ||
      `${volunteerProfile.major} · ${volunteerProfile.university}`,
    city: volunteer?.city ?? fallbackIdentity?.city ?? volunteerProfile.city,
  }
}

function getFallbackApplicantIdentities(applications: VolunteerApplication[]) {
  const volunteerUsers = platformUsers.filter((user) => user.role === 'volunteer')

  return applications.reduce<Record<string, ApplicantIdentity>>((identityMap, application, index) => {
    const user = volunteerUsers[index % volunteerUsers.length]

    identityMap[application.id] = {
      name: user?.name ?? volunteerProfile.name,
      profileLine: [
        user?.city,
        user?.email,
      ]
        .filter(Boolean)
        .join(' · ') || `${volunteerProfile.major} · ${volunteerProfile.university}`,
      city: user?.city ?? volunteerProfile.city,
    }

    return identityMap
  }, {})
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Aksi pendaftar belum bisa diproses.'
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
