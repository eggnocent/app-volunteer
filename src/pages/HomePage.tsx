import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CategoryChip, EventCard, StatsCard } from '@/components'
import {
  categories,
  events,
  featuredEvents,
  getOrganizerById,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { mapCategory, mapEvent, publicApi } from '@/services/api'
import { useAuth } from '@/providers/useAuth'
import type { UserRole } from '@/types/migunani'

export function HomePage() {
  const navigate = useNavigate()
  const { status, user } = useAuth()
  const isAuthenticated = status === 'authenticated' && user
  const dashboardHref = user ? getRoleHome(user.role) : '/'
  const eventsHref = user ? getRoleEvents(user.role) : '/events'
  const fallbackHome = useMemo(
    () => ({
      stats: {
        eventCount: events.length,
        totalSlots: events.reduce((sum, event) => sum + event.quota, 0),
        totalRegistered: events.reduce((sum, event) => sum + event.registered, 0),
        categoryCount: categories.length,
      },
      categories,
      featuredEvents,
    }),
    [],
  )
  const loadHome = useCallback(async () => {
    const home = await publicApi.getHome()

    return {
      stats: {
        eventCount: home.stats.eventCount,
        totalSlots: home.stats.totalSlots,
        totalRegistered: home.stats.totalRegistered,
        categoryCount: home.stats.categoryCount,
      },
      categories: home.categories.map(mapCategory),
      featuredEvents: home.featuredEvents.map(mapEvent),
    }
  }, [])
  const {
    data: home,
    error: homeError,
    isLoading,
  } = useAsyncResource(loadHome, fallbackHome)
  const [searchQuery, setSearchQuery] = useState('')
  const exploreHref = searchQuery.trim()
    ? `${eventsHref}?q=${encodeURIComponent(searchQuery.trim())}`
    : eventsHref

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-lg border bg-deep-green text-primary-foreground shadow-sm">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start lg:p-8">
          <div className="min-w-0 space-y-6">
            <div className="max-w-[19rem] sm:max-w-3xl">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold sm:text-sm">
                <Sparkles size={16} />
                <span className="truncate">Marketplace volunteer untuk aksi berdampak</span>
              </span>
              <h1 className="mt-5 max-w-[19rem] break-words font-heading text-4xl font-extrabold leading-tight sm:max-w-3xl sm:text-5xl lg:text-6xl">
                Temukan event volunteer yang migunani.
              </h1>
              <p className="mt-4 max-w-[19rem] break-words text-sm leading-7 text-primary-foreground/78 sm:max-w-2xl sm:text-base">
                Jelajahi kegiatan sosial, pendidikan, lingkungan, dan komunitas.
                Pilih event, daftar sebagai relawan, lalu simpan bukti kontribusimu
                dalam satu dashboard.
              </p>
            </div>

            <form
              className="max-w-[19rem] rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur sm:max-w-3xl"
              onSubmit={(event) => {
                event.preventDefault()
                navigate(exploreHref)
              }}
            >
              <div className="grid min-w-0 gap-2 rounded-md bg-card p-2 text-foreground shadow-sm sm:grid-cols-[1fr_auto]">
                <label className="relative block min-w-0">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari cleanup, mentoring, kesehatan..."
                    className="h-12 w-full min-w-0 rounded-md border bg-background pl-10 pr-3 text-sm font-semibold text-muted-foreground outline-none"
                    aria-label="Cari event volunteer"
                  />
                </label>
                <Link
                  to={exploreHref}
                  className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
                >
                  Cari event
                  <ArrowRight size={17} />
                </Link>
              </div>
            </form>
            <div className="flex flex-col gap-3 text-sm font-bold sm:flex-row sm:flex-wrap">
              <Link
                to={isAuthenticated ? dashboardHref : '/?next=%2Fvolunteer%2Fdashboard'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-secondary-foreground transition hover:bg-secondary/85"
              >
                <HeartHandshake size={16} />
                {isAuthenticated ? 'Buka dashboard' : 'Masuk sebagai relawan'}
              </Link>
              <Link
                to={isAuthenticated ? dashboardHref : '/?next=%2Forganizer%2Fdashboard'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-primary-foreground transition hover:bg-white/15"
              >
                <Building2 size={16} />
                {isAuthenticated ? 'Buka dashboard' : 'Masuk sebagai organizer'}
              </Link>
            </div>
          </div>

          <div className="grid min-w-0 content-start gap-3 rounded-lg border border-white/15 bg-white/10 p-4 lg:self-start">
            <p className="text-xs font-bold uppercase text-primary-foreground/65">
              Ringkasan platform
            </p>
            <div className="grid grid-cols-2 gap-3">
              <HeroMetric label="Event aktif" value={home.stats.eventCount.toString()} />
              <HeroMetric label="Slot relawan" value={home.stats.totalSlots.toString()} />
              <HeroMetric label="Pendaftar" value={home.stats.totalRegistered.toString()} />
              <HeroMetric label="Kategori" value={home.stats.categoryCount.toString()} />
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <ApiNotice message="Memuat beranda..." tone="loading" />
      ) : null}
      {homeError ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${homeError}`}
          tone="error"
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Event tersedia"
          value={home.stats.eventCount.toString()}
          helper="lintas kategori sosial"
          icon={CalendarDays}
          tone="green"
        />
        <StatsCard
          label="Slot relawan"
          value={home.stats.totalSlots.toString()}
          helper={`${home.stats.totalRegistered} pendaftar aktif`}
          icon={Users}
          tone="yellow"
        />
        <StatsCard
          label="Jenis akses"
          value="2"
          helper="relawan dan organizer"
          icon={BadgeCheck}
          tone="dark"
        />
        <StatsCard
          label="Kategori aksi"
          value={home.stats.categoryCount.toString()}
          helper="pendidikan sampai bencana"
          icon={Sparkles}
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm lg:grid-cols-[0.75fr_1.25fr] lg:p-6">
        <div className="rounded-lg bg-deep-green p-5 text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold sm:text-sm">
            <TrendingUp size={16} />
            Fokus SDG 8
          </span>
          <h2 className="mt-5 font-heading text-2xl font-extrabold md:text-4xl">
            Pekerjaan layak dan pertumbuhan ekonomi.
          </h2>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/78">
            Migunani mendukung pengembangan skill, pengalaman kerja sosial, dan
            portofolio kontribusi untuk mahasiswa serta relawan muda.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <SdgPoint
            title="Kesiapan skill"
            description="Relawan memilih peran, mengasah komunikasi, koordinasi, dokumentasi, dan kerja lapangan."
          />
          <SdgPoint
            title="Portofolio terverifikasi"
            description="Dashboard menyimpan jam kontribusi, status aplikasi, dan sertifikat sebagai bukti keaktifan."
          />
          <SdgPoint
            title="Pertumbuhan organizer"
            description="Organisasi mendapat kanal rekrutmen relawan, preview pendaftar, dan performa event."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Shortcut kategori</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Mulai dari isu yang kamu peduli.
            </h2>
          </div>
          <Link
            to={eventsHref}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
          >
            Semua kategori
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {home.categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              to={eventsHref}
              className="rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <CategoryChip category={category} active />
              <h3 className="mt-5 font-heading text-xl font-extrabold">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Event pilihan</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Event pilihan minggu ini.
            </h2>
          </div>
          <Link
            to={eventsHref}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Lihat semua
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {home.featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
              detailPathPrefix={user?.role === 'volunteer' ? '/volunteer/events' : '/events'}
              primaryAction={getFeaturedEventAction(user?.role, event.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function getRoleEvents(role: UserRole) {
  if (role === 'admin') {
    return '/portal/events'
  }

  if (role === 'organizer') {
    return '/organizer/events'
  }

  return '/volunteer/events'
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-3">
      <p className="font-heading text-2xl font-extrabold text-primary-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-primary-foreground/70">
        {label}
      </p>
    </div>
  )
}

function getRoleHome(role: UserRole) {
  if (role === 'admin') {
    return '/portal/dashboard'
  }

  if (role === 'organizer') {
    return '/organizer/dashboard'
  }

  return '/volunteer/dashboard'
}

function getFeaturedEventAction(role: UserRole | undefined, eventId: string) {
  if (role === 'admin') {
    return {
      label: 'Kelola event',
      to: '/portal/events',
    }
  }

  if (role === 'organizer') {
    return {
      label: 'Kelola event',
      to: '/organizer/events',
    }
  }

  if (role === 'volunteer') {
    return {
      label: 'Daftar',
      to: `/volunteer/apply/${eventId}`,
    }
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

function SdgPoint({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-lg border bg-muted p-5">
      <CheckCircle2 size={20} className="text-primary" />
      <h3 className="mt-4 font-heading text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  )
}
