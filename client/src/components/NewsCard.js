import { formatDate } from "../utils/dateUtils"
import { truncateText } from "../utils/textUtils"

const NewsCard = ({ article }) => {
  // Handle cases where URL might be missing or invalid
  const getArticleUrl = () => {
    if (article.url && article.url !== "" && article.url !== "#") {
      return article.url
    }
    return null // No valid URL available
  }

  const articleUrl = getArticleUrl()

  // Render headline with or without link
  const renderHeadline = () => {
    const headline = article.headline || "No headline available"

    if (articleUrl) {
      return (
        <a href={articleUrl} target="_blank" rel="noopener noreferrer">
          {headline}
        </a>
      )
    } else {
      return <span className="headline-no-link">{headline}</span>
    }
  }

  // Determine if article has complete information
  const completenessScore = [!!article.headline, !!article.author, !!article.publishDate, !!article.source].filter(
    Boolean,
  ).length

  const isComplete = completenessScore >= 3

  return (
    <div
      className={`news-card ${isComplete ? "complete-article" : ""}`}
      data-sample={article.isSample ? "true" : "false"}
    >
      {article.image && (
        <div className="news-card-image">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.headline || "News article"}
            onError={(e) => {
              e.target.style.display = "none"
            }}
          />
        </div>
      )}

      <div className="news-card-content">
        {/* Sample indicator */}
        {article.isSample && <div className="sample-badge">📰 Sample Article</div>}

        {/* Headline - Always display, with or without link */}
        <h3 className="news-card-headline">{renderHeadline()}</h3>

        {/* Key metadata - Always display available information */}
        <div className="news-card-meta">
          {/* Author Name */}
          <div className="news-card-author">
            <span className="meta-label">Author:</span>
            <span className="meta-value">{article.author || <em className="meta-missing">Not available</em>}</span>
          </div>

          {/* Publication Date */}
          <div className="news-card-date">
            <span className="meta-label">Published:</span>
            <span className="meta-value">
              {article.publishDate ? (
                formatDate(article.publishDate)
              ) : (
                <em className="meta-missing">Date not available</em>
              )}
            </span>
          </div>

          {/* Source/Website Name */}
          <div className="news-card-source">
            <span className="meta-label">Source:</span>
            <span className="meta-value">{article.source || <em className="meta-missing">Unknown source</em>}</span>
          </div>

          {/* URL Status */}
          <div className="news-card-url-status">
            <span className="meta-label">Link:</span>
            <span className="meta-value">
              {articleUrl ? (
                <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="url-link">
                  Read full article →
                </a>
              ) : (
                <em className="meta-missing">No link available</em>
              )}
            </span>
          </div>
        </div>

        {/* Summary if available */}
        {article.summary && <p className="news-card-summary">{truncateText(article.summary, 150)}</p>}

        {/* Data completeness indicator */}
        <div className="news-card-footer">
          <div className="completeness-indicator">
            <span className="completeness-label">Data completeness:</span>
            <div className="completeness-bar">
              <div className="completeness-fill" style={{ width: `${(completenessScore / 4) * 100}%` }}></div>
            </div>
            <span className="completeness-text">{completenessScore}/4 fields</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
