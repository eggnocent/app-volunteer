import { ArrowRight, Bookmark, CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryChip } from '@/components/CategoryChip'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, formatEventTime, getFillPercentage } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Organizer, VolunteerEvent } from '@/types/migunani'

type EventCardProps = {
  event: VolunteerEvent
  organizer?: Organizer
  saved?: boolean
  onSavedChange?: (eventId: string) => void
  detailPathPrefix?: string
  variant?: 'grid' | 'list' | 'compact'
  matchScore?: number
  matchReasons?: string[]
  primaryAction?: {
    label: string
    to: string
  }
  className?: string
}

export function EventCard({
  event,
  organizer,
  saved = false,
  onSavedChange,
  detailPathPrefix = '/events',
  variant = 'grid',
  matchScore,
  matchReasons = [],
  primaryAction,
  className,
}: EventCardProps) {
  const fill = getFillPercentage(event.registered, event.quota)
  const isList = variant === 'list'
  const detailPath = `${detailPathPrefix}/${event.slug}`

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        isList && 'grid md:grid-cols-[260px_1fr]',
        className,
      )}
    >
      <Link
        to={detailPath}
        className={cn(
          'relative block overflow-hidden bg-muted',
          isList ? 'h-56 md:h-full' : 'h-52',
          variant === 'compact' && 'h-40',
        )}
      >
        <img
          src={event.image}
          alt={event.title}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusBadge status={event.status} />
          {event.featured ? (
            <span className="rounded-full border border-secondary/70 bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              Featured
            </span>
          ) : null}
          {typeof matchScore === 'number' ? (
            <span className="rounded-full border border-white/20 bg-card/95 px-2.5 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur">
              Cocok {matchScore}%
            </span>
          ) : null}
        </div>
      </Link>

      {onSavedChange ? (
        <button
          type="button"
          onClick={() => onSavedChange(event.id)}
          className={cn(
            'absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-md border bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:bg-secondary hover:text-secondary-foreground',
            saved && 'bg-secondary text-secondary-foreground',
          )}
          aria-label={saved ? 'Hapus dari event tersimpan' : 'Simpan event'}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4 p-5">
        <div className="space-y-3">
          <CategoryChip category={event.category} />
          <div>
            <Link
              to={detailPath}
              className="font-heading text-xl font-extrabold leading-tight text-foreground transition hover:text-primary"
            >
              {event.title}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {event.shortDescription}
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <MetaItem icon={CalendarDays} label={formatDate(event.date)} />
          <MetaItem icon={Clock} label={formatEventTime(event.startTime, event.endTime)} />
          <MetaItem icon={MapPin} label={`${event.city} · ${event.mode}`} />
          <MetaItem icon={Users} label={`${event.registered}/${event.quota} relawan`} />
        </div>

        <div className="mt-auto space-y-3">
          {matchReasons.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchReasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${fill}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
            <span>{organizer?.name ?? 'Organizer komunitas'}</span>
            <span>{fill}% terisi</span>
          </div>
          {primaryAction ? (
            <Link
              to={primaryAction.to}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
            >
              {primaryAction.label}
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

type MetaItemProps = {
  icon: typeof CalendarDays
  label: string
}

function MetaItem({ icon: Icon, label }: MetaItemProps) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon size={15} className="shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </span>
  )
}
