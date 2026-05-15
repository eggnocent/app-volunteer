import { events } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function EventsPage() {
  return (
    <PagePlaceholder
      eyebrow="Explore Events"
      title="Marketplace event volunteer dengan filter, search, bookmark, dan grid/list view."
      description="Step berikutnya akan mengisi halaman ini dengan filter kategori, lokasi, tipe event, tanggal, benefit, sort, dan event cards."
    >
      <p className="rounded-md border bg-muted p-4 text-sm font-semibold text-muted-foreground">
        {events.length} dummy event sudah siap dipakai.
      </p>
    </PagePlaceholder>
  )
}
