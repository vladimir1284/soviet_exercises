/**
 * Get current local time in ISO 8601 format with timezone offset
 */
export function getLocalISOString(date: Date = new Date()): string {
  const offset = -date.getTimezoneOffset()
  const diff = offset >= 0 ? '+' : '-'
  const pad = (num: number) => String(num).padStart(2, '0')

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    'h' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    diff +
    pad(Math.floor(Math.abs(offset) / 60)) +
    ':' +
    pad(Math.abs(offset) % 60)
  ).replace('h', ':') // Using 'h' then replacing to avoid T00:00:00Z issues if any
}

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getLocalDateString(date: Date = new Date()): string {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Get current timezone offset in minutes (e.g., -300 for EST)
 */
export function getTimezoneOffsetMinutes(): number {
  return -new Date().getTimezoneOffset()
}
