import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type StatsCardProps = {
  label: string
  value: string
  helper?: string
  icon?: LucideIcon
  tone?: 'green' | 'yellow' | 'dark' | 'neutral'
  className?: string
}

const toneClassName = {
  green: 'bg-accent text-accent-foreground',
  yellow: 'bg-secondary/20 text-secondary-foreground',
  dark: 'bg-deep-green/10 text-deep-green',
  neutral: 'bg-muted text-foreground',
}

export function StatsCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'neutral',
  className,
}: StatsCardProps) {
  return (
    <article className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-md',
              toneClassName[tone],
            )}
          >
            <Icon size={19} />
          </span>
        ) : null}
      </div>
      {helper ? (
        <p className="mt-3 line-clamp-2 text-sm font-semibold text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </article>
  )
}
