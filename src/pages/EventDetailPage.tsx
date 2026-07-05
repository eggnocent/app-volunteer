import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  CategoryChip,
  EventCard,
  EventDetailPanel,
  PageHeader,
  StatusBadge,
} from '@/components'
import {
  getEventBySlug,
  getOrganizerById,
  getRelatedEvents,
  volunteerApplications,
  volunteerProfile,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { PagePlaceholder } from '@/pages/PagePlaceholder'
import { mapApplication, mapEvent, publicApi } from '@/services/api'

type EventDetailPageProps = {
  viewer?: 'public' | 'volunteer' | 'organizer'
}

export function EventDetailPage({ viewer = 'public' }: EventDetailPageProps) {
  const { slug } = useParams()
  const fallbackEvent = slug ? getEventBySlug(slug) : undefined
  const fallbackResource = useMemo(
    () =>
      fallbackEvent
        ? {
            event: fallbackEvent,
            relatedEvents: getRelatedEvents(fallbackEvent.id),
            volunteerApplication: volunteerApplications.find(
              (application) => application.eventId === fallbackEvent.id,
            ),
          }
        : undefined,
    [fallbackEvent],
  )
  const loadEvent = useCallback(async () => {
    if (!slug) {
      return undefined
    }

    const apiEvent = await publicApi.getEvent(slug)

    return {
      event: mapEvent(apiEvent),
      relatedEvents: (apiEvent.relatedEvents ?? []).map(mapEvent),
      volunteerApplication: apiEvent.myApplication
        ? mapApplication(apiEvent.myApplication)
        : undefined,
    }
  }, [slug])
  const { data: detailResource, error: detailError, isLoading } = useAsyncResource(
    loadEvent,
    fallbackResource,
  )
  const event = detailResource?.event
  const organizer = event ? getOrganizerById(event.organizerId) : undefined

  if (!event) {
    return (
      <PagePlaceholder
        eyebrow="Event Detail"
        title="Event tidak ditemukan."
        description="Route detail sudah siap. Nanti state kosong ini akan dipoles setelah komponen utama tersedia."
      />
    )
  }

  const relatedEvents = detailResource.relatedEvents
  const volunteerApplication = detailResource.volunteerApplication
  const isVolunteerView = viewer === 'volunteer'
  const isOrganizerView = viewer === 'organizer'
  const applyHref = isVolunteerView
    ? `/volunteer/apply/${event.id}`
    : `/?next=${encodeURIComponent(`/volunteer/apply/${event.id}`)}`
  const backHref = isVolunteerView
    ? '/volunteer/dashboard'
    : isOrganizerView
      ? '/organizer/dashboard'
      : '/events'
  const relatedDetailPathPrefix = isVolunteerView
    ? '/volunteer/events'
    : isOrganizerView
      ? '/organizer/events'
      : '/events'

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        {isVolunteerView || isOrganizerView ? 'Kembali ke dashboard' : 'Kembali ke explore'}
      </Link>

      {isLoading ? (
        <ApiNotice message="Memuat detail event dari API..." tone="loading" />
      ) : null}
      {detailError ? (
        <ApiNotice
          message={`Detail API belum tersedia, memakai data tampilan sementara. ${detailError}`}
          tone="error"
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="relative h-[320px] bg-muted md:h-[420px]">
          <img src={event.image} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={event.status} className="bg-card text-foreground" />
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                {event.mode}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl font-heading text-3xl font-extrabold leading-tight sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              {event.shortDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Event Detail"
            title="Detail kegiatan"
            description={event.description}
            action={
              <EventAction
                applyHref={applyHref}
                isVolunteerView={isVolunteerView}
                isOrganizerView={isOrganizerView}
                eventId={event.id}
                status={volunteerApplication?.status}
              />
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<CheckCircle2 size={20} />}
              label="Benefit"
              items={event.benefits}
            />
            <InfoCard icon={<Star size={20} />} label="Skill dibutuhkan" items={event.skills} />
            <InfoCard icon={<BadgeCheck size={20} />} label="Role relawan" items={event.roles} />
          </div>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Organizer</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold">
                  {organizer?.name ?? 'Organizer komunitas'}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {organizer?.type ?? 'Komunitas'} dari {organizer?.city ?? event.city}.
                  Organizer ini mengelola kegiatan relawan dengan response time{' '}
                  {organizer?.responseTime ?? 'cepat'}.
                </p>
              </div>
              <div className="grid min-w-56 gap-2 text-sm font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  {organizer?.verified ? 'Terverifikasi' : 'Belum terverifikasi'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Star size={16} className="text-secondary" />
                  Rating {organizer?.rating ?? 4.7}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  {organizer?.totalEvents ?? 12} event dipublikasi
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-primary">Tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryChip category={event.category} active />
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <EventDetailPanel event={event} organizer={organizer} />
          <EventAction
            applyHref={applyHref}
            isVolunteerView={isVolunteerView}
            isOrganizerView={isOrganizerView}
            eventId={event.id}
            status={volunteerApplication?.status}
            fullWidth
          />
        </div>
      </section>

      {relatedEvents.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Event serupa</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold">
              Aksi lain di kategori {event.category}.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {relatedEvents.map((relatedEvent) => (
              <EventCard
                key={relatedEvent.id}
                event={relatedEvent}
                organizer={getOrganizerById(relatedEvent.organizerId)}
                saved={volunteerProfile.savedEventIds.includes(relatedEvent.id)}
                detailPathPrefix={relatedDetailPathPrefix}
                variant="compact"
              />
            ))}
          </div>
        </section>
      ) : null}
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

function EventAction({
  applyHref,
  isVolunteerView,
  isOrganizerView,
  eventId,
  status,
  fullWidth = false,
}: {
  applyHref: string
  isVolunteerView: boolean
  isOrganizerView: boolean
  eventId: string
  status?: string
  fullWidth?: boolean
}) {
  if (isOrganizerView) {
    return (
      <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
          Event dikelola organizer
        </div>
        <Link
          to={`/organizer/applicants?event=${eventId}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
        >
          Kelola applicant
          <ArrowRight size={17} />
        </Link>
        <Link
          to={`/organizer/events/${eventId}/edit`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted"
        >
          Edit event
        </Link>
      </div>
    )
  }

  if (isVolunteerView && status) {
    return (
      <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
          Sudah terdaftar · Status {status}
        </div>
        <Link
          to="/volunteer/dashboard?tab=applications"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
        >
          Lihat aplikasi
          <ArrowRight size={17} />
        </Link>
      </div>
    )
  }

  return (
    <Link
      to={applyHref}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green ${fullWidth ? 'w-full' : ''}`}
    >
      {isVolunteerView ? 'Daftar sebagai relawan' : 'Daftar jadi relawan'}
      <ArrowRight size={17} />
    </Link>
  )
}

function InfoCard({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
}) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </span>
        <h2 className="font-heading text-lg font-extrabold">{label}</h2>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
