import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader, StatsCard } from '@/components'
import {
  adminStats,
  events,
  organizers,
  platformUsers,
} from '@/data'
import { formatDate } from '@/lib/format'

const statIcons = [Users, CalendarDays, Building2, Clock3]
const statTones = ['green', 'yellow', 'dark', 'neutral'] as const

export function AdminDashboardPage() {
  const recentUsers = [...platformUsers]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 5)

  const activeEvents = events.filter((event) => event.status !== 'Closed')
  const verifiedOrganizers = organizers.filter((org) => org.verified)

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Super Admin"
        title="Platform overview Migunani."
        description="Pantau statistik platform, kelola pengguna, event, dan organizer dari satu dashboard terpusat."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat, index) => (
          <StatsCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            helper={stat.helper}
            icon={statIcons[index]}
            tone={statTones[index]}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="space-y-4">
            <SectionTitle
              eyebrow="Recent users"
              title="Pengguna terbaru."
              description="Daftar pengguna yang baru bergabung di platform Migunani."
            />
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground md:grid-cols-[1fr_140px_120px_100px]">
                <span>Pengguna</span>
                <span className="hidden md:block">Role</span>
                <span className="hidden md:block">Bergabung</span>
                <span>Status</span>
              </div>
              <div className="divide-y">
                {recentUsers.map((user) => (
                  <article
                    key={user.id}
                    className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 md:grid-cols-[1fr_140px_120px_100px] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-sm font-extrabold text-accent-foreground">
                          {user.avatarInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="font-heading text-base font-extrabold">
                            {user.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:block">
                      <RoleBadge role={user.role} />
                    </span>
                    <span className="hidden text-sm font-semibold text-muted-foreground md:block">
                      {formatDate(user.joinedAt)}
                    </span>
                    <UserStatusBadge status={user.status} />
                  </article>
                ))}
              </div>
            </div>
            <Link
              to="/portal/users"
              className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
            >
              Lihat semua pengguna
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>

        <aside className="space-y-4">
          <article className="rounded-lg border bg-deep-green p-5 text-primary-foreground shadow-sm">
            <ShieldCheck size={22} className="text-secondary" />
            <h2 className="mt-4 font-heading text-2xl font-extrabold">
              Platform health
            </h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/78">
              {activeEvents.length} event aktif dengan{' '}
              {verifiedOrganizers.length} organizer terverifikasi dari total{' '}
              {organizers.length} organizer.
            </p>
            <div className="mt-5 space-y-3">
              <HealthRow
                label="Event aktif"
                value={`${activeEvents.length} event`}
              />
              <HealthRow
                label="Organizer verified"
                value={`${verifiedOrganizers.length}/${organizers.length}`}
              />
              <HealthRow
                label="Total pengguna"
                value={`${platformUsers.length} user`}
              />
            </div>
          </article>

          <section className="rounded-lg border bg-secondary p-5 text-secondary-foreground shadow-sm">
            <p className="text-sm font-bold uppercase">Quick actions</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold">
              Kelola platform.
            </h2>
            <div className="mt-4 space-y-2">
              <QuickLink to="/portal/users" icon={<Users size={16} />} label="Kelola pengguna" />
              <QuickLink to="/portal/events" icon={<CalendarDays size={16} />} label="Kelola event" />
              <QuickLink to="/portal/organizers" icon={<Building2 size={16} />} label="Kelola organizer" />
            </div>
          </section>

          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <TrendingUp size={19} />
              </span>
              <div>
                <h2 className="font-heading text-xl font-extrabold">Growth trend</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Platform menunjukkan pertumbuhan pengguna +12 bulan ini dengan
                  rata-rata 6 event baru per bulan.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <HealthRow label="User/bulan" value="+12 rata-rata" />
              <HealthRow label="Event/bulan" value="6 event baru" />
              <HealthRow label="Jam total" value="2.840 jam" />
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-3xl font-extrabold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-deep-green text-primary-foreground',
    organizer: 'bg-secondary text-secondary-foreground',
    volunteer: 'bg-accent text-accent-foreground',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${styles[role] ?? styles.volunteer}`}
    >
      {role === 'admin' ? (
        <ShieldCheck size={12} />
      ) : role === 'organizer' ? (
        <Building2 size={12} />
      ) : (
        <HeartHandshake size={12} />
      )}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

function UserStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-accent text-accent-foreground',
    Inactive: 'bg-muted text-muted-foreground',
    Suspended: 'bg-destructive/10 text-destructive',
  }

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? styles.Active}`}
    >
      {status}
    </span>
  )
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-white/10 p-3">
      <span className="text-sm font-semibold opacity-80">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md bg-brand-black/10 p-3 text-sm font-bold transition hover:bg-brand-black/20"
    >
      {icon}
      {label}
      <ArrowRight size={14} className="ml-auto" />
    </Link>
  )
}
