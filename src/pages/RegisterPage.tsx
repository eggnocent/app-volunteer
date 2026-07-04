import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  HeartHandshake,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { categories } from '@/data'
import { cn } from '@/lib/utils'
import type { EventCategory } from '@/types/migunani'
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
  const [stage, setStage] = useState<'form' | 'onboarding' | 'success'>('form')
  const [isSaving, setIsSaving] = useState(false)
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
  const loginHref = isOrganizer ? '/organizer' : '/login'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStage('onboarding')
  }

  function finishOnboarding() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setStage('success')
    }, 1100)
  }

  if (stage === 'success') {
    return (
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
              Ini masih simulasi frontend. Pada produk nyata, data akan diproses
              melalui backend dan sesi login akan dibuat setelah verifikasi.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-6 sm:flex-row">
            <Link
              to={dashboardHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              Masuk ke dashboard
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
    )
  }

  if (stage === 'onboarding') {
    return (
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
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              {isSaving ? (
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
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-6xl items-center py-8">
      <section className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border bg-deep-green p-8 text-primary-foreground shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-md bg-secondary font-heading text-2xl font-extrabold text-secondary-foreground">
            M
          </span>
          <p className="mt-8 text-sm font-bold uppercase text-primary-foreground/70">
            {isOrganizer ? 'Register Organizer' : 'Register Relawan'}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            {isOrganizer
              ? 'Daftarkan organisasi untuk mulai membuka event.'
              : 'Buat akun relawan Migunani.'}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/78">
            {isOrganizer
              ? 'Path organizer sudah terpisah, jadi form ini langsung membuat akun organizer tanpa pilihan role tambahan.'
              : 'Path relawan sudah terpisah, jadi form ini langsung membuat akun relawan tanpa pilihan role tambahan.'}
          </p>
          <div className="mt-8 space-y-3">
            <FeatureRow
              icon={<BadgeCheck size={15} />}
              label={isOrganizer ? 'Publish event volunteer' : 'Simpan riwayat aplikasi'}
            />
            <FeatureRow
              icon={isOrganizer ? <Building2 size={15} /> : <HeartHandshake size={15} />}
              label={
                isOrganizer
                  ? 'Kelola applicant dan performa event'
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
                ? 'Isi informasi dasar organisasi. Setelah submit, prototype langsung membuka dashboard organizer.'
                : 'Isi informasi dasar relawan. Setelah submit, prototype langsung membuka dashboard relawan.'}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Field
                label={isOrganizer ? 'Nama organisasi' : 'Nama lengkap'}
                className="md:col-span-2"
              >
                <input
                  required
                  placeholder={isOrganizer ? 'Komunitas Peduli Kota' : 'Nadira Putri'}
                  className={inputClassName}
                />
              </Field>

              <Field label="Email">
                <input
                  required
                  type="email"
                  placeholder={isOrganizer ? 'organizer@migunani.id' : 'relawan@migunani.id'}
                  className={inputClassName}
                />
              </Field>

              <Field label="Nomor WhatsApp">
                <input
                  required
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className={inputClassName}
                />
              </Field>

              {isOrganizer ? (
                <>
                  <Field label="Tipe organisasi">
                    <select required className={inputClassName}>
                      <option value="">Pilih tipe</option>
                      <option>Komunitas</option>
                      <option>Yayasan</option>
                      <option>Kampus</option>
                      <option>Non-profit</option>
                    </select>
                  </Field>
                  <Field label="Kota">
                    <input required placeholder="Yogyakarta" className={inputClassName} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Universitas / komunitas">
                    <input
                      required
                      placeholder="Universitas Gadjah Mada"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Kota">
                    <input required placeholder="Yogyakarta" className={inputClassName} />
                  </Field>
                </>
              )}

              <Field label="Password">
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  className={inputClassName}
                />
              </Field>

              <Field label="Konfirmasi password">
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Ulangi password"
                  className={inputClassName}
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              {isOrganizer ? 'Daftar sebagai Organizer' : 'Daftar sebagai Relawan'}
              <ArrowRight size={17} />
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
