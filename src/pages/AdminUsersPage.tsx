import {
  Building2,
  HeartHandshake,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader, StatsCard } from '@/components'
import { platformUsers } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { formatDate } from '@/lib/format'
import { adminApi } from '@/services/api'
import type { UserRole } from '@/types/migunani'

type RoleFilter = UserRole | 'all'
type StatusFilter = 'all' | 'Active' | 'Inactive' | 'Suspended'

export function AdminUsersPage() {
  const loadUsers = useCallback(() => adminApi.getAdminUsers(), [])
  const {
    data: users,
    error: usersError,
    isLoading,
    reload,
  } = useAsyncResource(loadUsers, platformUsers)
  const [userOverrides, setUserOverrides] = useState<typeof platformUsers>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return getVisibleUsers(users, userOverrides).filter((user) => {
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
  }, [query, roleFilter, statusFilter, userOverrides, users])

  const visibleUsers = getVisibleUsers(users, userOverrides)
  const volunteerCount = visibleUsers.filter((u) => u.role === 'volunteer').length
  const organizerCount = visibleUsers.filter((u) => u.role === 'organizer').length
  const adminCount = visibleUsers.filter((u) => u.role === 'admin').length

  async function updateStatus(userId: string, status: StatusFilter) {
    if (status === 'all') {
      return
    }

    const previousOverrides = userOverrides
    const baseUser = visibleUsers.find((user) => user.id === userId)

    if (!baseUser) {
      return
    }

    setUserOverrides((current) => upsertUser(current, { ...baseUser, status }))

    try {
      const updatedUser = await adminApi.updateUserStatus(userId, status)
      setUserOverrides((current) => upsertUser(current, updatedUser))
      void reload()
    } catch {
      setUserOverrides(previousOverrides)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Admin / Users"
        title="Kelola semua pengguna platform."
        description="Lihat, cari, dan filter seluruh pengguna Migunani berdasarkan role dan status akun."
      />

      {isLoading ? (
        <ApiNotice message="Memuat user dari API..." tone="loading" />
      ) : null}
      {usersError ? (
        <ApiNotice
          message={`Data API belum tersedia, memakai user tampilan sementara. ${usersError}`}
          tone="error"
        />
      ) : null}

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
        dari {visibleUsers.length} pengguna
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
              <select
                value={user.status}
                onChange={(event) =>
                  void updateStatus(user.id, event.target.value as StatusFilter)
                }
                className="h-9 rounded-md border bg-background px-2 text-xs font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function ApiNotice({
  tone,
  message,
}: {
  tone: 'loading' | 'error'
  message: string
}) {
  return (
    <div
      className={
        tone === 'loading'
          ? 'rounded-lg border bg-accent p-3 text-sm font-semibold text-accent-foreground'
          : 'rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive'
      }
    >
      {message}
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

function getVisibleUsers(
  users: typeof platformUsers,
  overrides: typeof platformUsers,
) {
  const overrideMap = new Map(overrides.map((user) => [user.id, user]))

  return users.map((user) => overrideMap.get(user.id) ?? user)
}

function upsertUser(users: typeof platformUsers, nextUser: (typeof platformUsers)[number]) {
  const hasUser = users.some((user) => user.id === nextUser.id)

  return hasUser
    ? users.map((user) => (user.id === nextUser.id ? nextUser : user))
    : [...users, nextUser]
}
