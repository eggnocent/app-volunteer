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
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  CategoryChip,
  CertificateCard,
  EventCard,
  PageHeader,
  StatsCard,
  StatusBadge,
} from '@/components'
import {
  certificates,
  dashboardStats,
  events,
  getEventById,
  getOrganizerById,
  volunteerApplications,
  volunteerProfile,
} from '@/data'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

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
  const activeApplications = volunteerApplications.filter(
    (application) => application.status !== 'Completed',
  )
  const savedEvents = events.filter((event) =>
    volunteerProfile.savedEventIds.includes(event.id),
  )

  function setActiveTab(tab: DashboardTab) {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Volunteer Dashboard"
        title={`Halo, ${volunteerProfile.name}.`}
        description="Pantau aplikasi event, jam kontribusi, sertifikat, dan ringkasan impact untuk portofolio keaktifanmu."
        action={
          <Link
            to="/events"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Cari event baru
          </Link>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat, index) => (
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

        <article className="rounded-lg border bg-deep-green p-5 text-primary-foreground shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-xl font-extrabold text-secondary-foreground">
              {volunteerProfile.avatarInitials}
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold">
                {volunteerProfile.name}
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {volunteerProfile.major} · {volunteerProfile.university}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {volunteerProfile.interests.map((interest) => (
              <CategoryChip
                key={interest}
                category={interest}
                className="border-white/20 bg-white/10 text-primary-foreground"
              />
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border bg-card p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <tab.icon size={17} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'overview' ? (
        <OverviewTab activeApplications={activeApplications.length} savedEvents={savedEvents} />
      ) : null}

      {activeTab === 'applications' ? <ApplicationsTab /> : null}

      {activeTab === 'certificates' ? <CertificatesTab /> : null}
    </div>
  )
}

function OverviewTab({
  activeApplications,
  savedEvents,
}: {
  activeApplications: number
  savedEvents: typeof events
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <SectionTitle
          eyebrow="Event tersimpan"
          title="Aksi yang sedang kamu pantau."
          description="Bookmark ini membantu relawan membandingkan event sebelum mendaftar."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {savedEvents.slice(0, 4).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
              saved
              detailPathPrefix="/volunteer/events"
              variant="compact"
            />
          ))}
        </div>
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
                {volunteerProfile.name} aktif di {volunteerProfile.interests.length}{' '}
                kategori, punya {activeApplications} aplikasi berjalan, dan{' '}
                {volunteerProfile.certificates} sertifikat tersimpan.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <ImpactRow label="Jam kontribusi" value={`${volunteerProfile.totalHours} jam`} />
            <ImpactRow
              label="Event selesai"
              value={`${volunteerProfile.completedEvents} event`}
            />
            <ImpactRow label="Kota utama" value={volunteerProfile.city} />
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

function ApplicationsTab() {
  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Applications"
        title="Status pendaftaran event."
        description="Pantau aplikasi yang masih draft, terkirim, diterima, atau sudah selesai."
      />
      <div className="grid gap-4">
        {volunteerApplications.map((application) => {
          const event = getEventById(application.eventId)
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
                  Role {application.role} · {organizer?.name ?? 'Organizer'} · submit{' '}
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
              </div>

              <Link
                to={event ? `/volunteer/events/${event.slug}` : '/events'}
                className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
              >
                Lihat event
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CertificatesTab() {
  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Certificates"
        title="Sertifikat volunteer."
        description="Kartu sertifikat dummy ini nanti bisa dipresentasikan sebagai bukti aktivitas dalam prototype."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
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
      <h2 className="mt-2 font-heading text-3xl font-extrabold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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

function getActiveTab(value: string | null): DashboardTab {
  if (value === 'applications' || value === 'certificates') {
    return value
  }

  return 'overview'
}
