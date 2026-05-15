import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryChip, EventCard, StatsCard } from '@/components'
import {
  categories,
  events,
  featuredEvents,
  getOrganizerById,
  volunteerProfile,
} from '@/data'

export function HomePage() {
  const totalSlots = events.reduce((sum, event) => sum + event.quota, 0)
  const totalRegistered = events.reduce((sum, event) => sum + event.registered, 0)

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <section className="relative overflow-hidden rounded-lg border bg-deep-green text-primary-foreground shadow-sm">
        <div className="absolute -left-24 top-8 h-52 w-80 rotate-[-18deg] rounded-[42%] bg-primary opacity-50" />
        <div className="absolute -right-24 bottom-0 h-64 w-96 rotate-[-22deg] rounded-[45%] bg-secondary opacity-90" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex min-h-[460px] flex-col justify-between gap-8">
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

            <div className="rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur">
              <div className="grid gap-2 rounded-md bg-card p-2 text-foreground shadow-sm md:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    readOnly
                    value="Cari cleanup, mentoring, kesehatan..."
                    className="h-12 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold text-muted-foreground outline-none"
                    aria-label="Search preview"
                  />
                </label>
                <Link
                  to="/events"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
                >
                  Explore event
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid content-end gap-4">
            <div className="rounded-lg border border-black/10 bg-secondary p-5 text-secondary-foreground shadow-sm">
              <p className="text-sm font-bold uppercase">Untuk relawan</p>
              <h2 className="mt-3 font-heading text-3xl font-extrabold">
                {volunteerProfile.totalHours} jam kontribusi tersimpan.
              </h2>
              <p className="mt-3 text-sm leading-6">
                Dashboard relawan menyiapkan status aplikasi, sertifikat, dan
                ringkasan impact untuk kebutuhan portofolio keaktifan.
              </p>
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
                Lihat dashboard organizer
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Event tersedia"
          value={events.length.toString()}
          helper="lintas kategori sosial"
          icon={CalendarDays}
          tone="green"
        />
        <StatsCard
          label="Slot relawan"
          value={totalSlots.toString()}
          helper={`${totalRegistered} pendaftar aktif`}
          icon={Users}
          tone="yellow"
        />
        <StatsCard
          label="Sertifikat relawan"
          value={volunteerProfile.certificates.toString()}
          helper="siap untuk portofolio"
          icon={BadgeCheck}
          tone="dark"
        />
        <StatsCard
          label="Kategori aksi"
          value={categories.length.toString()}
          helper="pendidikan sampai bencana"
          icon={Sparkles}
          tone="neutral"
        />
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
          {categories.slice(0, 4).map((category) => (
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
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={getOrganizerById(event.organizerId)}
              saved={volunteerProfile.savedEventIds.includes(event.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
