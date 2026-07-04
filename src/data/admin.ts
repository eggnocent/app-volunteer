import type { AdminStat, PlatformUser } from '@/types/migunani'

export const platformUsers: PlatformUser[] = [
  {
    id: 'usr-nadira',
    name: 'Nadira Putri',
    email: 'nadira.putri@mail.com',
    role: 'volunteer',
    status: 'Active',
    city: 'Yogyakarta',
    joinedAt: '2025-09-14',
    avatarInitials: 'NP',
  },
  {
    id: 'usr-rizal',
    name: 'Rizal Fadhilah',
    email: 'rizal.fadhilah@mail.com',
    role: 'volunteer',
    status: 'Active',
    city: 'Sleman',
    joinedAt: '2025-10-02',
    avatarInitials: 'RF',
  },
  {
    id: 'usr-anisa',
    name: 'Anisa Rahmawati',
    email: 'anisa.rahma@mail.com',
    role: 'volunteer',
    status: 'Inactive',
    city: 'Bantul',
    joinedAt: '2025-11-20',
    avatarInitials: 'AR',
  },
  {
    id: 'usr-bagus',
    name: 'Bagus Setiawan',
    email: 'bagus.setiawan@mail.com',
    role: 'organizer',
    status: 'Active',
    city: 'Yogyakarta',
    joinedAt: '2025-08-05',
    avatarInitials: 'BS',
  },
  {
    id: 'usr-dewi',
    name: 'Dewi Kartika',
    email: 'dewi.kartika@mail.com',
    role: 'organizer',
    status: 'Active',
    city: 'Surakarta',
    joinedAt: '2025-07-18',
    avatarInitials: 'DK',
  },
  {
    id: 'usr-farhan',
    name: 'Farhan Maulana',
    email: 'farhan.m@mail.com',
    role: 'volunteer',
    status: 'Active',
    city: 'Magelang',
    joinedAt: '2026-01-10',
    avatarInitials: 'FM',
  },
  {
    id: 'usr-gita',
    name: 'Gita Pramesti',
    email: 'gita.pramesti@mail.com',
    role: 'volunteer',
    status: 'Suspended',
    city: 'Yogyakarta',
    joinedAt: '2025-12-03',
    avatarInitials: 'GP',
  },
  {
    id: 'usr-hendra',
    name: 'Hendra Wijaya',
    email: 'hendra.w@mail.com',
    role: 'organizer',
    status: 'Active',
    city: 'Semarang',
    joinedAt: '2025-06-22',
    avatarInitials: 'HW',
  },
  {
    id: 'usr-admin',
    name: 'Admin Migunani',
    email: 'admin@migunani.id',
    role: 'admin',
    status: 'Active',
    city: 'Yogyakarta',
    joinedAt: '2025-01-01',
    avatarInitials: 'AM',
  },
]

export const adminStats: AdminStat[] = [
  {
    id: 'total-users',
    label: 'Total pengguna',
    value: '156',
    helper: '+12 bulan ini',
  },
  {
    id: 'total-events',
    label: 'Total event',
    value: '48',
    helper: '8 event aktif',
  },
  {
    id: 'total-organizers',
    label: 'Organizer terdaftar',
    value: '14',
    helper: '12 terverifikasi',
  },
  {
    id: 'total-hours',
    label: 'Total jam kontribusi',
    value: '2.840',
    helper: 'dari seluruh relawan',
  },
]

export function getAllUsers() {
  return platformUsers
}

export function getUsersByRole(role: PlatformUser['role']) {
  return platformUsers.filter((user) => user.role === role)
}

export function getUserById(id: string) {
  return platformUsers.find((user) => user.id === id)
}
