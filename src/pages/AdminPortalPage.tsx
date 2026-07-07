import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { LoadingModal } from '@/components'
import { useAuth } from '@/providers/useAuth'
import type { FormEvent } from 'react'
import type { UserRole } from '@/types/migunani'

export function AdminPortalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, status } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const nextParam = searchParams.get('next')
  const nextHref = nextParam?.startsWith('/portal/')
    ? nextParam
    : '/portal/dashboard'
  const isSubmitting = status === 'loading' || isRedirecting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError(null)
    setIsRedirecting(true)

    try {
      const [user] = await Promise.all([login({ email, password }), wait(650)])
      navigate(user.role === 'admin' ? nextHref : getRoleHome(user.role), {
        replace: true,
      })
    } catch (error) {
      setLoginError(getErrorMessage(error))
      setIsRedirecting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl items-center py-8">
      <LoadingModal
        open={isSubmitting}
        title="Memeriksa akses admin"
        description="Kami sedang memvalidasi akses dan menyiapkan portal super admin."
      />
      <section className="grid w-full gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            Portal Super Admin
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Portal admin platform Migunani.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            Akses dashboard super admin untuk memantau seluruh pengguna, event,
            organizer, dan statistik global platform Migunani.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/?next=%2Fvolunteer%2Fdashboard"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              Masuk sebagai Relawan →
            </Link>
            <Link
              to="/?next=%2Forganizer%2Fdashboard"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              Masuk sebagai Organizer →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-8 shadow-sm"
          >
            <span className="flex size-14 items-center justify-center rounded-md bg-deep-green text-primary-foreground">
              <ShieldCheck size={28} />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-extrabold">Super Admin</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Kelola seluruh platform Migunani: pantau pengguna, review event yang
              dipublikasikan, verifikasi organizer, dan lihat statistik pertumbuhan.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-md border bg-muted p-3 text-sm font-semibold text-muted-foreground">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-foreground">Email</span>
                  <input
                    required
                    type="email"
                    placeholder="admin@migunani.id"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
              </div>
              <div className="rounded-md border bg-muted p-3 text-sm font-semibold text-muted-foreground">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-foreground">Password</span>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
              </div>
            </div>

            {loginError ? (
              <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {loginError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk sebagai Super Admin'}
              <ArrowRight size={17} />
            </button>
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Akses akun admin dengan aman untuk mengelola platform Migunani.
            </p>
          </form>
        </div>
      </section>
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Login gagal. Periksa email dan password.'
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
