import { ArrowRight, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function OrganizerLoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl items-center py-8">
      <section className="grid w-full gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            Login Organizer
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Masuk sebagai organizer Migunani.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            Akses dashboard organizer untuk publish event volunteer, kelola
            applicant, pantau keterisian kuota, dan siapkan kegiatan berikutnya.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              Masuk sebagai Relawan →
            </Link>
            <Link
              to="/portal"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              Masuk sebagai Super Admin →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <article className="rounded-lg border bg-card p-8 shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Building2 size={28} />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-extrabold">Organizer</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Publish event volunteer, review dan kelola pendaftar, pantau keterisian
              kuota, dan evaluasi performa kegiatan dari satu dashboard.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-md border bg-muted p-3 text-sm font-semibold text-muted-foreground">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-foreground">Email</span>
                  <input
                    type="email"
                    placeholder="organizer@migunani.id"
                    className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                    readOnly
                    defaultValue="bagus.setiawan@mail.com"
                  />
                </label>
              </div>
              <div className="rounded-md border bg-muted p-3 text-sm font-semibold text-muted-foreground">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-foreground">Password</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                    readOnly
                    defaultValue="prototype123"
                  />
                </label>
              </div>
            </div>

            <Link
              to="/organizer/dashboard"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              Masuk sebagai Organizer
              <ArrowRight size={17} />
            </Link>
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Prototype — login tanpa backend, langsung masuk ke dashboard.
            </p>
            <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
              Belum punya akun organizer?{' '}
              <Link
                to="/organizer/register"
                className="text-primary transition hover:text-deep-green"
              >
                Daftar di sini
              </Link>
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
