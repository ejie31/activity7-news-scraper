"use client";

import { useState, useCallback } from "react";
import { scraperService } from "../services/scraperService";

export function useNewsScraper() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrapeUrl = useCallback(async (url) => {
    setLoading(true);
    setError(null);

    try {
      const scrapedArticles = await scraperService.scrapeWebsite(url);
      console.log("Scraped articles:", scrapedArticles); // Debug log
      setArticles(scrapedArticles);
    } catch (err) {
      setError(err.message || "Failed to scrape website");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterArticles = useCallback((articles, keyword) => {
    console.log(
      "Filtering articles:",
      articles.length,
      "with keyword:",
      keyword
    ); // Debug log

    if (!keyword || !keyword.trim()) {
      console.log("No keyword, returning all articles");
      return articles;
    }

    const lowerKeyword = keyword.toLowerCase().trim();
    const filtered = articles.filter((article) => {
      const matchesHeadline =
        article.headline &&
        article.headline.toLowerCase().includes(lowerKeyword);
      const matchesSummary =
        article.summary && article.summary.toLowerCase().includes(lowerKeyword);
      const matchesAuthor =
        article.author && article.author.toLowerCase().includes(lowerKeyword);
      const matchesSource =
        article.source && article.source.toLowerCase().includes(lowerKeyword);

      const matches =
        matchesHeadline || matchesSummary || matchesAuthor || matchesSource;

      if (matches) {
        console.log("Article matches:", article.headline);
      }

      return matches;
    });

    console.log("Filtered results:", filtered.length); // Debug log
    return filtered;
  }, []);

  const sortArticles = useCallback((articles, sortBy) => {
    if (!articles || articles.length === 0) return [];

    const sorted = [...articles];

    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => {
          if (!a.publishDate && !b.publishDate) return 0;
          if (!a.publishDate) return 1;
          if (!b.publishDate) return -1;

          const dateA = new Date(a.publishDate || 0);
          const dateB = new Date(b.publishDate || 0);
          return dateB.getTime() - dateA.getTime();
        });
      case "relevance":
        return sorted.sort((a, b) =>
          (a.headline || "").localeCompare(b.headline || "")
        );
      case "source":
        return sorted.sort((a, b) =>
          (a.source || "").localeCompare(b.source || "")
        );
      default:
        return sorted;
    }
  }, []);

  return {
    articles,
    loading,
    error,
    scrapeUrl,
    filterArticles,
    sortArticles,
  };
}
