import {
  Building2,
  HeartHandshake,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader, StatsCard } from '@/components'
import { platformUsers } from '@/data'
import { formatDate } from '@/lib/format'
import type { UserRole } from '@/types/migunani'

type RoleFilter = UserRole | 'all'
type StatusFilter = 'all' | 'Active' | 'Inactive' | 'Suspended'

export function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return platformUsers.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      const matchesQuery =
        !normalizedQuery ||
        [user.name, user.email, user.city, user.role, user.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesRole && matchesStatus && matchesQuery
    })
  }, [query, roleFilter, statusFilter])

  const volunteerCount = platformUsers.filter((u) => u.role === 'volunteer').length
  const organizerCount = platformUsers.filter((u) => u.role === 'organizer').length
  const adminCount = platformUsers.filter((u) => u.role === 'admin').length

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin / Users"
        title="Kelola semua pengguna platform."
        description="Lihat, cari, dan filter seluruh pengguna Migunani berdasarkan role dan status akun."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Relawan"
          value={volunteerCount.toString()}
          helper="user aktif terdaftar"
          icon={HeartHandshake}
          tone="green"
        />
        <StatsCard
          label="Organizer"
          value={organizerCount.toString()}
          helper="pengelola event"
          icon={Building2}
          tone="yellow"
        />
        <StatsCard
          label="Admin"
          value={adminCount.toString()}
          helper="super admin platform"
          icon={ShieldCheck}
          tone="dark"
        />
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, email, kota..."
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">Semua role</option>
            <option value="volunteer">Relawan</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-11 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">Semua status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </section>

      <p className="text-sm font-semibold text-muted-foreground">
        Menampilkan <span className="text-foreground">{filteredUsers.length}</span>{' '}
        dari {platformUsers.length} pengguna
      </p>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1fr_140px_140px_120px_100px]">
          <span>Pengguna</span>
          <span className="hidden lg:block">Role</span>
          <span className="hidden lg:block">Kota</span>
          <span className="hidden lg:block">Bergabung</span>
          <span>Status</span>
        </div>
        <div className="divide-y">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_140px_140px_120px_100px] lg:items-center"
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
              <span className="hidden lg:block">
                <RoleBadge role={user.role} />
              </span>
              <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                {user.city}
              </span>
              <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                {formatDate(user.joinedAt)}
              </span>
              <UserStatusBadge status={user.status} />
            </article>
          ))}
        </div>
      </section>
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
