import type {
  ApplicationStatus,
  EventMode,
  EventStatus,
  UserRole,
  UserStatus,
  VolunteerRole,
} from '@/types/migunani'

export const eventStatusOptions: EventStatus[] = ['Open', 'Nearly Full', 'Closed']

export const userStatusOptions: UserStatus[] = ['Active', 'Inactive', 'Suspended']

export const userRoleOptions: UserRole[] = ['volunteer', 'organizer', 'admin']

export const volunteerRoleOptions: VolunteerRole[] = [
  'Field Volunteer',
  'Education Mentor',
  'Health Support',
  'Content & Documentation',
  'Logistics Crew',
  'Community Facilitator',
]

export const eventModeOptions: EventMode[] = ['Offline', 'Online', 'Hybrid']

const eventStatusLabels: Record<EventStatus, string> = {
  Open: 'Buka',
  'Nearly Full': 'Hampir penuh',
  Closed: 'Ditutup',
}

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  Draft: 'Draft',
  Submitted: 'Terkirim',
  Accepted: 'Diterima',
  Rejected: 'Ditolak',
  Cancelled: 'Dibatalkan',
  Waitlisted: 'Daftar tunggu',
  Completed: 'Selesai',
}

const userStatusLabels: Record<UserStatus, string> = {
  Active: 'Aktif',
  Inactive: 'Tidak aktif',
  Suspended: 'Ditangguhkan',
}

const userRoleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  organizer: 'Organizer',
  volunteer: 'Relawan',
}

const volunteerRoleLabels: Record<VolunteerRole, string> = {
  'Field Volunteer': 'Relawan lapangan',
  'Education Mentor': 'Mentor pendidikan',
  'Health Support': 'Pendamping kesehatan',
  'Content & Documentation': 'Dokumentasi konten',
  'Logistics Crew': 'Tim logistik',
  'Community Facilitator': 'Fasilitator komunitas',
}

const eventModeLabels: Record<EventMode, string> = {
  Offline: 'Tatap muka',
  Online: 'Online',
  Hybrid: 'Hybrid',
}

export function getEventStatusLabel(status: EventStatus) {
  return eventStatusLabels[status]
}

export function getApplicationStatusLabel(status: ApplicationStatus) {
  return applicationStatusLabels[status]
}

export function getStatusLabel(status: EventStatus | ApplicationStatus) {
  return status in eventStatusLabels
    ? eventStatusLabels[status as EventStatus]
    : applicationStatusLabels[status as ApplicationStatus]
}

export function getUserStatusLabel(status: UserStatus) {
  return userStatusLabels[status]
}

export function getUserRoleLabel(role: UserRole) {
  return userRoleLabels[role]
}

export function getVolunteerRoleLabel(role: VolunteerRole) {
  return volunteerRoleLabels[role]
}

export function getEventModeLabel(mode: EventMode) {
  return eventModeLabels[mode]
}
