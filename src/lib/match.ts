import type { VolunteerEvent, VolunteerProfile } from '@/types/migunani'

export function getEventMatch(event: VolunteerEvent, profile: VolunteerProfile) {
  const reasons: string[] = []
  let score = 52

  if (profile.interests.includes(event.category)) {
    score += 22
    reasons.push(`Minat ${event.category}`)
  }

  if (event.city === profile.city || event.city === 'Online') {
    score += 14
    reasons.push(event.city === 'Online' ? 'Remote friendly' : `Dekat ${profile.city}`)
  }

  if (profile.savedEventIds.includes(event.id)) {
    score += 8
    reasons.push('Tersimpan')
  }

  if (event.status === 'Open') {
    score += 4
  }

  return {
    matchScore: Math.min(score, 98),
    matchReasons: reasons.slice(0, 2),
  }
}
