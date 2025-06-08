"use client"

import { useState, useEffect } from "react"

const NewsFilter = ({ onFilter, onSort, currentSort, currentFilter = "", totalArticles = 0, filteredCount = 0 }) => {
  const [keyword, setKeyword] = useState(currentFilter)

  // Update local state when prop changes
  useEffect(() => {
    setKeyword(currentFilter)
  }, [currentFilter])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    console.log("Submitting filter:", keyword)
    onFilter(keyword)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setKeyword(value)

    // Optional: Filter as you type (uncomment if you want real-time filtering)
    // onFilter(value)
  }

  const handleSortChange = (e) => {
    onSort(e.target.value)
  }

  const clearFilter = () => {
    setKeyword("")
    onFilter("")
  }

  return (
    <div className="news-filter">
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <div className="filter-input-group">
          <input
            type="text"
            placeholder="Filter by keyword (e.g., technology, politics)"
            value={keyword}
            onChange={handleInputChange}
            className="filter-input"
          />
          <button type="submit" className="filter-button">
            Filter
          </button>
          {keyword && (
            <button type="button" onClick={clearFilter} className="clear-button">
              Clear
            </button>
          )}
        </div>

        {/* Show filter status */}
        {totalArticles > 0 && (
          <div className="filter-status">
            {keyword ? (
              <small>
                {filteredCount} of {totalArticles} articles match "{keyword}"
              </small>
            ) : (
              <small>{totalArticles} articles available</small>
            )}
          </div>
        )}
      </form>

      <div className="sort-controls">
        <label htmlFor="sort-select">Sort by:</label>
        <select id="sort-select" value={currentSort} onChange={handleSortChange} className="sort-select">
          <option value="date">Publication Date</option>
          <option value="relevance">Relevance</option>
          <option value="source">Source</option>
        </select>
      </div>
    </div>
  )
}

export default NewsFilter