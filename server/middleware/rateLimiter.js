const rateLimit = require("express-rate-limit")

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      })
    },
  })
}

// Different rate limits for different endpoints
const scraperLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests per minute
  "Too many scraping requests, please try again later",
)

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  "Too many requests from this IP, please try again later",
)

// Apply rate limiting based on route
module.exports = (req, res, next) => {
  if (req.path.includes("/scraper/scrape")) {
    return scraperLimiter(req, res, next)
  }
  return generalLimiter(req, res, next)
}
