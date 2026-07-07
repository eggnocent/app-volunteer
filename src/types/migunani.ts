export type EventCategory =
  | 'Pendidikan'
  | 'Lingkungan'
  | 'Kesehatan'
  | 'Sosial'
  | 'Bencana'
  | 'Literasi'
  | 'Komunitas'

export type EventMode = 'Offline' | 'Online' | 'Hybrid'

export type EventStatus = 'Open' | 'Nearly Full' | 'Closed'

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Waitlisted'
  | 'Completed'

export type VolunteerRole =
  | 'Field Volunteer'
  | 'Education Mentor'
  | 'Health Support'
  | 'Content & Documentation'
  | 'Logistics Crew'
  | 'Community Facilitator'

export type Category = {
  id: string
  name: EventCategory
  description: string
  color: string
  bgColor: string
}

export type Organizer = {
  id: string
  name: string
  type: string
  city: string
  verified: boolean
  logoInitial: string
  rating: number
  totalEvents: number
  responseTime: string
}

export type VolunteerEvent = {
  id: string
  slug: string
  title: string
  category: EventCategory
  organizerId: string
  location: string
  city: string
  mode: EventMode
  date: string
  startTime: string
  endTime: string
  durationHours: number
  quota: number
  registered: number
  status: EventStatus
  image: string
  shortDescription: string
  description: string
  benefits: string[]
  skills: string[]
  roles: VolunteerRole[]
  impactTarget: string
  tags: string[]
  featured?: boolean
}

export type VolunteerProfile = {
  id: string
  name: string
  university: string
  major: string
  city: string
  avatarInitials: string
  totalHours: number
  completedEvents: number
  certificates: number
  savedEventIds: string[]
  interests: EventCategory[]
}

export type VolunteerApplication = {
  id: string
  eventId: string
  role: VolunteerRole
  status: ApplicationStatus
  submittedAt: string
  motivation: string
  availability: string[]
  checkedInAt?: string | null
}

export type Certificate = {
  id: string
  eventId: string
  issuedAt: string
  credentialId: string
  hours: number
}

export type DashboardStat = {
  id: string
  label: string
  value: string
  delta: string
}

export type OrganizerMetric = {
  id: string
  label: string
  value: string
  helper: string
}

export type UserRole = 'admin' | 'organizer' | 'volunteer'

export type UserStatus = 'Active' | 'Inactive' | 'Suspended'

export type PlatformUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  city: string
  joinedAt: string
  avatarInitials: string
}

export type AdminStat = {
  id: string
  label: string
  value: string
  helper: string
}
