import { ArrowRight, Building2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-6xl items-center py-8">
      <section className="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            Role Gateway
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
            Masuk sesuai cara kamu berkontribusi.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            Prototype ini memakai login simulasi. Pilih role untuk membuka alur
            relawan atau organizer tanpa backend dan tanpa database.
          </p>
          {next ? (
            <div className="mt-6 rounded-md border border-white/15 bg-white/10 p-4 text-sm font-semibold">
              Setelah memilih role, kamu akan lanjut ke halaman yang diminta.
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RoleCard
            icon={<HeartHandshake size={24} />}
            title="Relawan"
            description="Cari event, daftar kegiatan, pantau aplikasi, dan kumpulkan sertifikat kontribusi."
            to={next?.startsWith('/volunteer') ? next : '/volunteer/dashboard'}
            action="Masuk sebagai Relawan"
          />
          <RoleCard
            icon={<Building2 size={24} />}
            title="Organizer"
            description="Publish event, kelola applicant, pantau keterisian, dan siapkan event berikutnya."
            to={next?.startsWith('/organizer') ? next : '/organizer'}
            action="Masuk sebagai Organizer"
            featured
          />
        </div>
      </section>
    </div>
  )
}

function RoleCard({
  icon,
  title,
  description,
  to,
  action,
  featured = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  to: string
  action: string
  featured?: boolean
}) {
  return (
    <article className="flex min-h-[420px] flex-col justify-between rounded-lg border bg-card p-6 shadow-sm">
      <div>
        <span className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </span>
        <div className="mt-8 flex items-center gap-2">
          <h2 className="font-heading text-3xl font-extrabold">{title}</h2>
          {featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold">
              <ShieldCheck size={13} />
              Organizer
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      <Link
        to={to}
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
      >
        {action}
        <ArrowRight size={17} />
      </Link>
    </article>
  )
}
