import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  density?: 'compact' | 'spacious'
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  density = 'compact',
  className,
}: PageHeaderProps) {
  const spacious = density === 'spacious'

  return (
    <header
      className={cn(
        'flex min-w-0 flex-col rounded-lg border bg-card shadow-sm md:flex-row md:items-end md:justify-between',
        spacious ? 'gap-5 p-6' : 'gap-4 p-4 sm:p-5',
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-normal text-primary sm:text-sm">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'mt-2 max-w-full break-words font-heading font-extrabold leading-tight text-foreground',
            spacious
              ? 'text-3xl md:text-5xl'
              : 'max-w-[19rem] text-2xl sm:max-w-full sm:text-3xl md:text-4xl',
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'mt-3 max-w-2xl leading-7 text-muted-foreground',
              spacious
                ? 'text-base'
                : 'max-w-[19rem] break-words text-sm sm:max-w-2xl sm:text-base',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
