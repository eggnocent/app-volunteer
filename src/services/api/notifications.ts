import { apiRequest } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type { ApiEnvelope, ApiNotification } from '@/services/api/types'

export async function getNotifications() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiNotification[]>>('/api/notifications'),
  )
}

export async function markNotificationRead(notificationId: string) {
  await apiRequest<void>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}

export async function markAllNotificationsRead() {
  await apiRequest<void>('/api/notifications/read-all', {
    method: 'PATCH',
  })
}
