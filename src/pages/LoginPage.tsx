import { ArrowRight, Building2, HeartHandshake } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/providers/useAuth'
import type { FormEvent } from 'react'
import type { UserRole } from '@/types/migunani'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, refresh, status, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const nextParam = searchParams.get('next')
  const nextHref = getSafeNextHref(nextParam)
  const registerHref = nextHref.startsWith('/organizer/')
    ? '/organizer/register'
    : nextHref === '/volunteer/dashboard'
      ? '/register'
      : `/register?next=${encodeURIComponent(nextHref)}`
  const registerLabel = nextHref.startsWith('/organizer/')
    ? 'Belum punya akun organizer?'
    : 'Belum punya akun relawan?'
  const canRegister = !nextHref.startsWith('/portal/')
  const isSubmitting = status === 'loading'

  useEffect(() => {
    if (status === 'idle') {
      void refresh()
    }
  }, [refresh, status])

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate(isNextAllowedForRole(nextHref, user.role) ? nextHref : getRoleHome(user.role), {
        replace: true,
      })
    }
  }, [navigate, nextHref, status, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError(null)

    try {
      const user = await login({ email, password })
      navigate(isNextAllowedForRole(nextHref, user.role) ? nextHref : getRoleHome(user.role), {
        replace: true,
      })
    } catch (error) {
      setLoginError(getErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl items-center py-8">
      <section className="grid w-full gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            Login Migunani
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Satu akses untuk semua aktivitas Migunani.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            Kelola perjalananmu sebagai relawan, organizer, atau admin dari akun
            yang sama. Setelah masuk, kamu akan diarahkan ke ruang kerja yang
            sesuai dengan aksesmu.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/home"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              <HeartHandshake size={14} />
              Lihat halaman discover →
            </Link>
            <Link
              to="/organizer/register"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/60 transition hover:text-primary-foreground"
            >
              <Building2 size={14} />
              Daftar organizer →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-8 shadow-sm"
          >
            <span className="flex size-14 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <HeartHandshake size={28} />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-extrabold">Login Akun</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Gunakan email dan password yang terdaftar untuk melanjutkan ke
              dashboard Migunani.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Email</span>
                <input
                  required
                  type="email"
                  placeholder="nama@migunani.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Password</span>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </div>

            {loginError ? (
              <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {loginError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? 'Memproses...'
                : nextHref === '/volunteer/dashboard'
                  ? 'Masuk ke Migunani'
                  : 'Masuk dan lanjutkan'}
              <ArrowRight size={17} />
            </button>
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Akses akunmu dengan aman untuk melanjutkan aktivitas di Migunani.
            </p>
            {canRegister ? (
              <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
                {registerLabel}{' '}
                <Link
                  to={registerHref}
                  className="text-primary transition hover:text-deep-green"
                >
                  Daftar di sini
                </Link>
              </p>
            ) : null}
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

function getSafeNextHref(nextParam: string | null) {
  if (
    nextParam?.startsWith('/volunteer/') ||
    nextParam?.startsWith('/organizer/') ||
    nextParam?.startsWith('/portal/')
  ) {
    return nextParam
  }

  return '/volunteer/dashboard'
}

function isNextAllowedForRole(nextHref: string, role: UserRole) {
  if (role === 'admin') {
    return nextHref.startsWith('/portal/')
  }

  if (role === 'organizer') {
    return nextHref.startsWith('/organizer/')
  }

  return nextHref.startsWith('/volunteer/')
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Login gagal. Periksa email dan password.'
}
