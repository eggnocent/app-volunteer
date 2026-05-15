import { Award, Download, ShieldCheck } from 'lucide-react'

import { getEventById } from '@/data'
import { formatDate } from '@/lib/format'
import type { Certificate } from '@/types/migunani'

type CertificateCardProps = {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const event = getEventById(certificate.eventId)

  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="bg-deep-green p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Award size={22} />
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
            {certificate.hours} jam
          </span>
        </div>
        <p className="mt-6 text-xs font-bold uppercase text-primary-foreground/70">
          Sertifikat Volunteer
        </p>
        <h3 className="mt-2 font-heading text-xl font-extrabold">
          {event?.title ?? 'Event Migunani'}
        </h3>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Credential ID</p>
          <p className="mt-1 font-mono text-sm font-bold text-foreground">
            {certificate.credentialId}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ShieldCheck size={16} className="text-primary" />
            Terbit {formatDate(certificate.issuedAt)}
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border bg-card text-foreground transition hover:bg-muted"
            aria-label="Download sertifikat"
          >
            <Download size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}
