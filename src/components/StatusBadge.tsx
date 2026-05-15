import type { ApplicationStatus, EventStatus } from '@/types/migunani'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: EventStatus | ApplicationStatus
  className?: string
}

const statusLabel: Record<EventStatus | ApplicationStatus, string> = {
  Open: 'Open',
  'Nearly Full': 'Hampir penuh',
  Closed: 'Tutup',
  Draft: 'Draft',
  Submitted: 'Terkirim',
  Accepted: 'Diterima',
  Waitlisted: 'Waiting list',
  Completed: 'Selesai',
}

const statusClassName: Record<EventStatus | ApplicationStatus, string> = {
  Open: 'border-primary/25 bg-primary/10 text-primary',
  'Nearly Full': 'border-secondary/70 bg-secondary/25 text-foreground',
  Closed: 'border-muted bg-muted text-muted-foreground',
  Draft: 'border-muted bg-muted text-muted-foreground',
  Submitted: 'border-info/25 bg-info/10 text-info',
  Accepted: 'border-primary/25 bg-primary/10 text-primary',
  Waitlisted: 'border-warning/25 bg-warning/10 text-warning',
  Completed: 'border-deep-green/25 bg-deep-green/10 text-deep-green',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold',
        statusClassName[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  )
}
