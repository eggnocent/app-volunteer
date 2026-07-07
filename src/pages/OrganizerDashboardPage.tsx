import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'

import {
  CategoryChip,
  OrganizerEventRow,
  PageHeader,
  StatsCard,
  StatusBadge,
} from '@/components'
import {
  events,
  getEventById,
  getOrganizerById,
  getOrganizerEvents,
  organizerMetrics,
  organizers,
  platformUsers,
  volunteerApplications,
  volunteerProfile,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { getVolunteerRoleLabel } from '@/lib/display-labels'
import { formatDate, getFillPercentage } from '@/lib/format'
import { createOrganizerFallback } from '@/lib/organizer-profile'
import { mapApplication, mapEvent, mapOrganizer, organizerApi } from '@/services/api'
import { useAuth } from '@/providers/useAuth'
import type { ApiApplication } from '@/services/api'
import type { EventCategory } from '@/types/migunani'

const activeOrganizerId = 'org-aksara-muda'
const metricIcons = [CalendarPlus, Users, TrendingUp, Clock3]
const metricTones = ['green', 'yellow', 'dark', 'neutral'] as const
const demandCategories: EventCategory[] = [
  'Pendidikan',
  'Lingkungan',
  'Sosial',
  'Literasi',
]

export function OrganizerDashboardPage() {
  const { user } = useAuth()
  const hasOrganizerId = Boolean(user?.organizerId)
  const fallbackOrganizer = hasOrganizerId
    ? getOrganizerById(activeOrganizerId) ?? organizers[0]
    : createOrganizerFallback(user)
  const fallbackResource = useMemo(
    () => {
      const fallbackEvents = hasOrganizerId ? getOrganizerEvents(fallbackOrganizer.id) : []

      return {
        organizer: fallbackOrganizer,
        events: fallbackEvents.length > 0 ? fallbackEvents : hasOrganizerId ? events.slice(0, 4) : [],
        applications: hasOrganizerId ? volunteerApplications : [],
        applicantIdentities: hasOrganizerId
          ? getFallbackApplicantIdentities(volunteerApplications)
          : {},
        metrics: hasOrganizerId ? organizerMetrics : getEmptyOrganizerMetrics(),
      }
    },
    [fallbackOrganizer, hasOrganizerId],
  )
  const organizerId = user?.organizerId
  const loadDashboard = useCallback(async () => {
    if (!organizerId) {
      return fallbackResource
    }

    const dashboard = await organizerApi.getOrganizerDashboard(organizerId)

    return {
      organizer: mapOrganizer(dashboard.organizer),
      events: dashboard.events.map(mapEvent),
      applications: dashboard.applications.map(mapApplication),
      applicantIdentities: getApplicantIdentities(dashboard.applications),
      metrics: dashboard.metrics ?? organizerMetrics,
    }
  }, [fallbackResource, organizerId])
  const {
    data: resource,
    error: dashboardError,
    isLoading,
  } = useAsyncResource(loadDashboard, fallbackResource)
  const { organizer } = resource
  const visibleEvents = resource.events
  const applicantRows = resource.applications
    .map((application) => ({
      application,
      event: visibleEvents.find((event) => event.id === application.eventId) ??
        getEventById(application.eventId),
      applicantIdentity: resource.applicantIdentities[application.id],
    }))
    .filter((row) => row.event)

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Dashboard Organizer"
        title="Kelola event, pendaftar, dan performa relawan."
        description="Pantau event aktif, keterisian kuota, pendaftar terbaru, dan kesiapan event berikutnya."
        action={
          <Link
            to="/organizer/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Buat event
            <ArrowRight size={17} />
          </Link>
        }
      />

      {isLoading ? (
        <ApiNotice message="Memuat dashboard organizer..." tone="loading" />
      ) : null}
      {dashboardError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${dashboardError}`}
          tone="error"
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {resource.metrics.map((metric, index) => (
            <StatsCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              icon={metricIcons[index]}
              tone={metricTones[index]}
            />
          ))}
        </div>

        <article className="rounded-lg border bg-deep-green p-5 text-primary-foreground shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-xl font-extrabold text-secondary-foreground">
              {organizer.logoInitial}
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold">{organizer.name}</h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {organizer.type} · {organizer.city}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-primary-foreground/80">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary" />
              {organizer.verified ? 'Organizer terverifikasi' : 'Perlu verifikasi'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star size={16} className="text-secondary" />
              Rating {organizer.rating} dari relawan
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} className="text-secondary" />
              Respons {organizer.responseTime}
            </span>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="space-y-4">
            <SectionTitle
              eyebrow="Event dikelola"
              title="Event yang sedang dikelola."
              description="Pantau status publikasi, jumlah pendaftar, dan keterisian slot relawan."
            />
            <div className="grid gap-4">
              {visibleEvents.map((event) => (
                <OrganizerEventRow
                  key={event.id}
                  event={event}
                  detailPathPrefix="/organizer/events"
                  canEdit
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              eyebrow="Pendaftar terbaru"
              title="Pendaftar terbaru."
              description="Lihat siapa yang mendaftar dan role yang dipilih."
            />
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground md:grid-cols-[1fr_160px_140px_120px]">
                <span>Relawan</span>
                <span className="hidden md:block">Peran</span>
                <span className="hidden md:block">Dikirim</span>
                <span>Status</span>
              </div>
              <div className="divide-y">
                {applicantRows.map(({ application, applicantIdentity, event }) => (
                  <article
                    key={application.id}
                    className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 md:grid-cols-[1fr_160px_140px_120px] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-heading text-base font-extrabold">
                        {applicantIdentity?.name ?? volunteerProfile.name}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {[applicantIdentity?.profileLine, event?.title ?? 'Event Migunani']
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="hidden text-sm font-semibold text-muted-foreground md:block">
                      {getVolunteerRoleLabel(application.role)}
                    </span>
                    <span className="hidden text-sm font-semibold text-muted-foreground md:block">
                      {formatDate(application.submittedAt)}
                    </span>
                    <StatusBadge status={application.status} />
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <BarChart3 size={19} />
              </span>
              <div>
                <h2 className="font-heading text-xl font-extrabold">Performa event</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Rata-rata keterisian event aktif membantu organizer memantau
                  performa dan mengambil keputusan operasional lebih cepat.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {visibleEvents.slice(0, 4).map((event) => {
                const fill = getFillPercentage(event.registered, event.quota)

                return (
                  <div key={event.id}>
                    <div className="flex items-center justify-between gap-3 text-sm font-bold">
                      <span className="truncate">{event.title}</span>
                      <span>{fill}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${fill}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border bg-secondary p-5 text-secondary-foreground shadow-sm">
            <p className="text-sm font-bold uppercase">Aksi berikutnya</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold">
              Publikasikan event baru lebih cepat.
            </h2>
            <p className="mt-2 text-sm leading-6">
              Gunakan form event baru untuk melihat preview kartu sebelum event
              dipublikasikan.
            </p>
            <Link
              to="/organizer/create"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-black px-4 text-sm font-bold text-white transition hover:bg-deep-green"
            >
              Buat event
              <ArrowRight size={16} />
            </Link>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-bold uppercase text-primary">Kategori diminati</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {demandCategories.map((category) => (
                <CategoryChip key={category} category={category} />
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <ChecklistItem label="Brief relawan untuk event weekend" />
              <ChecklistItem label="Tinjau pendaftar prioritas" />
              <ChecklistItem label="Lengkapi benefit dan skill event" />
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
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

function getEmptyOrganizerMetrics() {
  return organizerMetrics.map((metric) => ({
    ...metric,
    value: '0',
    helper:
      metric.id === 'response'
        ? 'belum ada pendaftar'
        : metric.id === 'growth'
          ? 'mulai dari event pertama'
          : 'belum ada data',
  }))
}

function getApplicantIdentities(applications: ApiApplication[]) {
  const fallbackIdentities = getFallbackApplicantIdentities(applications)

  return applications.reduce<Record<string, { name: string; profileLine: string }>>(
    (identityMap, application) => {
      const volunteer = application.volunteer
      const profileLine = [volunteer?.city, volunteer?.email]
        .filter(Boolean)
        .join(' · ')

      identityMap[application.id] = {
        name: volunteer?.name ?? fallbackIdentities[application.id]?.name ?? volunteerProfile.name,
        profileLine:
          profileLine ||
          fallbackIdentities[application.id]?.profileLine ||
          `${volunteerProfile.major} · ${volunteerProfile.university}`,
      }

      return identityMap
    },
    {},
  )
}

function getFallbackApplicantIdentities(applications: Array<{ id: string }>) {
  const volunteerUsers = platformUsers.filter((user) => user.role === 'volunteer')

  return applications.reduce<Record<string, { name: string; profileLine: string }>>(
    (identityMap, application, index) => {
      const user = volunteerUsers[index % volunteerUsers.length]

      identityMap[application.id] = {
        name: user?.name ?? volunteerProfile.name,
        profileLine:
          [user?.city, user?.email].filter(Boolean).join(' · ') ||
          `${volunteerProfile.major} · ${volunteerProfile.university}`,
      }

      return identityMap
    },
    {},
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
      <h2 className="mt-2 font-heading text-3xl font-extrabold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground">
      <CheckCircle2 size={16} className="shrink-0 text-primary" />
      {label}
    </div>
  )
}
