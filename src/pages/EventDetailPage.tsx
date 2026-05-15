import { Link, useParams } from 'react-router-dom'

import { getEventBySlug, getOrganizerById } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function EventDetailPage() {
  const { slug } = useParams()
  const event = slug ? getEventBySlug(slug) : undefined
  const organizer = event ? getOrganizerById(event.organizerId) : undefined

  if (!event) {
    return (
      <PagePlaceholder
        eyebrow="Event Detail"
        title="Event tidak ditemukan."
        description="Route detail sudah siap. Nanti state kosong ini akan dipoles setelah komponen utama tersedia."
      />
    )
  }

  return (
    <PagePlaceholder
      eyebrow="Event Detail"
      title={event.title}
      description={`${event.shortDescription} Diselenggarakan oleh ${organizer?.name ?? 'organizer terverifikasi'} di ${event.city}.`}
    >
      <Link
        to={`/apply/${event.id}`}
        className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-deep-green"
      >
        Daftar jadi relawan
      </Link>
    </PagePlaceholder>
  )
}
