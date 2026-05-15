import { dashboardStats, volunteerProfile } from '@/data'
import { PagePlaceholder } from '@/pages/PagePlaceholder'

export function VolunteerDashboardPage() {
  return (
    <PagePlaceholder
      eyebrow="Volunteer Dashboard"
      title={`Halo, ${volunteerProfile.name}.`}
      description="Dashboard ini nanti menampilkan event yang diikuti, status aplikasi, total jam kontribusi, sertifikat dummy, dan impact summary."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.id} className="rounded-md border bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{stat.delta}</p>
          </div>
        ))}
      </div>
    </PagePlaceholder>
  )
}
