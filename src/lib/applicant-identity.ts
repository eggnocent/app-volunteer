import type { ApiApplication, ApiUser } from '@/services/api/types'

export type ApplicantIdentity = {
  name: string
  profileLine: string
  city?: string
}

export function getApiApplicantIdentity(
  application: ApiApplication,
  fallbackIdentity?: ApplicantIdentity,
): ApplicantIdentity {
  const volunteer = getApplicationVolunteer(application)
  const source = application as Record<string, unknown>
  const city = getString(
    volunteer?.city,
    source.volunteerCity,
    source.volunteer_city,
    source.applicantCity,
    source.applicant_city,
    fallbackIdentity?.city,
  )
  const email = getString(
    volunteer?.email,
    source.volunteerEmail,
    source.volunteer_email,
    source.applicantEmail,
    source.applicant_email,
    source.email,
  )
  const name = getString(
    volunteer?.name,
    source.volunteerName,
    source.volunteer_name,
    source.applicantName,
    source.applicant_name,
    source.userName,
    source.user_name,
    fallbackIdentity?.name,
    'Relawan terdaftar',
  )
  const profileLine = [city, email].filter(Boolean).join(' · ') ||
    getString(
      source.profileLine,
      source.profile_line,
      source.volunteerProfileLine,
      source.volunteer_profile_line,
      fallbackIdentity?.profileLine,
      'Profil relawan belum dilengkapi',
    )

  return {
    name: name ?? 'Relawan terdaftar',
    profileLine: profileLine ?? 'Profil relawan belum dilengkapi',
    city,
  }
}

export function getApplicationVolunteer(application?: ApiApplication | null) {
  if (!application) {
    return undefined
  }

  const source = application as Record<string, unknown>

  return unwrapUser(source.volunteer) ??
    unwrapUser(source.user) ??
    unwrapUser(source.applicant) ??
    unwrapUser(source.profile) ??
    unwrapUser(source.volunteerProfile) ??
    unwrapUser(source.volunteer_profile)
}

function unwrapUser(value: unknown): ApiUser | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === 'object' && 'data' in value) {
    return unwrapUser((value as { data?: unknown }).data)
  }

  return value as ApiUser
}

function getString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}
