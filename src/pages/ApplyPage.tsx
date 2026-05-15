import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MessageSquareText,
  Send,
  UserRoundCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  CategoryChip,
  EventDetailPanel,
  PageHeader,
  RegistrationStepper,
  type RegistrationStep,
} from '@/components'
import { getEventById, getOrganizerById, volunteerProfile } from '@/data'
import { formatDate, formatEventTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PagePlaceholder } from '@/pages/PagePlaceholder'
import type { VolunteerRole } from '@/types/migunani'

const registrationSteps: RegistrationStep[] = [
  {
    id: 'role',
    label: 'Role',
    description: 'Pilih kontribusi',
  },
  {
    id: 'motivation',
    label: 'Motivasi',
    description: 'Ceritakan alasan',
  },
  {
    id: 'availability',
    label: 'Waktu',
    description: 'Konfirmasi jadwal',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Cek dan kirim',
  },
]

const availabilityOptions = [
  'Siap hadir dari awal kegiatan',
  'Bisa ikut briefing online',
  'Bersedia dokumentasi kegiatan',
  'Bersedia membantu persiapan logistik',
  'Butuh surat tugas dari organizer',
]

export function ApplyPage() {
  const { eventId } = useParams()
  const event = eventId ? getEventById(eventId) : undefined
  const organizer = event ? getOrganizerById(event.organizerId) : undefined
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<VolunteerRole | ''>(
    event?.roles[0] ?? '',
  )
  const [motivation, setMotivation] = useState(
    'Saya ingin berkontribusi langsung dan belajar bekerja bersama komunitas.',
  )
  const [availability, setAvailability] = useState<string[]>([
    'Siap hadir dari awal kegiatan',
    'Bisa ikut briefing online',
  ])
  const [submitted, setSubmitted] = useState(false)

  const canContinue = useMemo(() => {
    if (currentStep === 0) {
      return selectedRole.length > 0
    }

    if (currentStep === 1) {
      return motivation.trim().length >= 24
    }

    if (currentStep === 2) {
      return availability.length > 0
    }

    return true
  }, [availability.length, currentStep, motivation, selectedRole])

  if (!event) {
    return (
      <PagePlaceholder
        eyebrow="Apply"
        title="Event tidak ditemukan."
        description="Pilih event dari halaman Explore untuk membuka flow pendaftaran relawan."
      />
    )
  }

  function toggleAvailability(option: string) {
    setAvailability((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    )
  }

  function goNext() {
    if (currentStep < registrationSteps.length - 1) {
      setCurrentStep((step) => step + 1)
      return
    }

    setSubmitted(true)
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-4xl pb-20 lg:pb-0">
        <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="bg-deep-green p-8 text-primary-foreground">
            <span className="flex size-14 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <CheckCircle2 size={28} />
            </span>
            <p className="mt-6 text-sm font-bold uppercase text-primary-foreground/70">
              Pendaftaran terkirim
            </p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-5xl">
              Kamu terdaftar untuk {event.title}.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-primary-foreground/78">
              Organizer akan meninjau aplikasimu. Status pendaftaran bisa kamu
              pantau dari dashboard relawan.
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <SummaryTile label="Role" value={selectedRole} />
            <SummaryTile label="Organizer" value={organizer?.name ?? 'Organizer'} />
            <SummaryTile label="Tanggal" value={formatDate(event.date)} />
          </div>
          <div className="flex flex-col gap-3 border-t p-6 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              Buka dashboard
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/events"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted"
            >
              Cari event lain
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link
        to={`/events/${event.slug}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Kembali ke detail event
      </Link>

      <PageHeader
        eyebrow="Apply / Registration Flow"
        title={`Daftar untuk ${event.title}`}
        description="Isi pendaftaran singkat ini untuk membantu organizer memahami role, motivasi, dan kesiapan waktumu."
      />

      <RegistrationStepper steps={registrationSteps} currentStep={currentStep} />

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {currentStep === 0 ? (
            <RoleStep
              roles={event.roles}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
            />
          ) : null}

          {currentStep === 1 ? (
            <MotivationStep motivation={motivation} onMotivationChange={setMotivation} />
          ) : null}

          {currentStep === 2 ? (
            <AvailabilityStep
              selectedOptions={availability}
              onToggleOption={toggleAvailability}
            />
          ) : null}

          {currentStep === 3 ? (
            <ReviewStep
              eventTitle={event.title}
              selectedRole={selectedRole}
              motivation={motivation}
              availability={availability}
            />
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-card px-5 text-sm font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={17} />
              Kembali
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentStep === registrationSteps.length - 1 ? 'Kirim aplikasi' : 'Lanjut'}
              {currentStep === registrationSteps.length - 1 ? (
                <Send size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <EventSummaryCard eventId={event.id} />
          <EventDetailPanel event={event} organizer={organizer} />
        </div>
      </section>
    </div>
  )
}

function RoleStep({
  roles,
  selectedRole,
  onSelectRole,
}: {
  roles: VolunteerRole[]
  selectedRole: VolunteerRole | ''
  onSelectRole: (role: VolunteerRole) => void
}) {
  return (
    <div>
      <StepTitle
        icon={<UserRoundCheck size={20} />}
        title="Pilih role volunteer"
        description="Pilih role yang paling sesuai dengan skill dan energi yang ingin kamu bawa."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onSelectRole(role)}
            className={cn(
              'rounded-lg border bg-background p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent',
              selectedRole === role && 'border-primary bg-accent ring-2 ring-primary/15',
            )}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-heading text-lg font-extrabold">{role}</span>
              {selectedRole === role ? (
                <CheckCircle2 size={19} className="text-primary" />
              ) : null}
            </span>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cocok untuk kontribusi terarah dengan koordinasi dari organizer.
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function MotivationStep({
  motivation,
  onMotivationChange,
}: {
  motivation: string
  onMotivationChange: (value: string) => void
}) {
  return (
    <div>
      <StepTitle
        icon={<MessageSquareText size={20} />}
        title="Tulis motivasimu"
        description="Organizer memakai jawaban ini untuk memahami kesiapan dan minatmu."
      />
      <textarea
        value={motivation}
        onChange={(event) => onMotivationChange(event.target.value)}
        rows={8}
        className="mt-6 w-full resize-none rounded-lg border bg-background p-4 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        placeholder="Ceritakan alasanmu ingin ikut event ini..."
      />
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        Minimal 24 karakter. Saat ini {motivation.trim().length} karakter.
      </p>
    </div>
  )
}

function AvailabilityStep({
  selectedOptions,
  onToggleOption,
}: {
  selectedOptions: string[]
  onToggleOption: (option: string) => void
}) {
  return (
    <div>
      <StepTitle
        icon={<CalendarCheck size={20} />}
        title="Konfirmasi ketersediaan"
        description="Pilih kondisi yang sesuai agar organizer bisa menempatkanmu di tim yang tepat."
      />
      <div className="mt-6 grid gap-3">
        {availabilityOptions.map((option) => {
          const checked = selectedOptions.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggleOption(option)}
              className={cn(
                'flex items-center justify-between gap-4 rounded-lg border bg-background p-4 text-left text-sm font-bold transition hover:border-primary/40 hover:bg-accent',
                checked && 'border-primary bg-accent ring-2 ring-primary/15',
              )}
            >
              <span>{option}</span>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border',
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card',
                )}
              >
                {checked ? <CheckCircle2 size={15} /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReviewStep({
  eventTitle,
  selectedRole,
  motivation,
  availability,
}: {
  eventTitle: string
  selectedRole: VolunteerRole | ''
  motivation: string
  availability: string[]
}) {
  return (
    <div>
      <StepTitle
        icon={<FileText size={20} />}
        title="Review aplikasi"
        description="Pastikan detail pendaftaran sudah sesuai sebelum dikirim ke organizer."
      />
      <div className="mt-6 space-y-4">
        <ReviewBlock label="Event" value={eventTitle} />
        <ReviewBlock label="Role" value={selectedRole || 'Belum dipilih'} />
        <ReviewBlock label="Motivasi" value={motivation} />
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Ketersediaan</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {availability.map((item) => (
              <span
                key={item}
                className="rounded-full border bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground"
              >
                {item}
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {availability.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function EventSummaryCard({ eventId }: { eventId: string }) {
  const event = getEventById(eventId)

  if (!event) {
    return null
  }

  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="h-36 bg-muted">
        <img src={event.image} alt="" className="size-full object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <CategoryChip category={event.category} />
          <h2 className="mt-3 font-heading text-xl font-extrabold">{event.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {event.shortDescription}
          </p>
        </div>
        <div className="grid gap-2 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock size={15} className="text-primary" />
            {formatDate(event.date)}, {formatEventTime(event.startTime, event.endTime)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={15} className="text-primary" />
            {event.location}, {event.city}
          </span>
        </div>
        <div className="rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground">
          Mendaftar sebagai {volunteerProfile.name}, {volunteerProfile.major}.
        </div>
      </div>
    </article>
  )
}

function StepTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <h2 className="font-heading text-2xl font-extrabold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

function ReviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-lg font-extrabold">{value}</p>
    </div>
  )
}
