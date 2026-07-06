import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  LayoutDashboard,
  ListChecks,
  MapPin,
  TrendingUp,
  Download,
  X,
  FileCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'

import {
  CategoryChip,
  CertificateCard,
  EventCard,
  PageHeader,
  StatsCard,
  StatusBadge,
} from '@/components'
import {
  mapApplication,
  mapCertificate,
  mapEvent,
  toApiUrl,
  volunteerApi,
  type ApiVolunteerDashboard,
  type ApiEvent,
} from '@/services/api'
import {
  certificates,
  events,
  getOrganizerById,
  volunteerApplications as initialApplications,
  volunteerProfile,
} from '@/data'
import { formatDate } from '@/lib/format'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { getEventMatch } from '@/lib/match'
import { cn } from '@/lib/utils'
import type { Certificate, VolunteerApplication, VolunteerEvent, VolunteerProfile } from '@/types/migunani'

type DashboardTab = 'overview' | 'applications' | 'certificates'

const tabs: Array<{
  id: DashboardTab
  label: string
  icon: typeof LayoutDashboard
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', icon: ListChecks },
  { id: 'certificates', label: 'Certificates', icon: BadgeCheck },
]

const statIcons = [Clock3, CheckCircle2, Award, HeartHandshake]
const statTones = ['green', 'yellow', 'dark', 'neutral'] as const

