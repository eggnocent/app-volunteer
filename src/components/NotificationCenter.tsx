import {
  Bell,
  CalendarClock,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const panelId = useId()
  const titleId = useId()
  const fallbackNotifications = useMemo<ApiNotification[]>(() => [], [])
  const loadNotifications = useCallback(
    () => notificationApi.getNotifications(),
    [],
  )
  const {
    data: apiNotifications,
    error,
    isLoading,
  } = useAsyncResource(loadNotifications, [])
  const notifications = error ? fallbackNotifications : apiNotifications
  const unreadCount = notifications.filter(
    (notification) => !notification.readAt && !readIds.includes(notification.id),
  ).length
  const closePanel = useCallback((restoreFocus = false) => {
    setOpen(false)

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        buttonRef.current?.focus({ preventScroll: true })
      })
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true })
    })

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }

      closePanel()
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      closePanel(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closePanel, open])

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
      .filter((notification) => !notification.readAt && !readIds.includes(notification.id))
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
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-card px-3 text-sm font-bold shadow-sm transition hover:bg-muted"
        aria-label={open ? 'Tutup notifikasi' : 'Buka notifikasi'}
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
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
        <section
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="absolute right-0 top-12 z-40 flex max-h-[min(560px,calc(100svh-5rem))] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg border bg-card shadow-xl outline-none"
        >
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Notification center
              </p>
              <h2 id={titleId} className="font-heading text-lg font-extrabold">
                Update {getAreaLabel(area)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => closePanel(true)}
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

          <div className="min-h-0 divide-y overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                <div className="h-14 animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-14 animate-pulse rounded-md bg-muted" />
              </div>
            ) : null}

            {!isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-heading text-lg font-extrabold text-foreground">
                  Belum ada notifikasi
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Update terbaru untuk akunmu akan muncul di sini.
                </p>
              </div>
            ) : null}

            {!isLoading && notifications.map((notification) => {
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
