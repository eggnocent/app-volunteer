import {
  Award,
  Ban,
  CheckCircle2,
  Eye,
  FileCheck,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { ConfirmDialog, PageHeader, StatsCard } from '@/components'
import { certificates, getEventById, getOrganizerById, platformUsers } from '@/data'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/useAuth'
import { organizerApi } from '@/services/api'
import type { ApiCertificate } from '@/services/api'

const fallbackOrganizerId = 'org-aksara-muda'

export function OrganizerCertificatesPage() {
  const { user } = useAuth()
  const organizerId = user?.organizerId ?? fallbackOrganizerId
  const fallbackCertificates = useMemo<ApiCertificate[]>(() => {
    const volunteerUsers = platformUsers.filter(
      (platformUser) => platformUser.role === 'volunteer',
    )

    return certificates.map((certificate, index) => {
      const volunteerUser = volunteerUsers[index % volunteerUsers.length]

      return {
        ...certificate,
        status: 'Issued',
        isValid: true,
        volunteerName: volunteerUser?.name ?? 'Relawan Migunani',
        eventTitle: getEventById(certificate.eventId)?.title ?? 'Event Migunani',
        organizerName:
          getOrganizerById(fallbackOrganizerId)?.name ?? 'Organizer Migunani',
      }
    })
  }, [])
  const loadCertificates = useCallback(
    () => organizerApi.getOrganizerCertificates(organizerId),
    [organizerId],
  )
  const {
    data: apiCertificates,
    error,
    isLoading,
    reload,
  } = useAsyncResource(loadCertificates, fallbackCertificates)
  const [overrides, setOverrides] = useState<Record<string, ApiCertificate>>({})
  const [query, setQuery] = useState('')
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null)
  const [pendingCertificateIds, setPendingCertificateIds] = useState<string[]>([])
  const [pendingRevokeCertificate, setPendingRevokeCertificate] =
    useState<ApiCertificate | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const visibleCertificates = apiCertificates.map(
    (certificate) => overrides[certificate.id] ?? certificate,
  )
  const filteredCertificates = visibleCertificates.filter((certificate) => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return true
    }

    return [
      certificate.credentialId,
      certificate.volunteerName,
      certificate.eventTitle,
      certificate.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })
  const issuedCount = visibleCertificates.filter(
    (certificate) => certificate.status !== 'Revoked',
  ).length
  const revokedCount = visibleCertificates.length - issuedCount
  const selectedCertificate = selectedCertificateId
    ? visibleCertificates.find((certificate) => certificate.id === selectedCertificateId)
    : undefined

  async function revokeCertificate(certificate: ApiCertificate) {
    const previous = overrides[certificate.id] ?? certificate
    setActionError(null)
    setPendingCertificateIds((current) =>
      current.includes(certificate.id) ? current : [...current, certificate.id],
    )
    setOverrides((current) => ({
      ...current,
      [certificate.id]: {
        ...certificate,
        status: 'Revoked',
        isValid: false,
        revokedAt: new Date().toISOString(),
      },
    }))

    try {
      const revokedCertificate = await organizerApi.revokeCertificate(
        organizerId,
        certificate.id,
      )
      setOverrides((current) => ({
        ...current,
        [certificate.id]: revokedCertificate,
      }))
      void reload()
    } catch (error) {
      setOverrides((current) => ({ ...current, [certificate.id]: previous }))
      setActionError(getErrorMessage(error))
    } finally {
      setPendingCertificateIds((current) => current.filter((id) => id !== certificate.id))
      setPendingRevokeCertificate(null)
    }
  }

  async function createReplacement(certificate: ApiCertificate) {
    setActionError(null)
    setPendingCertificateIds((current) =>
      current.includes(certificate.id) ? current : [...current, certificate.id],
    )

    try {
      const replacementCertificate =
        await organizerApi.createReplacementCertificate(organizerId, certificate.id, {
          reason: 'Revisi sertifikat dari organizer.',
        })
      setOverrides((current) => ({
        ...current,
        [certificate.id]: {
          ...certificate,
          replacementCredentialId: replacementCertificate.credentialId,
        },
        [replacementCertificate.id]: replacementCertificate,
      }))
      void reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setPendingCertificateIds((current) => current.filter((id) => id !== certificate.id))
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        eyebrow="Organizer Certificates"
        title="Kelola sertifikat relawan."
        description="Pantau credential yang sudah diterbitkan dan revoke sertifikat yang perlu dibatalkan."
      />

      {isLoading ? (
        <ApiNotice message="Memuat sertifikat..." tone="loading" />
      ) : null}
      {error ? (
        <ApiNotice
          message={`Sebagian data belum bisa dimuat. Menampilkan informasi terakhir yang tersedia. ${error}`}
          tone="error"
        />
      ) : null}
      {actionError ? (
        <ApiNotice message={actionError} tone="error" />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Total sertifikat"
          value={visibleCertificates.length.toString()}
          helper="credential tercatat"
          icon={FileCheck}
          tone="green"
        />
        <StatsCard
          label="Issued"
          value={issuedCount.toString()}
          helper="masih valid"
          icon={CheckCircle2}
          tone="yellow"
        />
        <StatsCard
          label="Revoked"
          value={revokedCount.toString()}
          helper="dibatalkan organizer"
          icon={ShieldAlert}
          tone="dark"
        />
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <label className="relative block">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari credential, relawan, atau event"
            className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted px-4 py-3 text-xs font-bold uppercase text-muted-foreground lg:grid-cols-[1fr_1fr_170px_120px_140px]">
          <span>Credential</span>
          <span className="hidden lg:block">Event</span>
          <span className="hidden lg:block">Issued</span>
          <span>Status</span>
          <span className="text-right lg:text-left">Tindakan</span>
        </div>
        <div className="divide-y">
          {filteredCertificates.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-muted-foreground">
              Tidak ada sertifikat yang cocok dengan pencarian.
            </div>
          ) : (
            filteredCertificates.map((certificate) => {
              const isPending = pendingCertificateIds.includes(certificate.id)

              return (
                <article
                  key={certificate.id}
                  className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_1fr_170px_120px_140px] lg:items-center"
                >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-foreground">
                    {certificate.credentialId}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {certificate.volunteerName ?? 'Relawan Migunani'}
                  </p>
                </div>
                <span className="hidden truncate text-sm font-semibold text-muted-foreground lg:block">
                  {certificate.eventTitle ??
                    getEventById(certificate.eventId)?.title ??
                    'Event Migunani'}
                </span>
                <span className="hidden text-sm font-semibold text-muted-foreground lg:block">
                  {formatDate(certificate.issuedAt)}
                </span>
                <CertificateStatusBadge status={certificate.status ?? 'Issued'} />
                <div className="flex items-center justify-end gap-2 lg:justify-start">
                  <button
                    type="button"
                    onClick={() => setSelectedCertificateId(certificate.id)}
                    className="inline-flex size-8 items-center justify-center rounded bg-accent text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                    aria-label="Lihat detail sertifikat"
                  >
                    <Eye size={16} />
                  </button>
                  {(certificate.status ?? 'Issued') !== 'Revoked' ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void createReplacement(certificate)}
                        className="inline-flex size-8 items-center justify-center rounded bg-secondary/30 text-secondary-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Buat sertifikat pengganti"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setPendingRevokeCertificate(certificate)}
                        className="inline-flex size-8 items-center justify-center rounded bg-destructive/10 text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Revoke sertifikat"
                      >
                        <Ban size={16} />
                      </button>
                    </>
                  ) : null}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>

      {selectedCertificate ? (
        <CertificateDetailModal
          organizerId={organizerId}
          certificate={selectedCertificate}
          isPending={pendingCertificateIds.includes(selectedCertificate.id)}
          onClose={() => setSelectedCertificateId(null)}
          onRevoke={() => setPendingRevokeCertificate(selectedCertificate)}
          onReplace={() => void createReplacement(selectedCertificate)}
        />
      ) : null}

      {pendingRevokeCertificate ? (
        <ConfirmDialog
          tone="danger"
          title="Revoke sertifikat?"
          description={`Credential ${pendingRevokeCertificate.credentialId} akan dibatalkan dan tidak lagi valid untuk verifikasi.`}
          confirmLabel="Revoke sertifikat"
          isPending={pendingCertificateIds.includes(pendingRevokeCertificate.id)}
          onCancel={() => setPendingRevokeCertificate(null)}
          onConfirm={() => void revokeCertificate(pendingRevokeCertificate)}
        />
      ) : null}
    </div>
  )
}

function CertificateDetailModal({
  organizerId,
  certificate,
  isPending,
  onClose,
  onRevoke,
  onReplace,
}: {
  organizerId: string
  certificate: ApiCertificate
  isPending: boolean
  onClose: () => void
  onRevoke: () => void
  onReplace: () => void
}) {
  const loadCertificate = useCallback(
    () => organizerApi.getOrganizerCertificate(organizerId, certificate.id),
    [certificate.id, organizerId],
  )
  const { data: detail, error, isLoading } = useAsyncResource(
    loadCertificate,
    certificate,
  )
  const status = detail.status ?? 'Issued'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-xl overflow-hidden rounded-lg border bg-card shadow-2xl">
        <div className="bg-deep-green p-6 text-primary-foreground">
          <Award size={28} className="text-secondary" />
          <p className="mt-5 text-sm font-bold uppercase text-primary-foreground/70">
            Certificate detail
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold">
            {detail.volunteerName ?? 'Relawan Migunani'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-primary-foreground/78">
            {detail.eventTitle ?? getEventById(detail.eventId)?.title ?? 'Event Migunani'}
          </p>
        </div>
        <div className="space-y-4 p-6">
          {isLoading ? (
            <ApiNotice message="Memuat detail sertifikat..." tone="loading" />
          ) : null}
          {error ? (
            <ApiNotice
              message={`Sebagian detail sertifikat belum bisa dimuat. Menampilkan informasi dari daftar utama. ${error}`}
              tone="error"
            />
          ) : null}
          <DetailRow label="Credential ID" value={detail.credentialId} />
          {detail.replacementCredentialId ? (
            <DetailRow
              label="Replacement"
              value={detail.replacementCredentialId}
            />
          ) : null}
          <DetailRow label="Tanggal terbit" value={formatDate(detail.issuedAt)} />
          <DetailRow label="Jam kontribusi" value={`${detail.hours} jam`} />
          <div className="flex items-center justify-between gap-4 rounded-md bg-muted p-3">
            <span className="text-sm font-semibold text-muted-foreground">Status</span>
            <CertificateStatusBadge status={status} />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t bg-muted/40 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-4 text-sm font-bold transition hover:bg-muted"
          >
            Tutup
          </button>
          {status !== 'Revoked' ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={onReplace}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} />
                Replacement
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={onRevoke}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-bold text-destructive-foreground transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={16} />
                Revoke
              </button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function CertificateStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold',
        status === 'Revoked'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-accent text-accent-foreground',
      )}
    >
      {status}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-muted p-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

function ApiNotice({
  tone,
  message,
}: {
  tone: 'loading' | 'error'
  message: string
}) {
  return (
    <div
      className={
        tone === 'loading'
          ? 'rounded-lg border bg-accent p-3 text-sm font-semibold text-accent-foreground'
          : 'rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive'
      }
    >
      {message}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Aksi sertifikat belum bisa diproses.'
}
