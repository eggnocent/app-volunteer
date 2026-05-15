import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Eye,
  FileText,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { CategoryChip, EventCard, PageHeader } from '@/components'
import { categories, getOrganizerById } from '@/data'
import { cn } from '@/lib/utils'
import type { EventCategory, EventMode, VolunteerEvent, VolunteerRole } from '@/types/migunani'

const roleOptions: VolunteerRole[] = [
  'Field Volunteer',
  'Education Mentor',
  'Content & Documentation',
  'Logistics Crew',
  'Community Facilitator',
]

const modeOptions: EventMode[] = ['Offline', 'Online', 'Hybrid']

const previewImage =
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80'

export function CreateEventPage() {
  const [title, setTitle] = useState('Gerakan Mentoring Kampus Berdampak')
  const [category, setCategory] = useState<EventCategory>('Pendidikan')
  const [mode, setMode] = useState<EventMode>('Offline')
  const [city, setCity] = useState('Yogyakarta')
  const [location, setLocation] = useState('Ruang Komunitas Migunani')
  const [date, setDate] = useState('2026-07-12')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('13:00')
  const [quota, setQuota] = useState(48)
  const [description, setDescription] = useState(
    'Program relawan untuk mendampingi pelajar menyiapkan target belajar, portofolio, dan kepercayaan diri lewat sesi mentoring kecil.',
  )
  const [benefits, setBenefits] = useState('Sertifikat 5 jam, Mentoring kit, Konsumsi')
  const [skills, setSkills] = useState('Public speaking, Mentoring, Empati')
  const [selectedRoles, setSelectedRoles] = useState<VolunteerRole[]>([
    'Education Mentor',
    'Content & Documentation',
  ])
  const [published, setPublished] = useState(false)

  const previewEvent = useMemo<VolunteerEvent>(() => {
    const duration = calculateDuration(startTime, endTime)

    return {
      id: 'evt-preview',
      slug: 'preview-event',
      title: title || 'Judul event volunteer',
      category,
      organizerId: 'org-aksara-muda',
      location: location || 'Lokasi kegiatan',
      city: city || 'Kota',
      mode,
      date,
      startTime,
      endTime,
      durationHours: duration,
      quota,
      registered: 0,
      status: 'Open',
      image: previewImage,
      shortDescription:
        description || 'Deskripsi singkat event akan tampil di card marketplace.',
      description,
      benefits: splitItems(benefits),
      skills: splitItems(skills),
      roles: selectedRoles.length > 0 ? selectedRoles : ['Field Volunteer'],
      impactTarget: `${quota * 3} penerima manfaat dari event ini.`,
      tags: [mode, category, 'Preview'],
      featured: true,
    }
  }, [
    benefits,
    category,
    city,
    date,
    description,
    endTime,
    location,
    mode,
    quota,
    selectedRoles,
    skills,
    startTime,
    title,
  ])

  const organizer = getOrganizerById(previewEvent.organizerId)

  function toggleRole(role: VolunteerRole) {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link
        to="/organizer"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Kembali ke organizer dashboard
      </Link>

      <PageHeader
        eyebrow="Create Event"
        title="Buat event volunteer dengan preview langsung."
        description="Form ini frontend-only. Organizer bisa melihat bagaimana event akan tampil di marketplace sebelum dipublikasikan."
        action={
          <button
            type="button"
            onClick={() => setPublished(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
          >
            <CalendarPlus size={17} />
            Publish preview
          </button>
        }
      />

      {published ? (
        <section className="rounded-lg border border-primary/30 bg-accent p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading text-xl font-extrabold">
                Preview event berhasil dibuat.
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ini masih simulasi frontend. Di produk nyata, data akan dikirim ke backend
                dan masuk ke review organizer.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <form className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
          <FormSection
            icon={<FileText size={19} />}
            title="Informasi utama"
            description="Tentukan judul, kategori, mode, dan deskripsi singkat event."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Judul event" className="md:col-span-2">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as EventCategory)}
                  className={inputClassName}
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mode kegiatan">
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as EventMode)}
                  className={inputClassName}
                >
                  {modeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Deskripsi" className="md:col-span-2">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className={cn(inputClassName, 'h-auto resize-none leading-7')}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={<MapPin size={19} />}
            title="Lokasi dan jadwal"
            description="Buat jadwal yang jelas agar relawan bisa mengambil keputusan cepat."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Kota">
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="Lokasi">
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="Tanggal">
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mulai">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Selesai">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<Users size={19} />}
            title="Kebutuhan relawan"
            description="Atur kuota, role, benefit, dan skill yang dibutuhkan."
          >
            <div className="space-y-4">
              <Field label={`Kuota relawan: ${quota}`}>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={quota}
                  onChange={(event) => setQuota(Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
              <div>
                <p className="text-sm font-bold text-foreground">Role relawan</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roleOptions.map((role) => {
                    const active = selectedRoles.includes(role)

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-bold transition',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        {role}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Benefit, pisahkan koma">
                  <input
                    value={benefits}
                    onChange={(event) => setBenefits(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Skill, pisahkan koma">
                  <input
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </FormSection>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Live preview</p>
                <h2 className="mt-1 font-heading text-2xl font-extrabold">
                  Marketplace card
                </h2>
              </div>
              <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Eye size={19} />
              </span>
            </div>
            <div className="mt-5">
              <EventCard event={previewEvent} organizer={organizer} saved />
            </div>
          </section>

          <section className="rounded-lg border bg-deep-green p-5 text-primary-foreground shadow-sm">
            <Sparkles size={22} className="text-secondary" />
            <h2 className="mt-4 font-heading text-2xl font-extrabold">
              Preview detail
            </h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/78">
              Event akan muncul sebagai kategori {previewEvent.category}, mode{' '}
              {previewEvent.mode}, dengan {previewEvent.quota} slot relawan dan target{' '}
              {previewEvent.impactTarget.toLowerCase()}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryChip
                category={previewEvent.category}
                className="border-white/20 bg-white/10 text-primary-foreground"
              />
              {previewEvent.roles.slice(0, 2).map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"
                >
                  {role}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}

const inputClassName =
  'h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15'

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </span>
        <div>
          <h2 className="font-heading text-2xl font-extrabold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
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
    <label className={cn('block', className)}>
      <span className="text-sm font-bold text-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function splitItems(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function calculateDuration(startTime: string, endTime: string) {
  const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number)
  const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number)
  const start = startHour * 60 + startMinute
  const end = endHour * 60 + endMinute
  const duration = Math.max(end - start, 60)

  return Math.round(duration / 60)
}
