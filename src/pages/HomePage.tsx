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
import { Link } from 'react-router-dom'

import { CategoryChip, EventCard, StatsCard } from '@/components'
import {
  categories,
  events,
  featuredEvents,
  getOrganizerById,
} from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { mapCategory, mapEvent, publicApi } from '@/services/api'

export function HomePage() {
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
    ? `/events?q=${encodeURIComponent(searchQuery.trim())}`
    : '/events'

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <section className="relative min-h-[calc(100svh-6rem)] overflow-hidden rounded-lg border bg-deep-green text-primary-foreground shadow-sm">
        <div className="absolute -left-24 top-8 h-52 w-80 rotate-[-18deg] rounded-[42%] bg-primary opacity-45 blur-2xl" />
        <div className="absolute -right-24 bottom-0 h-64 w-96 rotate-[-22deg] rounded-[45%] bg-secondary opacity-80 blur-2xl" />
        <div className="relative grid min-h-[calc(100svh-6rem)] items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-center gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold">
                <Sparkles size={16} />
                Marketplace volunteer untuk aksi yang berdampak
              </span>
              <h1 className="mt-6 max-w-4xl font-heading text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                Temukan event volunteer yang migunani.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-primary-foreground/78 sm:text-lg">
                Jelajahi kegiatan sosial, pendidikan, lingkungan, dan komunitas.
                Pilih event, daftar sebagai relawan, lalu simpan bukti kontribusimu
                dalam satu dashboard.
              </p>
            </div>

            <form
              className="rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur"
              onSubmit={(event) => {
                event.preventDefault()
                window.location.href = exploreHref
              }}
            >
              <div className="grid gap-2 rounded-md bg-card p-2 text-foreground shadow-sm md:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari cleanup, mentoring, kesehatan..."
                    className="h-12 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold text-muted-foreground outline-none"
                    aria-label="Cari event volunteer"
                  />
                </label>
                <Link
                  to={exploreHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
                >
                  Explore event
                  <ArrowRight size={17} />
                </Link>
              </div>
            </form>
          </div>

          <div className="grid content-center gap-4">
            <div className="rounded-lg border border-black/10 bg-secondary p-5 text-secondary-foreground shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold uppercase">Role relawan</p>
                <span className="flex size-11 items-center justify-center rounded-md bg-brand-black text-white">
                  <HeartHandshake size={20} />
                </span>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-extrabold">
                Cari event, daftar, lalu bangun portofolio kontribusi.
              </h2>
              <p className="mt-3 text-sm leading-6">
                Masuk sebagai relawan untuk membuka apply flow, dashboard aplikasi,
                sertifikat, dan impact summary.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold"
              >
                Masuk sebagai relawan
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="rounded-lg border border-white/15 bg-card p-5 text-foreground shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">
                    Untuk organizer
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-extrabold">
                    Publish event, pantau applicant.
                  </h2>
                </div>
                <span className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Building2 size={22} />
                </span>
              </div>
              <Link
                to="/organizer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
              >
                Masuk sebagai organizer
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <ApiNotice message="Memuat beranda dari API..." tone="loading" />
      ) : null}
      {homeError ? (
        <ApiNotice
          message={`Data API belum tersedia, memakai data tampilan sementara. ${homeError}`}
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
          label="Role akses"
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

      <section className="grid gap-5 rounded-lg border bg-card p-6 shadow-sm lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
        <div className="rounded-lg bg-deep-green p-6 text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold">
            <TrendingUp size={16} />
            SDG 8 Focus
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold md:text-5xl">
            Decent Work and Economic Growth.
          </h2>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/78">
            Migunani mendukung pengembangan skill, pengalaman kerja sosial, dan
            portofolio kontribusi untuk mahasiswa serta relawan muda.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <SdgPoint
            title="Skill readiness"
            description="Relawan memilih role, mengasah komunikasi, koordinasi, dokumentasi, dan kerja lapangan."
          />
          <SdgPoint
            title="Verified portfolio"
            description="Dashboard menyimpan jam kontribusi, status aplikasi, dan sertifikat sebagai bukti keaktifan."
          />
          <SdgPoint
            title="Organizer growth"
            description="Organisasi mendapat kanal rekrutmen relawan, applicant preview, dan performa event."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Category shortcuts</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold">
              Mulai dari isu yang kamu peduli.
            </h2>
          </div>
          <Link
            to="/events"
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
              to="/events"
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
            <p className="text-sm font-bold uppercase text-primary">Featured events</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold">
              Event pilihan minggu ini.
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            Explore semua
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {home.featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
            />
          ))}
        </div>
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

function SdgPoint({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-lg border bg-muted p-5">
      <CheckCircle2 size={20} className="text-primary" />
      <h3 className="mt-4 font-heading text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  )
}
