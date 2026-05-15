import { categories, featuredEvents } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function HomePage() {
  return (
    <PagePlaceholder
      eyebrow="Home / Discover"
      title="Temukan aksi volunteer yang migunani untuk kampus, warga, dan masa depanmu."
      description="Halaman ini nanti berisi search utama, featured events, category shortcuts, dan CTA untuk mahasiswa maupun organizer."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile label="Featured events" value={featuredEvents.length.toString()} />
        <InfoTile label="Kategori" value={categories.length.toString()} />
        <InfoTile label="Mode" value="Online + Offline" />
        <InfoTile label="Tone" value="Energetic" />
      </div>
    </PagePlaceholder>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}
