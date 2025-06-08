const cheerio = require("cheerio")

class CheerioHelper {
  static extractArticles($, baseUrl) {
    const articles = []
    const source = this.extractDomain(baseUrl)

    // Common article selectors in order of preference
    const articleSelectors = [
      "article",
      ".article",
      ".post",
      ".news-item",
      ".story",
      ".entry",
      '[class*="article"]',
      '[class*="post"]',
      '[class*="news"]',
      '[class*="story"]',
    ]

    // Try structured article extraction first
    for (const selector of articleSelectors) {
      $(selector).each((index, element) => {
        if (articles.length >= 20) return false // Limit to 20 articles

        const article = this.extractArticleData($, $(element), baseUrl, source)
        if (article && article.headline && article.headline.length > 10) {
          articles.push(article)
        }
      })

      if (articles.length > 0) break // If we found articles, stop trying other selectors
    }

    // Fallback: Extract from headlines if no structured articles found
    if (articles.length === 0) {
      this.extractFromHeadlines($, baseUrl, source, articles)
    }

    // Remove duplicates and return
    return this.removeDuplicates(articles).slice(0, 20)
  }

  static extractArticleData($, $article, baseUrl, source) {
    const article = {
      headline: this.extractHeadline($, $article),
      author: this.extractAuthor($, $article),
      publishDate: this.extractDate($, $article),
      source: this.extractSourceName($, $article, source),
      url: this.extractUrl($, $article, baseUrl),
      summary: this.extractSummary($, $article),
      image: this.extractImage($, $article, baseUrl),
    }

    return article
  }

  static extractHeadline($, $article) {
    const headlineSelectors = [
      "h1",
      "h2",
      "h3",
      ".headline",
      ".title",
      ".entry-title",
      ".post-title",
      ".article-title",
      ".story-title",
      '[class*="headline"]',
      '[class*="title"]',
      '[data-testid*="headline"]',
      '[data-testid*="title"]',
      "header h1",
      "header h2",
      "header h3",
    ]

    for (const selector of headlineSelectors) {
      const $headline = $article.find(selector).first()
      if ($headline.length) {
        const text = this.cleanText($headline.text())
        if (text.length > 10 && text.length < 300) {
          return text
        }
      }
    }

    // Fallback: get the first significant text
    const text = this.cleanText($article.text())
    return text.length > 10 ? text.substring(0, 150) : "No headline found"
  }

  static extractAuthor($, $article) {
    const authorSelectors = [
      ".author",
      ".byline",
      ".writer",
      ".journalist",
      ".reporter",
      ".post-author",
      ".article-author",
      ".story-author",
      '[class*="author"]',
      '[class*="byline"]',
      '[class*="writer"]',
      '[rel="author"]',
      '[data-testid*="author"]',
      '[data-testid*="byline"]',
      ".author-name",
      ".by-author",
      ".written-by",
    ]

    for (const selector of authorSelectors) {
      const $author = $article.find(selector).first()
      if ($author.length) {
        let text = this.cleanText($author.text())

        // Clean up common prefixes
        text = text.replace(/^(by|author:?|written by|reporter:?)\s*/i, "")
        text = text.replace(/\s*-\s*.*$/, "") // Remove everything after dash

        if (text.length > 2 && text.length < 100) {
          return text
        }
      }
    }

    return ""
  }

  static extractDate($, $article) {
    const dateSelectors = [
      "time[datetime]",
      ".date",
      ".published",
      ".publish-date",
      ".publication-date",
      ".timestamp",
      ".post-date",
      ".article-date",
      ".story-date",
      '[class*="date"]',
      '[class*="time"]',
      '[class*="publish"]',
      '[data-testid*="date"]',
      '[data-testid*="time"]',
      ".meta-date",
      ".entry-date",
    ]

    for (const selector of dateSelectors) {
      const $date = $article.find(selector).first()
      if ($date.length) {
        // First try datetime attribute
        const datetime = $date.attr("datetime")
        if (datetime && this.isValidDate(datetime)) {
          return datetime
        }

        // Then try data attributes
        const dataDate = $date.attr("data-date") || $date.attr("data-time")
        if (dataDate && this.isValidDate(dataDate)) {
          return dataDate
        }

        // Finally try text content
        const text = this.cleanText($date.text())
        if (text && this.isValidDate(text)) {
          return text
        }
      }
    }

    return ""
  }

  static extractUrl($, $article, baseUrl) {
    // Check if article itself is a link
    if ($article.is("a[href]")) {
      return this.makeAbsoluteUrl($article.attr("href"), baseUrl)
    }

    // Find first link within article
    const $link = $article.find("a[href]").first()
    if ($link.length) {
      return this.makeAbsoluteUrl($link.attr("href"), baseUrl)
    }

    // Check parent for link
    const $parentLink = $article.closest("a[href]")
    if ($parentLink.length) {
      return this.makeAbsoluteUrl($parentLink.attr("href"), baseUrl)
    }

    return baseUrl
  }

