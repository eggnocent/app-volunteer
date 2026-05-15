import { Link, useParams } from 'react-router-dom'

import { getEventById } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function ApplyPage() {
  const { eventId } = useParams()
  const event = eventId ? getEventById(eventId) : undefined

  return (
    <PagePlaceholder
      eyebrow="Apply / Registration Flow"
      title={event ? `Daftar untuk ${event.title}` : 'Flow pendaftaran relawan'}
      description="Halaman ini nanti berisi multi-step form, pilihan role volunteer, motivasi, ketersediaan, review, dan confirmation modal."
    >
      <Link
        to="/dashboard"
        className="inline-flex h-11 items-center rounded-md border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-muted"
      >
        Lihat dashboard relawan
      </Link>
    </PagePlaceholder>
  )
}
