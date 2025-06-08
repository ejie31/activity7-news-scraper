"use client"

import { useState, useEffect } from "react"
import NewsCard from "./components/NewsCard"
import NewsFilter from "./components/NewsFilter"
import LoadingSpinner from "./components/LoadingSpinner"
import UrlInput from "./components/UrlInput"
import { useNewsScraper } from "./hooks/useNewsScraper"
import "./App.css"
import "./styles/components.css"

function App() {
  const { articles, loading, error, scrapeUrl, filterArticles, sortArticles } = useNewsScraper()

  const [displayArticles, setDisplayArticles] = useState([])
  const [sortBy, setSortBy] = useState("date")
  const [filterKeyword, setFilterKeyword] = useState("")

  // Update display articles whenever articles, filter, or sort changes
  useEffect(() => {
    console.log("Effect running - articles:", articles.length, "filter:", filterKeyword, "sort:", sortBy)

    let result = [...articles] // Create a copy

    // Apply filter first
    if (filterKeyword && filterKeyword.trim()) {
      result = filterArticles(result, filterKeyword)
      console.log("After filtering:", result.length)
    }

    // Apply sorting
    result = sortArticles(result, sortBy)
    console.log("After sorting:", result.length)

    setDisplayArticles(result)
  }, [articles, filterKeyword, sortBy, filterArticles, sortArticles])

  const handleFilter = (keyword) => {
    console.log("Filter changed to:", keyword)
    setFilterKeyword(keyword)
  }

  const handleSort = (sortType) => {
    console.log("Sort changed to:", sortType)
    setSortBy(sortType)
  }

  // Enhanced error display with suggestions
  const renderError = () => {
    if (!error) return null

    let errorMessage = error
    let suggestion = ""

    if (typeof error === "object" && error.suggestion) {
      errorMessage = error.error || error.message
      suggestion = error.suggestion
    }

    return (
      <div className="error-message">
        <h3>Scraping Failed</h3>
        <p className="error-text">{errorMessage}</p>
        {suggestion && <p className="error-suggestion">💡 {suggestion}</p>}
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="news-scraper-app">
      <header className="app-header">
        <h1>News Scraper</h1>
        <p>Extract and analyze news articles from any website</p>
      </header>

      <div className="app-content">
        <div className="controls-section">
          <UrlInput onScrape={scrapeUrl} loading={loading} />
          <NewsFilter
            onFilter={handleFilter}
            onSort={handleSort}
            currentSort={sortBy}
            currentFilter={filterKeyword}
            totalArticles={articles.length}
            filteredCount={displayArticles.length}
          />
        </div>

        {loading && <LoadingSpinner />}

        {renderError()}

        {!loading && !error && articles.length > 0 && (
          <div className="filter-stats">
            {filterKeyword ? (
              <p>
                Showing {displayArticles.length} of {articles.length} articles for "{filterKeyword}"
                {displayArticles.length === 0 && " (No matches found)"}
              </p>
            ) : (
              <p>Showing all {articles.length} articles</p>
            )}
          </div>
        )}

        <div className="articles-grid">
          {displayArticles.map((article, index) => (
            <NewsCard key={`${article.url || ""}-${index}`} article={article} />
          ))}
        </div>

        {displayArticles.length === 0 && !loading && !error && articles.length === 0 && (
          <div className="empty-state">
            <p>Enter a website URL above to start scraping news articles</p>
            <p className="empty-state-tip">
              Try starting with news aggregators like Hacker News or Reuters for better success rates
            </p>
          </div>
        )}

        {displayArticles.length === 0 && !loading && !error && articles.length > 0 && filterKeyword && (
          <div className="no-results">
            <p>No articles match your filter "{filterKeyword}"</p>
            <p>Try a different keyword or clear the filter to see all articles.</p>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <div className="ethical-notice">
          <h3>Ethical Scraping Guidelines</h3>
          <ul>
            <li>Always check robots.txt before scraping</li>
            <li>Respect rate limits and don't overload servers</li>
            <li>Use official APIs when available</li>
            <li>Consider legal implications of data usage</li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default App
