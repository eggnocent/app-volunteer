import {
  Bell,
  CalendarClock,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { useAsyncResource } from '@/hooks/useAsyncResource'
import { cn } from '@/lib/utils'
import { notificationApi } from '@/services/api'
import type { ApiNotification } from '@/services/api'

type NotificationCenterProps = {
  area: 'admin' | 'volunteer' | 'organizer'
}

const notificationIcons = {
  accepted: CheckCircle2,
  reminder: CalendarClock,
  certificate: FileCheck,
  applicant: Users,
  moderation: ShieldAlert,
}

export function NotificationCenter({ area }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])
  const fallbackNotifications = useMemo(() => getFallbackNotifications(area), [area])
  const loadNotifications = useCallback(
    () => notificationApi.getNotifications(),
    [],
  )
  const { data: apiNotifications } = useAsyncResource(
    loadNotifications,
    fallbackNotifications,
  )
  const notifications = apiNotifications.length > 0 ? apiNotifications : fallbackNotifications
  const unreadCount = notifications.filter(
    (notification) => !notification.readAt && !readIds.includes(notification.id),
  ).length

  async function markAsRead(id: string) {
    const wasRead = readIds.includes(id)
    setReadIds((current) => (current.includes(id) ? current : [...current, id]))

    if (wasRead) {
      return
    }

    try {
      await notificationApi.markNotificationRead(id)
    } catch {
      setReadIds((current) => current.filter((readId) => readId !== id))
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.readAt)
      .map((notification) => notification.id)
    setReadIds((current) => Array.from(new Set([...current, ...unreadIds])))

    try {
      await notificationApi.markAllNotificationsRead()
    } catch {
      setReadIds((current) =>
        current.filter((id) => !unreadIds.includes(id)),
      )
    }
  }

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-card px-3 text-sm font-bold shadow-sm transition hover:bg-muted"
        aria-label="Buka notifikasi"
      >
        <Bell size={17} />
        <span className="hidden sm:inline">Notifikasi</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-extrabold text-secondary-foreground shadow-sm">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-lg border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Notification center
              </p>
              <h2 className="font-heading text-lg font-extrabold">
                Update {getAreaLabel(area)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              className="mx-4 mt-3 inline-flex h-9 items-center justify-center rounded-md border bg-card px-3 text-xs font-bold transition hover:bg-muted"
            >
              Tandai semua dibaca
            </button>
          ) : null}

          <div className="max-h-[420px] divide-y overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.kind]
              const read = Boolean(notification.readAt) || readIds.includes(notification.id)

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void markAsRead(notification.id)}
                  className={cn(
                    'grid w-full grid-cols-[auto_1fr] gap-3 p-4 text-left transition hover:bg-muted',
                    !read && 'bg-accent/55',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-md',
                      read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-foreground">
                      {notification.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {notification.description}
                    </span>
                    <span className="mt-2 block text-[11px] font-bold uppercase text-primary">
                      {notification.time}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function getAreaLabel(area: NotificationCenterProps['area']) {
  if (area === 'admin') {
    return 'admin'
  }

  if (area === 'organizer') {
    return 'organizer'
  }

  return 'relawan'
}

function getFallbackNotifications(area: NotificationCenterProps['area']): ApiNotification[] {
  if (area === 'admin') {
    return [
      {
        id: 'admin-org',
        kind: 'moderation' as const,
        title: '2 organizer menunggu verifikasi',
        description: 'Review profil organizer sebelum event baru dipublikasikan.',
        time: 'Hari ini',
      },
      {
        id: 'admin-event',
        kind: 'applicant' as const,
        title: '8 event aktif minggu ini',
        description: 'Pantau event dengan keterisian hampir penuh.',
        time: '2 jam lalu',
      },
    ]
  }

  if (area === 'organizer') {
    return [
      {
        id: 'org-review',
        kind: 'applicant' as const,
        title: 'Applicant baru perlu review',
        description: 'Bersih Sungai Gajah Wong memiliki pendaftar baru.',
        time: '30 menit lalu',
      },
      {
        id: 'org-checkin',
        kind: 'reminder' as const,
        title: 'Siapkan check-in relawan',
        description: 'Event weekend membutuhkan attendance tracking.',
        time: 'Besok',
      },
    ]
  }

  return [
    {
      id: 'vol-accepted',
      kind: 'accepted' as const,
      title: 'Aplikasi diterima',
      description: 'Kelas Inspirasi Anak Kali Code siap masuk tahap briefing.',
      time: 'Hari ini',
    },
    {
      id: 'vol-reminder',
      kind: 'reminder' as const,
      title: 'Briefing dimulai besok',
      description: 'Cek jadwal dan availability sebelum kegiatan.',
      time: 'Besok 19.00',
    },
    {
      id: 'vol-certificate',
      kind: 'certificate' as const,
      title: 'Sertifikat siap diunduh',
      description: 'Perpustakaan Pop-up Kampung sudah menerbitkan credential.',
      time: '2 hari lalu',
    },
  ]
}
