const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const scraperRoutes = require("./routes/scraper")
const corsMiddleware = require("./middleware/cors")
const rateLimiter = require("./middleware/rateLimiter")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(corsMiddleware)
app.use(rateLimiter)

// Routes
app.use("/api/scraper", scraperRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "News Scraper API is running" })
})

// Serve static files from React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
