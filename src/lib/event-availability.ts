import type { VolunteerEvent } from '@/types/migunani'

export function isEventOpenForRegistration(event?: VolunteerEvent | null) {
  return event?.status === 'Open' || event?.status === 'Nearly Full'
}

export function getClosedEventMessage(event?: VolunteerEvent | null) {
  if (event?.status === 'Closed') {
    return 'Pendaftaran event ini sudah ditutup.'
  }

  return 'Pendaftaran event belum tersedia.'
}
