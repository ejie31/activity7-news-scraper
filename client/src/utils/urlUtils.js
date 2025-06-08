export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function normalizeUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

export function makeAbsoluteUrl(relativeUrl, baseUrl) {
  try {
    return new URL(relativeUrl, baseUrl).toString()
  } catch {
    return relativeUrl
  }
}

export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return "Unknown Source"
  }
}

export function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

export function getUrlPath(url) {
  try {
    return new URL(url).pathname
  } catch {
    return "/"
  }
}
