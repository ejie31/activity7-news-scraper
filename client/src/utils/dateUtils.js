export function formatDate(dateString) {
  if (!dateString) return "Date not available"

  try {
    // Handle various date formats
    let date

    // Try parsing as ISO string first
    if (dateString.includes("T") || dateString.includes("Z")) {
      date = new Date(dateString)
    } else {
      // Try parsing other common formats
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      // Try some common date patterns
      const patterns = [
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
        /(\d{2})-(\d{2})-(\d{4})/, // MM-DD-YYYY
      ]

      for (const pattern of patterns) {
        const match = dateString.match(pattern)
        if (match) {
          date = new Date(match[0])
          if (!isNaN(date.getTime())) break
        }
      }
    }

    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    // Format the date nicely
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Show relative time for recent articles
    if (diffDays <= 1) {
      return "Today"
    } else if (diffDays <= 2) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      // Show full date for older articles
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  } catch (error) {
    console.warn("Date parsing error:", error)
    return "Date unavailable"
  }
}

export function parseDate(dateString) {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export function isRecentDate(dateString, daysThreshold = 7) {
  const date = parseDate(dateString)
  if (!date) return false

  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= daysThreshold
}

export function getRelativeTime(dateString) {
  const date = parseDate(dateString)
  if (!date) return "Unknown time"

  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}