export function VolunteerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = getActiveTab(searchParams.get('tab'))
  const initialDashboard = useMemo(
    () => ({
      profile: volunteerProfile,
      applications: initialApplications,
      certificates,
      savedEvents: events.filter((event) =>
        volunteerProfile.savedEventIds.includes(event.id),
      ),
      eventLookup: events,
    }),
    [],
  )
  const loadDashboard = useCallback(async () => {
    const aggregate = await volunteerApi.getVolunteerDashboard()
    const [profileResult, applicationsResult, savedEventsResult, certificatesResult] =
      await Promise.allSettled([
        volunteerApi.getProfile(),
        volunteerApi.getVolunteerApplications(),
        volunteerApi.getSavedEvents(),
        volunteerApi.getVolunteerCertificates(),
      ])

    return mapVolunteerDashboardResource({
      ...aggregate,
      profile:
        profileResult.status === 'fulfilled'
          ? profileResult.value
          : aggregate.profile,
      applications:
        applicationsResult.status === 'fulfilled'
          ? applicationsResult.value
          : aggregate.applications,
      savedEvents:
        savedEventsResult.status === 'fulfilled'
          ? savedEventsResult.value
          : aggregate.savedEvents,
      certificates:
        certificatesResult.status === 'fulfilled'
          ? certificatesResult.value
          : aggregate.certificates,
    })
  }, [])
  const {
    data: dashboard,
    error: dashboardError,
    isLoading,
    reload,
  } = useAsyncResource(loadDashboard, initialDashboard)

  // State management for interactive features
  const [optimisticSavedIds, setOptimisticSavedIds] = useState<string[]>([])
  const [removedSavedIds, setRemovedSavedIds] = useState<string[]>([])
  const [applications, setApplications] = useState<VolunteerApplication[] | null>(null)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  
  // Simulation states
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [appToCancel, setAppToCancel] = useState<string | null>(null)

  const visibleApplications = applications ?? dashboard.applications
  const visibleSavedEvents = useMemo(() => {
    const savedByApi = dashboard.savedEvents.filter(
      (event) => !removedSavedIds.includes(event.id),
    )
    const savedIds = new Set(savedByApi.map((event) => event.id))
    const optimisticEvents = dashboard.eventLookup.filter(
      (event) => optimisticSavedIds.includes(event.id) && !savedIds.has(event.id),
    )

    return [...savedByApi, ...optimisticEvents]
  }, [dashboard.eventLookup, dashboard.savedEvents, optimisticSavedIds, removedSavedIds])
  const activeApplications = useMemo(() => {
    return visibleApplications.filter(
      (application) => application.status !== 'Completed' && application.status !== 'Cancelled'
    )
  }, [visibleApplications])

  function setActiveTab(tab: DashboardTab) {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  // Handle removing bookmark
  const handleRemoveBookmark = async (eventId: string) => {
    setRemovedSavedIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]))
    setOptimisticSavedIds((prev) => prev.filter((id) => id !== eventId))

    try {
      await volunteerApi.removeSavedEvent(eventId)
      void reload()
    } catch {
      setRemovedSavedIds((prev) => prev.filter((id) => id !== eventId))
    }
  }

  // Handle cancel application
  const handleCancelApplication = (appId: string) => {
    const previousApplications = visibleApplications
    setApplications(
      previousApplications.map((app) =>
        app.id === appId ? { ...app, status: 'Cancelled' } : app,
      ),
    )
    setAppToCancel(null)

    void volunteerApi
      .cancelVolunteerApplication(appId)
      .then((application) => {
        const updatedApplication = mapApplication(application)
        setApplications((current) =>
          (current ?? previousApplications).map((app) =>
            app.id === updatedApplication.id ? updatedApplication : app,
          ),
        )
        void reload()
      })
      .catch(() => {
        setApplications(previousApplications)
      })
  }

  // Handle download simulation
  const triggerDownload = () => {
    if (selectedCert) {
      window.open(
        toApiUrl(volunteerApi.getVolunteerCertificateDownloadUrl(selectedCert.id)),
        '_blank',
        'noopener,noreferrer',
      )
    }

    setIsDownloading(true)
    setDownloadSuccess(false)
    setTimeout(() => {
      setIsDownloading(false)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    }, 2000)
  }

  // Dynamic values for Stats
  const dynamicStats = useMemo(() => {
    const totalHours = dashboard.profile.totalHours
    const completedCount = visibleApplications.filter((app) => app.status === 'Completed').length
    const certificatesCount = dashboard.certificates.length
    const activeCount = activeApplications.length

    return [
      { id: '1', label: 'Jam kontribusi', value: `${totalHours} jam`, delta: '+14 jam bulan ini' },
      { id: '2', label: 'Event selesai', value: `${completedCount} event`, delta: '3 kategori aktif' },
      { id: '3', label: 'Sertifikat', value: `${certificatesCount} file`, delta: 'siap diunduh' },
      { id: '4', label: 'Aplikasi berjalan', value: `${activeCount} aplikasi`, delta: 'menunggu review' },
    ]
  }, [activeApplications.length, dashboard.certificates.length, dashboard.profile.totalHours, visibleApplications])

  // Volunteer Level Progress based on hours
  const currentHours = dashboard.profile.totalHours
  const nextLevelHours = 100
  const progressPercent = Math.min((currentHours / nextLevelHours) * 100, 100)

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Volunteer Dashboard"
        title={`Halo, ${dashboard.profile.name}.`}
        description="Pantau aplikasi event, jam kontribusi, sertifikat, dan ringkasan impact untuk portofolio keaktifanmu."
        className="border-0 bg-transparent p-0 shadow-none"
        action={
          <Link
            to="/volunteer/events"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Cari event baru
          </Link>
        }
      />

      {isLoading ? (
        <ApiNotice tone="loading" message="Memuat data volunteer..." />
      ) : null}
      {dashboardError ? (
        <ApiNotice
          tone="error"
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${dashboardError}`}
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dynamicStats.map((stat, index) => (
            <StatsCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              helper={stat.delta}
              icon={statIcons[index]}
              tone={statTones[index]}
            />
          ))}
        </div>

        {/* Enhanced Profile Card with progress bar & level badge */}
        <article className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-deep-green to-primary p-5 text-primary-foreground shadow-sm">
          <div className="absolute right-0 top-0 translate-x-4 translate-y-[-4px] rotate-12 opacity-10">
            <Award size={140} />
          </div>
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-xl font-extrabold text-secondary-foreground shadow-inner">
              {dashboard.profile.name.charAt(0)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-extrabold">
                  {dashboard.profile.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  <Sparkles size={10} />
                  Gold Member
                </span>
              </div>
              <p className="mt-1 text-xs text-primary-foreground/75">
                {dashboard.profile.major} · {dashboard.profile.university}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span>Keaktifan: Level 3</span>
              <span>{currentHours}/{nextLevelHours} jam</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-border/60 bg-card p-1.5 shadow-sm">
        <div className="grid gap-1.5 sm:grid-cols-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'overview' ? (
        <OverviewTab
          activeApplications={activeApplications.length}
          savedEvents={visibleSavedEvents}
          profile={dashboard.profile}
          certificatesCount={dashboard.certificates.length}
          onRemoveBookmark={handleRemoveBookmark}
        />
      ) : null}

      {activeTab === 'applications' ? (
        <ApplicationsTab
          applications={visibleApplications}
          eventLookup={dashboard.eventLookup}
          onCancelRequest={(id) => setAppToCancel(id)}
        />
      ) : null}

      {activeTab === 'certificates' ? (
        <CertificatesTab
          certificates={dashboard.certificates}
          onPreview={setSelectedCert}
        />
      ) : null}

      {/* 1. Modal Preview Sertifikat Interaktif */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FileCheck size={18} className="text-primary" />
                Certificate Preview
              </span>
              <button
                onClick={() => setSelectedCert(null)}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sertifikat Visual (Landscape certificate style) */}
            <div className="p-6 bg-muted/30">
              <div className="relative overflow-hidden rounded-lg border bg-card p-8 shadow-inner text-center">
                {/* Background decorative elements */}
                <div className="absolute inset-0 border-[16px] border-double border-primary/10 pointer-events-none" />
                <div className="absolute right-0 top-0 translate-x-12 translate-y-[-12px] opacity-5">
                  <Award size={200} />
                </div>

                <p className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
                  Sertifikat Penghargaan
                </p>
                <h3 className="mt-4 font-serif text-3xl font-bold italic text-foreground">
                  Nadira Putri
                </h3>
                <p className="mt-3 text-sm max-w-md mx-auto text-muted-foreground">
                  telah berkontribusi secara luar biasa sebagai relawan dalam kegiatan
                </p>
                <h4 className="mt-3 font-heading text-lg font-extrabold text-primary">
                    {getEventTitle(dashboard.eventLookup, selectedCert.eventId)}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground">
                  dengan total kontribusi sebesar <strong className="text-foreground">{selectedCert.hours} Jam Kerja Sosial</strong>.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">ID Kredensial</span>
                    <p className="font-mono text-xs font-bold text-foreground">{selectedCert.credentialId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Tanggal Terbit</span>
                    <p className="text-xs font-bold text-foreground">{formatDate(selectedCert.issuedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures & Download Action bar */}
            <div className="flex items-center justify-between border-t px-6 py-4 bg-card">
              {downloadSuccess ? (
                <span className="flex items-center gap-2 text-xs font-bold text-primary animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 size={14} />
                  Sertifikat berhasil diunduh.
                </span>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  Diterbitkan secara sah oleh tim Migunani & Partner.
                </span>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="h-10 rounded-md border px-4 text-sm font-semibold transition hover:bg-muted"
                >
                  Tutup
                </button>
                <button
                  onClick={triggerDownload}
                  disabled={isDownloading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:opacity-75"
                >
                  {isDownloading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Membuat PDF...
                    </>
                  ) : downloadSuccess ? (
                    'Berhasil Diunduh!'
                  ) : (
                    <>
                      <Download size={16} />
                      Unduh PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dialog Konfirmasi Pembatalan Pendaftaran */}
      {appToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="font-heading text-lg font-extrabold text-foreground">
                  Batalkan Pendaftaran?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-6">
                  Apakah Anda yakin ingin membatalkan pendaftaran Anda untuk kegiatan{' '}
                  <strong className="text-foreground">
                    {getEventTitle(
                      dashboard.eventLookup,
                      visibleApplications.find((app) => app.id === appToCancel)?.eventId ?? '',
                    )}
                  </strong>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAppToCancel(null)}
                className="h-10 rounded-md border px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Kembali
              </button>
              <button
                onClick={() => handleCancelApplication(appToCancel)}
                className="h-10 rounded-md bg-destructive px-4 text-sm font-bold text-destructive-foreground transition hover:bg-red-700"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverviewTab({
  activeApplications,
  savedEvents,
  profile,
  certificatesCount,
  onRemoveBookmark,
}: {
  activeApplications: number
  savedEvents: VolunteerEvent[]
  profile: VolunteerProfile
  certificatesCount: number
  onRemoveBookmark: (id: string) => void
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <SectionTitle
          eyebrow="Event tersimpan"
          title="Aksi yang sedang kamu pantau."
          description="Bookmark ini membantu relawan membandingkan event sebelum mendaftar."
        />
        {savedEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm font-semibold text-muted-foreground">
            Tidak ada event yang di-bookmark saat ini.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {savedEvents.map((event) => (
              <div key={event.id} className="relative group">
                <EventCard
                  event={event}
                  organizer={getOrganizerById(event.organizerId)}
                  saved
                  detailPathPrefix="/volunteer/events"
                  variant="compact"
                  {...getEventMatch(event, profile)}
                />
                <button
                  onClick={() => onRemoveBookmark(event.id)}
                  className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                  title="Hapus Bookmark"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <article className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <TrendingUp size={19} />
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold">Impact summary</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {profile.name} aktif di {profile.interests.length}{' '}
                kategori, punya {activeApplications} aplikasi berjalan, dan{' '}
                {certificatesCount} sertifikat tersimpan.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <ImpactRow label="Jam kontribusi" value={`${profile.totalHours} jam`} />
            <ImpactRow
              label="Event selesai"
              value={`${profile.completedEvents} event`}
            />
            <ImpactRow label="Kota utama" value={profile.city} />
          </div>
        </article>

        <article className="rounded-lg border bg-secondary p-5 text-secondary-foreground shadow-sm">
          <p className="text-sm font-bold uppercase">Portfolio ready</p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold">
            Bukti aktivitasmu tertata.
          </h2>
          <p className="mt-2 text-sm leading-6">
            Sertifikat, status aplikasi, dan total jam kontribusi siap dipakai untuk
            laporan beasiswa atau portofolio organisasi.
          </p>
        </article>
      </aside>
    </div>
  )
}

function ApplicationsTab({
  applications,
  eventLookup,
  onCancelRequest,
}: {
  applications: VolunteerApplication[]
  eventLookup: VolunteerEvent[]
  onCancelRequest: (appId: string) => void
}) {
  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Applications"
        title="Status pendaftaran event."
        description="Pantau aplikasi yang masih draft, terkirim, diterima, atau sudah selesai."
      />
      <div className="grid gap-4">
        {applications.map((application) => {
          const event = eventLookup.find((item) => item.id === application.eventId)
          const organizer = event ? getOrganizerById(event.organizerId) : undefined

          return (
            <article
              key={application.id}
              className="grid gap-4 rounded-lg border bg-card p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={application.status} />
                  {event ? <CategoryChip category={event.category} /> : null}
                </div>
                <h2 className="mt-3 font-heading text-xl font-extrabold">
                  {event?.title ?? 'Event Migunani'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {application.role} · {organizer?.name ?? 'Organizer'} · dikirim pada{' '}
                  {formatDate(application.submittedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-muted-foreground">
                  {event ? (
                    <>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-primary" />
                        {formatDate(event.date)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={15} className="text-primary" />
                        {event.city}
                      </span>
                    </>
                  ) : null}
                </div>
                <ApplicationTimeline status={application.status} />
              </div>

              <div className="flex items-center gap-3">
                {application.status === 'Submitted' && (
                  <button
                    onClick={() => onCancelRequest(application.id)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 px-4 text-sm font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Batalkan
                  </button>
                )}
                <Link
                  to={event ? `/volunteer/events/${event.slug}` : '/volunteer/events'}
                  className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
                >
                  Lihat event
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CertificatesTab({
  certificates,
  onPreview,
}: {
  certificates: Certificate[]
  onPreview: (cert: Certificate) => void
}) {
  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Sertifikat"
        title="Sertifikat volunteer."
        description="Setiap sertifikat mencatat kontribusi jam kerja sosialmu dan bisa digunakan sebagai bukti portofolio."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-1.5 font-heading text-2xl font-extrabold">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-muted p-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

function ApplicationTimeline({
  status,
}: {
  status: VolunteerApplication['status']
}) {
  const steps = getApplicationSteps(status)

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.label}
          className={cn(
            'rounded-md border p-3',
            step.active
              ? 'border-primary/30 bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full border text-[10px] font-bold',
                step.active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card',
              )}
            >
              {step.active ? <CheckCircle2 size={12} /> : step.order}
            </span>
            <span className="text-xs font-bold">{step.label}</span>
          </div>
          <p className="mt-1.5 text-xs leading-5 opacity-80">{step.helper}</p>
        </div>
      ))}
    </div>
  )
}

function getApplicationSteps(status: VolunteerApplication['status']) {
  if (status === 'Rejected') {
    return [
      { order: 1, label: 'Applied', helper: 'Aplikasi terkirim', active: true },
      { order: 2, label: 'Reviewed', helper: 'Ditinjau organizer', active: true },
      { order: 3, label: 'Rejected', helper: 'Belum cocok', active: true },
      { order: 4, label: 'Retry', helper: 'Cari event lain', active: false },
    ]
  }

  if (status === 'Cancelled') {
    return [
      { order: 1, label: 'Draft', helper: 'Pendaftaran dibuat', active: true },
      { order: 2, label: 'Cancelled', helper: 'Dibatalkan relawan', active: true },
      { order: 3, label: 'Apply again', helper: 'Pilih event lain', active: false },
      { order: 4, label: 'Done', helper: 'Tidak aktif', active: false },
    ]
  }

  const activeIndex =
    status === 'Draft'
      ? 0
      : status === 'Submitted' || status === 'Waitlisted'
        ? 1
        : status === 'Accepted'
          ? 2
          : status === 'Completed'
            ? 3
            : 1

  return [
    { order: 1, label: 'Draft', helper: 'Role dan motivasi siap' },
    { order: 2, label: 'Submitted', helper: 'Menunggu review' },
    { order: 3, label: 'Accepted', helper: 'Siap briefing' },
    { order: 4, label: 'Completed', helper: 'Sertifikat diproses' },
  ].map((step, index) => ({ ...step, active: index <= activeIndex }))
}

function getActiveTab(value: string | null): DashboardTab {
  if (value === 'applications' || value === 'certificates') {
    return value
  }

  return 'overview'
}

type VolunteerDashboardResource = {
  profile: VolunteerProfile
  applications: VolunteerApplication[]
  certificates: Certificate[]
  savedEvents: VolunteerEvent[]
  eventLookup: VolunteerEvent[]
}

function mapVolunteerDashboardResource(
  dashboard: ApiVolunteerDashboard,
): VolunteerDashboardResource {
  const applications = dashboard.applications.map(mapApplication)
  const certificates = dashboard.certificates.map(mapCertificate)
  const savedEvents = dashboard.savedEvents.map(mapEvent)
  const eventLookup = [
    ...events,
    ...savedEvents,
    ...dashboard.applications
      .map((application) => application.event)
      .filter((event): event is ApiEvent => Boolean(event))
      .map(mapEvent),
  ]

  return {
    profile: dashboard.profile,
    applications,
    certificates,
    savedEvents,
    eventLookup: dedupeEvents(eventLookup),
  }
}

function dedupeEvents(sourceEvents: VolunteerEvent[]) {
  return Array.from(
    sourceEvents
      .reduce((eventMap, event) => eventMap.set(event.id, event), new Map<string, VolunteerEvent>())
      .values(),
  )
}

function getEventTitle(sourceEvents: VolunteerEvent[], eventId: string) {
  return sourceEvents.find((event) => event.id === eventId)?.title ?? 'Event Migunani'
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
      className={cn(
        'rounded-lg border p-3 text-sm font-semibold',
        tone === 'loading'
          ? 'bg-accent text-accent-foreground'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      {message}
    </div>
  )
}
