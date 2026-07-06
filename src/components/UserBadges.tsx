import { Building2, HeartHandshake, ShieldCheck } from 'lucide-react'

import { getUserRoleLabel, getUserStatusLabel } from '@/lib/display-labels'
import type { UserRole, UserStatus } from '@/types/migunani'

export function UserRoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: 'bg-deep-green text-primary-foreground',
    organizer: 'bg-secondary text-secondary-foreground',
    volunteer: 'bg-accent text-accent-foreground',
  }

  const Icon =
    role === 'admin'
      ? ShieldCheck
      : role === 'organizer'
        ? Building2
        : HeartHandshake

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${styles[role]}`}
    >
      <Icon size={12} />
      {getUserRoleLabel(role)}
    </span>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    Active: 'bg-accent text-accent-foreground',
    Inactive: 'bg-muted text-muted-foreground',
    Suspended: 'bg-destructive/10 text-destructive',
  }

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}
    >
      {getUserStatusLabel(status)}
    </span>
  )
}