  static extractSummary($, $article) {
    const summarySelectors = [
      ".summary",
      ".excerpt",
      ".description",
      ".lead",
      '[class*="summary"]',
      '[class*="excerpt"]',
      "p",
    ]

    for (const selector of summarySelectors) {
      const $summary = $article.find(selector).first()
      if ($summary.length) {
        const text = this.cleanText($summary.text())
        if (text.length > 50) {
          return text.substring(0, 300)
        }
      }
    }

    return ""
  }

  static extractImage($, $article, baseUrl) {
    const $img = $article.find("img").first()
    if ($img.length) {
      const src = $img.attr("src") || $img.attr("data-src") || $img.attr("data-lazy-src")
      if (src && !src.includes("data:image")) {
        return this.makeAbsoluteUrl(src, baseUrl)
      }
    }

    return ""
  }

  static extractFromHeadlines($, baseUrl, source, articles) {
    const headlineSelectors = ["h1", "h2", "h3"]

    headlineSelectors.forEach((selector) => {
      $(selector).each((index, element) => {
        if (articles.length >= 20) return false

        const $el = $(element)
        const headline = this.cleanText($el.text())

        if (headline.length > 15) {
          const article = {
            headline,
            author: this.findNearbyAuthor($, $el),
            publishDate: this.findNearbyDate($, $el),
            source,
            url: this.findNearbyLink($, $el, baseUrl),
            summary: this.findNearbySummary($, $el),
            image: this.findNearbyImage($, $el, baseUrl),
          }

          articles.push(article)
        }
      })
    })
  }

  static findNearbyAuthor($, $element) {
    const $nearby = $element.parent().find('.author, .byline, [class*="author"]').first()
    return $nearby.length ? this.cleanText($nearby.text()).replace(/^by\s*/i, "") : ""
  }

  static findNearbyDate($, $element) {
    const $nearby = $element.parent().find('time, .date, [class*="date"]').first()
    if ($nearby.length) {
      return $nearby.attr("datetime") || this.cleanText($nearby.text())
    }
    return ""
  }

  static findNearbyLink($, $element, baseUrl) {
    const $link = $element.find("a[href]").first() || $element.closest("a[href]")
    if ($link.length) {
      return this.makeAbsoluteUrl($link.attr("href"), baseUrl)
    }
    return baseUrl
  }

  static findNearbySummary($, $element) {
    const $next = $element.next("p")
    if ($next.length) {
      const text = this.cleanText($next.text())
      return text.length > 50 ? text.substring(0, 200) : ""
    }
    return ""
  }

  static findNearbyImage($, $element, baseUrl) {
    const $img = $element.parent().find("img").first()
    if ($img.length) {
      const src = $img.attr("src") || $img.attr("data-src")
      return src ? this.makeAbsoluteUrl(src, baseUrl) : ""
    }
    return ""
  }

  static cleanText(text) {
    return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim()
  }

  static makeAbsoluteUrl(url, baseUrl) {
    if (!url) return baseUrl

    try {
      return new URL(url, baseUrl).toString()
    } catch {
      return baseUrl
    }
  }

  static extractDomain(url) {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return "Unknown Source"
    }
  }

  static isValidDate(dateString) {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  static removeDuplicates(articles) {
    const seen = new Set()
    return articles.filter((article) => {
      const key = article.headline.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  static extractSourceName($, $article, fallbackSource) {
    const sourceSelectors = [
      ".source",
      ".publication",
      ".site-name",
      ".brand",
      ".logo",
      '[class*="source"]',
      '[class*="publication"]',
      '[class*="brand"]',
      "header .site-title",
      ".masthead",
      ".header-brand",
    ]

    for (const selector of sourceSelectors) {
      const $source = $article.find(selector).first()
      if ($source.length) {
        const text = this.cleanText($source.text())
        if (text.length > 1 && text.length < 50) {
          return text
        }
      }
    }

    // Try to extract from page title or meta tags
    const pageTitle = $("title").text()
    if (pageTitle) {
      const titleParts = pageTitle.split(" - ")
      if (titleParts.length > 1) {
        const lastPart = titleParts[titleParts.length - 1].trim()
        if (lastPart.length > 1 && lastPart.length < 50) {
          return lastPart
        }
      }
    }

    return fallbackSource
  }
}

module.exports = CheerioHelper
// This module provides a helper class for extracting structured data from HTML using Cheerio.
