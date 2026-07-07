import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  HeartHandshake,
  UserPlus,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { LoadingModal } from '@/components'
import { categories } from '@/data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/useAuth'
import type { ApiRegisterPayload } from '@/services/api/types'
import type { EventCategory, UserRole } from '@/types/migunani'
import type { FormEvent } from 'react'

type RegisterPageProps = {
  role: 'volunteer' | 'organizer'
}

const inputClassName =
  'mt-1.5 h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15'

const volunteerSkillOptions = [
  'Mengajar anak',
  'Dokumentasi',
  'Public speaking',
  'Logistik',
  'Komunikasi warga',
]

const availabilityOptions = [
  'Weekend pagi',
  'Weekend sore',
  'Malam hari',
  'Online',
  'Full day event',
]

const organizerFocusOptions = [
  'Pendidikan',
  'Lingkungan',
  'Kesehatan',
  'Sosial',
  'Komunitas',
]

export function RegisterPage({ role }: RegisterPageProps) {
  const [searchParams] = useSearchParams()
  const { register, status, user } = useAuth()
  const [stage, setStage] = useState<'form' | 'onboarding' | 'success'>('form')
  const [isPreparingNextStep, setIsPreparingNextStep] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [pendingPayload, setPendingPayload] =
    useState<ApiRegisterPayload | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<EventCategory[]>([
    'Pendidikan',
  ])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Public speaking',
    'Dokumentasi',
  ])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([
    'Weekend pagi',
  ])
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    'Pendidikan',
    'Komunitas',
  ])
  const isOrganizer = role === 'organizer'
  const nextParam = searchParams.get('next')
  const dashboardHref =
    !isOrganizer && nextParam?.startsWith('/volunteer/')
      ? nextParam
      : isOrganizer
        ? '/organizer/dashboard'
        : '/volunteer/dashboard'
  const dashboardCtaLabel = dashboardHref.startsWith('/volunteer/apply/')
    ? 'Lanjutkan pendaftaran'
    : 'Masuk ke dashboard'
  const loginHref = isOrganizer
    ? '/?next=%2Forganizer%2Fdashboard'
    : nextParam?.startsWith('/volunteer/')
      ? `/?next=${encodeURIComponent(nextParam)}`
      : '/'

  if (stage === 'form' && status === 'authenticated' && user) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRegisterError(null)
    const formData = new FormData(event.currentTarget)
    const password = getFormString(formData, 'password')
    const passwordConfirmation = getFormString(formData, 'password_confirmation')

    if (password !== passwordConfirmation) {
      setRegisterError('Konfirmasi password belum sama.')
      return
    }

    const name = getFormString(formData, 'name')

    setPendingPayload({
      name,
      email: getFormString(formData, 'email'),
      password,
      password_confirmation: passwordConfirmation,
      role,
      phone: getFormString(formData, 'phone'),
      city: getFormString(formData, 'city'),
      organizationName: isOrganizer ? name : undefined,
      organizationType: isOrganizer
        ? getFormString(formData, 'organizationType')
        : undefined,
      university: isOrganizer ? undefined : getFormString(formData, 'university'),
    })

    setIsPreparingNextStep(true)
    await wait(650)
    setIsPreparingNextStep(false)
    setStage('onboarding')
  }

  async function finishOnboarding() {
    if (!pendingPayload) {
      setStage('form')
      return
    }

    setIsSaving(true)
    setRegisterError(null)

    try {
      await Promise.all([register(pendingPayload), wait(650)])
      setIsSaving(false)
      setStage('success')
    } catch (error) {
      setRegisterError(getErrorMessage(error))
      setIsSaving(false)
    }
  }

  if (stage === 'success') {
    return (
      <StageTransition stage={stage}>
        <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-3xl items-center py-8">
          <section className="w-full overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="bg-deep-green p-8 text-primary-foreground">
              <span className="flex size-14 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <CheckCircle2 size={28} />
              </span>
              <p className="mt-6 text-sm font-bold uppercase text-primary-foreground/70">
                Register berhasil
              </p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-5xl">
                Akun {isOrganizer ? 'organizer' : 'relawan'} siap digunakan.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-primary-foreground/78">
                Akunmu sudah aktif. Kamu bisa langsung melanjutkan aktivitas
                Migunani sesuai tujuanmu.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <Link
                to={dashboardHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
              >
                {dashboardCtaLabel}
                <ArrowRight size={17} />
              </Link>
              <Link
                to={loginHref}
                className="inline-flex h-11 items-center justify-center rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted"
              >
                Kembali ke login
              </Link>
            </div>
          </section>
        </div>
      </StageTransition>
    )
  }

  if (stage === 'onboarding') {
    return (
      <StageTransition stage={stage}>
        <LoadingModal
          open={isSaving || status === 'loading'}
          title="Menyiapkan akun"
          description="Kami sedang menyimpan preferensi dan menyiapkan dashboard pertamamu."
        />
        <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl items-center py-8">
          <section className="w-full rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-bold uppercase text-primary">
                Onboarding {isOrganizer ? 'Organizer' : 'Relawan'}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-5xl">
                {isOrganizer
                  ? 'Lengkapi profil organisasi.'
                  : 'Atur preferensi volunteer.'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {isOrganizer
                  ? 'Data ini dipakai untuk membuat dashboard organizer terasa siap menjalankan event pertama.'
                  : 'Data ini dipakai untuk menampilkan rekomendasi event dan match score yang lebih relevan.'}
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <BadgeCheck size={24} />
            </span>
          </div>

          {isOrganizer ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-6">
                <ChoiceSection title="Fokus isu organisasi">
                  {organizerFocusOptions.map((focus) => (
                    <ChoiceButton
                      key={focus}
                      active={selectedFocus.includes(focus)}
                      onClick={() => toggleString(selectedFocus, focus, setSelectedFocus)}
                    >
                      {focus}
                    </ChoiceButton>
                  ))}
                </ChoiceSection>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Kontak PIC">
                    <input placeholder="Bagus Setiawan" className={inputClassName} />
                  </Field>
                  <Field label="Estimasi event per bulan">
                    <select className={inputClassName} defaultValue="2-4 event">
                      <option>1 event</option>
                      <option>2-4 event</option>
                      <option>5+ event</option>
                    </select>
                  </Field>
                </div>
              </div>

              <aside className="rounded-lg border bg-deep-green p-5 text-primary-foreground">
                <p className="text-sm font-bold uppercase text-primary-foreground/70">
                  Setup summary
                </p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold">
                  Dashboard organizer siap.
                </h2>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/78">
                  Fokus isu akan muncul sebagai insight awal untuk membuat event dan
                  membaca demand kategori.
                </p>
              </aside>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <ChoiceSection title="Minat kategori">
                {categories.map((category) => (
                  <ChoiceButton
                    key={category.id}
                    active={selectedInterests.includes(category.name)}
                    onClick={() =>
                      toggleCategory(selectedInterests, category.name, setSelectedInterests)
                    }
                  >
                    {category.name}
                  </ChoiceButton>
                ))}
              </ChoiceSection>

              <ChoiceSection title="Skill yang ingin dipakai">
                {volunteerSkillOptions.map((skill) => (
                  <ChoiceButton
                    key={skill}
                    active={selectedSkills.includes(skill)}
                    onClick={() => toggleString(selectedSkills, skill, setSelectedSkills)}
                  >
                    {skill}
                  </ChoiceButton>
                ))}
              </ChoiceSection>

              <ChoiceSection title="Ketersediaan waktu">
                {availabilityOptions.map((availability) => (
                  <ChoiceButton
                    key={availability}
                    active={selectedAvailability.includes(availability)}
                    onClick={() =>
                      toggleString(
                        selectedAvailability,
                        availability,
                        setSelectedAvailability,
                      )
                    }
                  >
                    {availability}
                  </ChoiceButton>
                ))}
              </ChoiceSection>
            </div>
          )}

          {registerError ? (
            <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              {registerError}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStage('form')}
              className="inline-flex h-11 items-center justify-center rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={finishOnboarding}
              disabled={isSaving || status === 'loading'}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving || status === 'loading' ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan onboarding
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
          </section>
        </div>
      </StageTransition>
    )
  }

  return (
    <StageTransition stage={stage}>
      <LoadingModal
        open={isPreparingNextStep}
        title={isOrganizer ? 'Menyiapkan onboarding organizer' : 'Menyiapkan onboarding relawan'}
        description="Sebentar, kami sedang menyiapkan langkah berikutnya agar transisi halaman tetap jelas."
      />
      <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-6xl items-center py-8">
        <section className="grid w-full min-w-0 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0 rounded-lg border bg-deep-green p-6 text-primary-foreground shadow-sm sm:p-8">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            {isOrganizer ? 'Register Organizer' : 'Register Relawan'}
          </p>
          <h1 className="mt-3 max-w-[19rem] break-words font-heading text-4xl font-extrabold leading-tight sm:max-w-xl sm:text-5xl">
            {isOrganizer
              ? 'Daftarkan organisasi untuk mulai membuka event.'
              : 'Buat akun relawan Migunani.'}
          </h1>
          <p className="mt-5 max-w-[19rem] break-words text-sm leading-7 text-primary-foreground/78 sm:max-w-xl sm:text-base sm:leading-8">
            {isOrganizer
              ? 'Form ini dibuat khusus untuk organisasi yang ingin membuka dan mengelola event.'
              : 'Form ini dibuat khusus untuk relawan yang ingin mengikuti kegiatan Migunani.'}
          </p>
          <div className="mt-8 space-y-3">
            <FeatureRow
              icon={<BadgeCheck size={15} />}
              label={isOrganizer ? 'Publikasikan event relawan' : 'Simpan riwayat aplikasi'}
            />
            <FeatureRow
              icon={isOrganizer ? <Building2 size={15} /> : <HeartHandshake size={15} />}
              label={
                isOrganizer
                  ? 'Kelola pendaftar dan performa event'
                  : 'Kumpulkan jam kontribusi dan sertifikat'
              }
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-8 shadow-sm"
          >
            <span
              className={`flex size-14 items-center justify-center rounded-md ${
                isOrganizer
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {isOrganizer ? <Building2 size={28} /> : <UserPlus size={28} />}
            </span>
            <h2 className="mt-6 font-heading text-3xl font-extrabold">
              {isOrganizer ? 'Akun Organizer' : 'Akun Relawan'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {isOrganizer
                ? 'Isi informasi dasar organisasi untuk menyiapkan akses organizer.'
                : 'Isi informasi dasar relawan untuk menyiapkan akses dashboard.'}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Field
                label={isOrganizer ? 'Nama organisasi' : 'Nama lengkap'}
                className="md:col-span-2"
              >
                <input
                  required
                  name="name"
                  placeholder={isOrganizer ? 'Komunitas Peduli Kota' : 'Nama relawan'}
                  className={inputClassName}
                />
              </Field>

              <Field label="Email">
                <input
                  required
                  name="email"
                  type="email"
                  placeholder={isOrganizer ? 'organizer@migunani.id' : 'relawan@migunani.id'}
                  className={inputClassName}
                />
              </Field>

              <Field label="Nomor WhatsApp">
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className={inputClassName}
                />
              </Field>

              {isOrganizer ? (
                <>
                  <Field label="Tipe organisasi">
                    <select required name="organizationType" className={inputClassName}>
                      <option value="">Pilih tipe</option>
                      <option>Komunitas</option>
                      <option>Yayasan</option>
                      <option>Kampus</option>
                      <option>Non-profit</option>
                    </select>
                  </Field>
                  <Field label="Kota">
                    <input required name="city" placeholder="Yogyakarta" className={inputClassName} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Universitas / komunitas">
                    <input
                      required
                      name="university"
                      placeholder="Universitas Gadjah Mada"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Kota">
                    <input required name="city" placeholder="Yogyakarta" className={inputClassName} />
                  </Field>
                </>
              )}

              <Field label="Password">
                <input
                  required
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  className={inputClassName}
                />
              </Field>

              <Field label="Konfirmasi password">
                <input
                  required
                  name="password_confirmation"
                  type="password"
                  minLength={8}
                  placeholder="Ulangi password"
                  className={inputClassName}
                />
              </Field>
            </div>

            {registerError ? (
              <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {registerError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPreparingNextStep}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPreparingNextStep ? (
                'Menyiapkan...'
              ) : (
                <>
                  {isOrganizer ? 'Daftar sebagai Organizer' : 'Daftar sebagai Relawan'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to={loginHref} className="text-primary transition hover:text-deep-green">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
        </section>
      </div>
    </StageTransition>
  )
}

function StageTransition({
  stage,
  children,
}: {
  stage: string
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 16, filter: 'blur(2px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(2px)' }}
        transition={{
          duration: 0.36,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={className}>
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function FeatureRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/78">
      {icon}
      {label}
    </span>
  )
}

function ChoiceSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="text-sm font-bold text-foreground">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-bold transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {children}
    </button>
  )
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === 'string' ? value.trim() : ''
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Register gagal. Periksa kembali data akun.'
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

function toggleString(
  current: string[],
  value: string,
  setValue: (next: string[]) => void,
) {
  setValue(
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  )
}

function toggleCategory(
  current: EventCategory[],
  value: EventCategory,
  setValue: (next: EventCategory[]) => void,
) {
  setValue(
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  )
}
