import type {
  ApplicationStatus,
  Certificate,
  EventCategory,
  Organizer,
  PlatformUser,
  UserRole,
  UserStatus,
  VolunteerApplication,
  VolunteerEvent,
  VolunteerProfile,
  VolunteerRole,
} from '@/types/migunani'

export type ApiEnvelope<T> = {
  data: T
  links?: ApiPaginationLinks
  meta?: ApiPaginationMeta
}

export type ApiPaginationLinks = {
  first: string | null
  last: string | null
  previous: string | null
  next: string | null
}

export type ApiPaginationMeta = {
  currentPage: number
  from: number | null
  lastPage: number
  path: string
  perPage: number
  to: number | null
  total: number
}

export type ApiValidationErrors = Record<string, string[]>

export type ApiErrorPayload = {
  message?: string
  errors?: ApiValidationErrors
}

export type ApiNotification = {
  id: string
  kind:
    | 'accepted'
    | 'reminder'
    | 'certificate'
    | 'applicant'
    | 'moderation'
  title: string
  description: string
  time: string
  readAt?: string | null
  createdAt?: string
}

export type ApiUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status?: UserStatus
  city?: string
  joinedAt?: string
  avatarInitials?: string
  organizerId?: string
  organizer_id?: string
  organizer?: ApiOrganizer | Organizer | null
  organization?: ApiOrganizer | Organizer | null
  organizers?: ApiOrganizer[]
}

export type ApiAuthResponse = {
  user: ApiUser
}

export type ApiRegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: Exclude<UserRole, 'admin'>
  phone?: string
  city?: string
  organizationName?: string
  organizationType?: string
  university?: string
}

export type ApiLoginPayload = {
  email: string
  password: string
}

export type ApiCategory = {
  id: string
  name: EventCategory
  description: string
  color: string
  bgColor: string
}

export type ApiBooleanLike = boolean | number | string | null | undefined

export type ApiOrganizer = Partial<Organizer> & {
  id: string
  name?: string
  type?: string
  city?: string
  verified?: ApiBooleanLike
  isVerified?: ApiBooleanLike
  is_verified?: ApiBooleanLike
  verifiedAt?: string | null
  verified_at?: string | null
  verificationStatus?: string | null
  verification_status?: string | null
  logoInitial?: string
  logo_initial?: string
  totalEvents?: number
  total_events?: number
  responseTime?: string
  response_time?: string
}

export type ApiEvent = Omit<VolunteerEvent, 'category'> & {
  categoryId?: string
  category: EventCategory
  organizer?: ApiOrganizer
  remainingQuota?: number
  isSaved?: boolean
  myApplication?: ApiApplication | null
  relatedEvents?: ApiEvent[]
}

export type ApiApplication = Omit<VolunteerApplication, 'role' | 'status'> & {
  role: VolunteerRole
  status: ApplicationStatus
  event?: ApiEvent
  volunteer?: ApiUser
  user?: ApiUser
  applicant?: ApiUser
  profile?: ApiUser
  volunteerProfile?: ApiUser
  volunteer_profile?: ApiUser
  volunteerName?: string
  volunteer_name?: string
  applicantName?: string
  applicant_name?: string
  userName?: string
  user_name?: string
  volunteerEmail?: string
  volunteer_email?: string
  applicantEmail?: string
  applicant_email?: string
  volunteerCity?: string
  volunteer_city?: string
  applicantCity?: string
  applicant_city?: string
  checkedInAt?: string | null
}

export type ApiCertificate = Certificate & {
  status?: 'Issued' | 'Revoked'
  isValid?: boolean
  volunteerName?: string
  eventTitle?: string
  organizerName?: string
  role?: VolunteerRole
  eventDate?: string
  revokedAt?: string | null
  replacementCredentialId?: string | null
}

export type ApiHome = {
  stats: {
    eventCount: number
    availableEvents: number
    totalSlots: number
    totalRegistered: number
    categoryCount: number
    organizerCount: number
  }
  categories: ApiCategory[]
  featuredEvents: ApiEvent[]
}

export type ApiVolunteerDashboard = {
  profile: VolunteerProfile
  applications: ApiApplication[]
  certificates: ApiCertificate[]
  savedEvents: ApiEvent[]
}

export type ApiOrganizerDashboard = {
  organizer: ApiOrganizer
  events: ApiEvent[]
  applications: ApiApplication[]
  metrics?: Array<{ id: string; label: string; value: string; helper: string }>
}

export type ApiAdminDashboard = {
  stats: Array<{ id: string; label: string; value: string; helper: string }>
  users: PlatformUser[]
  events: ApiEvent[]
  organizers: ApiOrganizer[]
}

export type PaginatedApiEvents = ApiEnvelope<ApiEvent[]>
