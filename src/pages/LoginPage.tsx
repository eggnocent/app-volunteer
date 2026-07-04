import { ArrowRight, Building2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const nextParam = searchParams.get('next')
  const nextHref = nextParam?.startsWith('/volunteer/')
    ? nextParam
    : '/volunteer/dashboard'
  const registerHref =
    nextHref === '/volunteer/dashboard'
      ? '/register'
      : `/register?next=${encodeURIComponent(nextHref)}`

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl items-center py-8">
      <section className="grid w-full gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            Login Relawan
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Masuk sebagai relawan Migunani.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            Akses dashboard relawan untuk menjelajahi event, mendaftar kegiatan,
            memantau aplikasi, dan mengumpulkan sertifikat kontribusi.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/organizer"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              <Building2 size={14} />
              Masuk sebagai Organizer →
            </Link>
            <Link
              to="/portal"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              <ShieldCheck size={14} />
              Masuk sebagai Super Admin →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <article className="rounded-lg border bg-card p-8 shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <HeartHandshake size={28} />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-extrabold">Relawan</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Cari event volunteer, daftar kegiatan sosial, pantau status aplikasi,
              dan kumpulkan sertifikat kontribusi untuk portofolio keaktifanmu.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Email</span>
                <input
                  type="email"
                  placeholder="relawan@migunani.id"
                  className="mt-1.5 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  readOnly
                  defaultValue="nadira.putri@mail.com"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  readOnly
                  defaultValue="prototype123"
                />
              </label>
            </div>

            <Link
              to={nextHref}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              {nextHref === '/volunteer/dashboard'
                ? 'Masuk sebagai Relawan'
                : 'Masuk dan lanjut daftar event'}
              <ArrowRight size={17} />
            </Link>
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Prototype — login tanpa backend, langsung masuk ke dashboard.
            </p>
            <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
              Belum punya akun relawan?{' '}
              <Link
                to={registerHref}
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
