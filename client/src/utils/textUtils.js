export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function cleanText(text) {
  if (!text) return ""
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim()
}

export function extractKeywords(text) {
  if (!text) return []

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3)

  return [...new Set(words)]
}

export function highlightKeyword(text, keyword) {
  if (!keyword || !text) return text

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function capitalizeWords(text) {
  if (!text) return ""
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function removeHtmlTags(text) {
  if (!text) return ""
  return text.replace(/<[^>]*>/g, "")
}

export function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}
