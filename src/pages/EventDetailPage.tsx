import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  CategoryChip,
  EventCard,
  EventDetailPanel,
  StatusBadge,
} from '@/components'
import {
  getEventBySlug,
  getOrganizerById,
  getRelatedEvents,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import {
  getApplicationStatusLabel,
  getEventModeLabel,
  getVolunteerRoleLabel,
} from '@/lib/display-labels'
import {
  getClosedEventMessage,
  isEventOpenForRegistration,
} from '@/lib/event-availability'
import { formatDate, formatEventTime } from '@/lib/format'
import { PagePlaceholder } from '@/pages/PagePlaceholder'
import { useAuth } from '@/providers/useAuth'
import {
  mapApplication,
  mapEvent,
  mapOrganizer,
  publicApi,
  volunteerApi,
} from '@/services/api'
import type { ApplicationStatus, Organizer, UserRole, VolunteerEvent } from '@/types/migunani'

type EventDetailPageProps = {
  viewer?: 'public' | 'volunteer' | 'organizer'
}

type EventActionContext = 'public' | UserRole

export function EventDetailPage({ viewer = 'public' }: EventDetailPageProps) {
  const { slug } = useParams()
  const { status, user } = useAuth()
  const actionContext: EventActionContext =
    viewer === 'public' && status === 'authenticated' && user ? user.role : viewer
  const fallbackEvent = slug ? getEventBySlug(slug) : undefined
  const fallbackResource = useMemo(
    () =>
      fallbackEvent
        ? {
            event: fallbackEvent,
            organizer: getOrganizerById(fallbackEvent.organizerId),
            relatedEvents: getRelatedEvents(fallbackEvent.id),
            relatedOrganizers: {},
            volunteerApplication: undefined,
            isSaved: false,
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
      organizer: apiEvent.organizer ? mapOrganizer(apiEvent.organizer) : undefined,
      relatedEvents: (apiEvent.relatedEvents ?? []).map(mapEvent),
      relatedOrganizers: Object.fromEntries(
        (apiEvent.relatedEvents ?? [])
          .filter((relatedEvent) => relatedEvent.organizer)
          .map((relatedEvent) => [
            relatedEvent.id,
            mapOrganizer(relatedEvent.organizer!),
          ]),
      ),
      volunteerApplication: apiEvent.myApplication
        ? mapApplication(apiEvent.myApplication)
        : undefined,
      isSaved: Boolean(apiEvent.isSaved),
    }
  }, [slug])
  const { data: detailResource, error: detailError, isLoading } = useAsyncResource(
    loadEvent,
    fallbackResource,
  )
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null)
  const event = detailResource?.event
  const organizer = detailResource?.organizer ??
    (event ? getOrganizerById(event.organizerId) : undefined)

  if (!event) {
    if (isLoading) {
      return (
        <PagePlaceholder
          eyebrow="Detail event"
          title="Memuat detail event."
          description="Kami sedang mengambil informasi terbaru untuk event ini."
        />
      )
    }

    return (
      <PagePlaceholder
        eyebrow="Detail event"
        title="Event tidak ditemukan."
        description="Event yang kamu buka tidak tersedia atau sudah tidak dipublikasikan."
      />
    )
  }

  const relatedEvents = detailResource.relatedEvents
  const volunteerApplication = detailResource.volunteerApplication
  const isSaved = savedOverride ?? Boolean(detailResource.isSaved)
  const isVolunteerView = actionContext === 'volunteer'
  const isOrganizerView = actionContext === 'organizer'
  const isAdminView = actionContext === 'admin'
  const canManageSpecificEvent = viewer === 'organizer'
  const applyHref = isVolunteerView
    ? `/volunteer/apply/${event.id}`
    : `/?next=${encodeURIComponent(`/volunteer/apply/${event.id}`)}`
  const backHref = isVolunteerView
    ? '/volunteer/dashboard'
    : isOrganizerView
      ? '/organizer/dashboard'
      : isAdminView
        ? '/portal/events'
      : '/events'
  const relatedDetailPathPrefix = isVolunteerView
    ? '/volunteer/events'
    : viewer === 'organizer'
      ? '/organizer/events'
      : '/events'

  async function toggleSavedEvent() {
    if (!event) {
      return
    }

    const nextSaved = !isSaved
    setSavedOverride(nextSaved)

    try {
      if (nextSaved) {
        await volunteerApi.saveEvent(event.id)
      } else {
        await volunteerApi.removeSavedEvent(event.id)
      }
    } catch {
      setSavedOverride(isSaved)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        {isVolunteerView || isOrganizerView
          ? 'Kembali ke dashboard'
          : isAdminView
            ? 'Kembali ke kelola event'
            : 'Kembali ke daftar event'}
      </Link>

      {isLoading ? (
        <ApiNotice message="Memuat detail event..." tone="loading" />
      ) : null}
      {detailError ? (
        <ApiNotice
          message={`Sebagian detail event belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${detailError}`}
          tone="error"
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="grid lg:grid-cols-[minmax(280px,0.95fr)_1fr]">
              <div className="relative min-h-[200px] bg-muted sm:min-h-[320px] lg:min-h-full">
                <img src={event.image} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={event.status} />
                    <CategoryChip category={event.category} />
                    <span className="rounded-full border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                      {getEventModeLabel(event.mode)}
                    </span>
                  </div>
                  <h1 className="mt-4 max-w-[20rem] whitespace-normal break-words font-heading text-2xl font-extrabold leading-tight text-foreground [overflow-wrap:anywhere] sm:max-w-3xl sm:text-4xl">
                    {event.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {event.shortDescription}
                  </p>
                  <div className="mt-4 max-w-[20rem] sm:max-w-full lg:hidden">
                    <EventAction
                      applyHref={applyHref}
                      isVolunteerView={isVolunteerView}
                      isOrganizerView={isOrganizerView}
                      isAdminView={isAdminView}
                      canManageSpecificEvent={canManageSpecificEvent}
                      eventId={event.id}
                      eventIsOpen={isEventOpenForRegistration(event)}
                      status={volunteerApplication?.status}
                      fullWidth
                    />
                  </div>
                </div>

                <div className="grid max-w-[20rem] gap-3 rounded-lg border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground sm:max-w-none sm:grid-cols-2">
                  <HeroFact icon={CalendarDays} label={formatDate(event.date)} />
                  <HeroFact icon={Clock} label={formatEventTime(event.startTime, event.endTime)} />
                  <HeroFact icon={MapPin} label={`${event.location}, ${event.city}`} />
                  <HeroFact icon={Users} label={`${event.registered}/${event.quota} relawan`} />
                </div>
              </div>
            </div>
          </section>

          <EventSidebar
            event={event}
            organizer={organizer}
            isVolunteerView={isVolunteerView}
            isOrganizerView={isOrganizerView}
            isAdminView={isAdminView}
            canManageSpecificEvent={canManageSpecificEvent}
            applyHref={applyHref}
            isSaved={isSaved}
            status={volunteerApplication?.status}
            onSavedToggle={toggleSavedEvent}
            showAction={false}
            className="lg:hidden"
          />

          <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase text-primary">Tentang kegiatan</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold">
              Apa yang akan dilakukan relawan.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {event.description}
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<CheckCircle2 size={20} />}
              label="Benefit"
              items={event.benefits}
            />
            <InfoCard icon={<Star size={20} />} label="Skill dibutuhkan" items={event.skills} />
            <InfoCard
              icon={<BadgeCheck size={20} />}
              label="Peran relawan"
              items={event.roles.map(getVolunteerRoleLabel)}
            />
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
                  Organizer ini mengelola kegiatan relawan dengan respons{' '}
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
                  {tag === event.mode ? getEventModeLabel(event.mode) : tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <EventSidebar
          event={event}
          organizer={organizer}
          isVolunteerView={isVolunteerView}
          isOrganizerView={isOrganizerView}
          isAdminView={isAdminView}
          canManageSpecificEvent={canManageSpecificEvent}
          applyHref={applyHref}
          isSaved={isSaved}
          status={volunteerApplication?.status}
          onSavedToggle={toggleSavedEvent}
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        />
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
                organizer={
                  detailResource.relatedOrganizers[relatedEvent.id] ??
                  getOrganizerById(relatedEvent.organizerId)
                }
                detailPathPrefix={relatedDetailPathPrefix}
                variant="compact"
                primaryAction={getRelatedEventAction(
                  actionContext,
                  relatedEvent.id,
                  relatedEvent,
                  viewer === 'organizer',
                )}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function getRelatedEventAction(
  context: EventActionContext,
  eventId: string,
  event: VolunteerEvent,
  canEditSpecificEvent: boolean,
) {
  if (context === 'admin') {
    return {
      label: 'Kelola event',
      to: '/portal/events',
    }
  }

  if (context === 'organizer') {
    if (!canEditSpecificEvent) {
      return {
        label: 'Kelola event',
        to: '/organizer/events',
      }
    }

    return {
      label: 'Edit event',
      to: `/organizer/events/${eventId}/edit`,
    }
  }

  if (context === 'volunteer') {
    if (!isEventOpenForRegistration(event)) {
      return undefined
    }

    return {
      label: 'Daftar',
      to: `/volunteer/apply/${eventId}`,
    }
  }

  if (!isEventOpenForRegistration(event)) {
    return undefined
  }

  return {
    label: 'Daftar',
    to: `/?next=${encodeURIComponent(`/volunteer/apply/${eventId}`)}`,
  }
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

function HeroFact({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays
  label: string
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon size={16} className="shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </span>
  )
}

function EventSidebar({
  event,
  organizer,
  isVolunteerView,
  isOrganizerView,
  isAdminView,
  canManageSpecificEvent,
  applyHref,
  isSaved,
  status,
  onSavedToggle,
  showAction = true,
  className,
}: {
  event: VolunteerEvent
  organizer?: Organizer
  isVolunteerView: boolean
  isOrganizerView: boolean
  isAdminView: boolean
  canManageSpecificEvent: boolean
  applyHref: string
  isSaved: boolean
  status?: ApplicationStatus
  onSavedToggle: () => Promise<void>
  showAction?: boolean
  className?: string
}) {
  const saveButton = isVolunteerView ? (
    <button
      type="button"
      onClick={() => void onSavedToggle()}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted"
    >
      <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
      {isSaved ? 'Hapus dari tersimpan' : 'Simpan event'}
    </button>
  ) : null

  const actionControl = showAction ? (
    <EventAction
      applyHref={applyHref}
      isVolunteerView={isVolunteerView}
      isOrganizerView={isOrganizerView}
      isAdminView={isAdminView}
      canManageSpecificEvent={canManageSpecificEvent}
      eventId={event.id}
      eventIsOpen={isEventOpenForRegistration(event)}
      status={status}
      fullWidth
    />
  ) : null

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <EventDetailPanel event={event} organizer={organizer} />
      {saveButton}
      {actionControl}
    </div>
  )
}

function EventAction({
  applyHref,
  isVolunteerView,
  isOrganizerView,
  isAdminView,
  canManageSpecificEvent,
  eventId,
  eventIsOpen,
  status,
  fullWidth = false,
}: {
  applyHref: string
  isVolunteerView: boolean
  isOrganizerView: boolean
  isAdminView: boolean
  canManageSpecificEvent: boolean
  eventId: string
  eventIsOpen: boolean
  status?: ApplicationStatus
  fullWidth?: boolean
}) {
  if (isOrganizerView) {
    if (!canManageSpecificEvent) {
      return (
        <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
          <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
            Masuk sebagai organizer
          </div>
          <Link
            to="/organizer/events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Kelola event organizer
            <ArrowRight size={17} />
          </Link>
        </div>
      )
    }

    return (
      <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
          Event dikelola organizer
        </div>
        <Link
          to={`/organizer/applicants?event=${eventId}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
        >
          Kelola pendaftar
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

  if (isAdminView) {
    return (
      <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
          Masuk sebagai admin
        </div>
        <Link
          to="/portal/events"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
        >
          Kelola status event
          <ArrowRight size={17} />
        </Link>
      </div>
    )
  }

  if (isVolunteerView && status) {
    return (
      <div className={fullWidth ? 'grid gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        <div className="rounded-md border bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">
          Sudah terdaftar · {getApplicationStatusLabel(status)}
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

  if (!eventIsOpen) {
    return (
      <div className="rounded-md border bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">
        {getClosedEventMessage()}
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
