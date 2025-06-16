// Default locale (can be made dynamic)
const DEFAULT_LOCALE = "en-US"

// Tries to parse a date string with known formats
function tryCustomParse(dateString) {
  const patterns = [
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: "YYYY-MM-DD" },
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, format: "MM/DD/YYYY" },
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: "MM-DD-YYYY" },
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, format: "DD/MM/YYYY" },
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: "DD-MM-YYYY" },
  ]

  for (const { regex, format } of patterns) {
    const match = dateString.match(regex)
    if (match) {
      let [, part1, part2, part3] = match
      if (format === "YYYY-MM-DD") return new Date(`${part1}-${part2}-${part3}T00:00:00Z`)
      if (["MM/DD/YYYY", "MM-DD-YYYY"]) return new Date(`${part3}-${part1}-${part2}T00:00:00Z`)
      if (["DD/MM/YYYY", "DD-MM-YYYY"]) return new Date(`${part3}-${part2}-${part1}T00:00:00Z`)
    }
  }

  return null
}

// Parses any supported date string into a valid Date object
export function parseDate(dateString) {
  if (!dateString) return null

  let date = new Date(dateString)
  if (isNaN(date.getTime())) {
    date = tryCustomParse(dateString)
  }

  return !isNaN(date?.getTime()) ? date : null
}

// Formats a date to a user-friendly string
export function formatDate(dateString, locale = DEFAULT_LOCALE) {
  const date = parseDate(dateString)
  if (!date) return "Date not available"

  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays <= 7) return `${diffDays} days ago`

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Checks if a date is within the last N days
export function isRecentDate(dateString, daysThreshold = 7) {
  const date = parseDate(dateString)
  if (!date) return false

  const now = new Date()
  const diffDays = (now - date) / (1000 * 60 * 60 * 24)
  return diffDays <= daysThreshold
}

// Returns a human-readable "time ago" string
export function getRelativeTime(dateString, locale = DEFAULT_LOCALE) {
  const date = parseDate(dateString)
  if (!date) return "Unknown time"

  const now = new Date()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (seconds < 60) return rtf.format(-seconds, "seconds")
  if (minutes < 60) return rtf.format(-minutes, "minutes")
  if (hours < 24) return rtf.format(-hours, "hours")
  if (days < 7) return rtf.format(-days, "days")

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
