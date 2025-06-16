"use client"

import { useState } from "react"
import { validateUrl, normalizeUrl } from "../utils/urlUtils"

const UrlInput = ({ onScrape, loading }) => {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Please enter an URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL")
      return
    }

    const normalizedUrl = normalizeUrl(url)
    onScrape(normalizedUrl)
  }

  const popularSites = [
    "https://www.cnn.com",
    "https://www.bbc.com/news",
    "https://techcrunch.com",
    "https://www.reuters.com",
    "https://www.rappler.com",
    "https://www.philstar.com",
    "https://www.gmanetwork.com",
    "https://www.abs-cbn.com",
  ]

  return (
    <div className="url-input-container">
      <form onSubmit={handleSubmit} className="url-form">
        <div className="url-input-group">
          <input
            type="text"
            placeholder="Enter website URL to scrape (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
            disabled={loading}
          />
          <button type="submit" className="scrape-button" disabled={loading}>
            {loading ? "Scraping..." : "Scrape News"}
          </button>
        </div>
        {error && <p className="url-error">{error}</p>}
      </form>

      <div className="popular-sites">
        <p>Try these popular news sites:</p>
        <div className="site-buttons">
          {popularSites.map((site) => (
            <button key={site} onClick={() => setUrl(site)} className="site-button" disabled={loading}>
              {new URL(site).hostname.replace("www.", "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UrlInput
