// The API sends dates as unix timestamps in seconds.
const toDate = (seconds) => (seconds ? new Date(seconds * 1000) : null)

export const formatDateTime = (seconds) => toDate(seconds)?.toLocaleString() ?? '—'

const UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

// e.g. "5 minutes ago", "yesterday"; under a minute reads as "just now".
export const timeAgo = (seconds) => {
  if (!seconds) return null

  const elapsed = Math.floor(Date.now() / 1000) - seconds

  for (const [unit, size] of UNITS) {
    if (elapsed >= size) return relative.format(-Math.floor(elapsed / size), unit)
  }

  return 'just now'
}
