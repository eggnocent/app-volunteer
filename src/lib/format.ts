const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
})

const numberFormatter = new Intl.NumberFormat('id-ID')

export function formatDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Tanggal belum diisi'
  }

  return dateFormatter.format(parsedDate)
}

export function formatWeekday(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Hari belum diisi'
  }

  return weekdayFormatter.format(parsedDate)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatEventTime(startTime: string, endTime: string) {
  return `${startTime}-${endTime} WIB`
}

export function getFillPercentage(registered: number, quota: number) {
  if (quota <= 0) {
    return 0
  }

  return Math.min(Math.round((registered / quota) * 100), 100)
}
