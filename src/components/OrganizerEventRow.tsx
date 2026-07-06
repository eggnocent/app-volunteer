import { CalendarDays, Pencil, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, getFillPercentage } from '@/lib/format'
import type { VolunteerEvent } from '@/types/migunani'

type OrganizerEventRowProps = {
  event: VolunteerEvent
  detailPathPrefix?: string | null
  canEdit?: boolean
}

export function OrganizerEventRow({
  event,
  detailPathPrefix = '/organizer/events',
  canEdit = false,
}: OrganizerEventRowProps) {
  const fill = getFillPercentage(event.registered, event.quota)

  return (
    <article className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/30 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
            {event.category}
          </span>
        </div>
        {detailPathPrefix ? (
          <Link
            to={`${detailPathPrefix}/${event.slug}`}
            className="mt-3 block truncate font-heading text-lg font-extrabold text-foreground transition hover:text-primary"
          >
            {event.title}
          </Link>
        ) : (
          <h2 className="mt-3 truncate font-heading text-lg font-extrabold text-foreground">
            {event.title}
          </h2>
        )}
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={15} className="text-primary" />
            {formatDate(event.date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users size={15} className="text-primary" />
            {event.registered}/{event.quota} pendaftar
          </span>
        </div>
      </div>

      <div className="min-w-40">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>Keterisian</span>
          <span>{fill}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
        </div>
        {canEdit ? (
          <Link
            to={`/organizer/events/${event.id}/edit`}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border bg-card text-xs font-bold transition hover:bg-muted"
          >
            <Pencil size={14} />
            Edit event
          </Link>
        ) : null}
      </div>
    </article>
  )
}
