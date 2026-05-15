import { Link } from 'react-router-dom'

import { organizerMetrics } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function OrganizerDashboardPage() {
  return (
    <PagePlaceholder
      eyebrow="Organizer Dashboard"
      title="Kelola event, applicant, dan performa kegiatan relawan."
      description="Dashboard organizer nanti berisi list event yang dibuat, statistik applicant, event performance, applicant preview, dan CTA create event."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {organizerMetrics.map((metric) => (
          <div key={metric.id} className="rounded-md border bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{metric.value}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{metric.helper}</p>
          </div>
        ))}
      </div>
      <Link
        to="/organizer/create"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
      >
        Buat event baru
      </Link>
    </PagePlaceholder>
  )
}
