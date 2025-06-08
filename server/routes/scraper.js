const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const cheerioHelper = require("../utils/cheerioHelper");
const robotsChecker = require("../utils/robotsChecker");

const router = express.Router();

// POST /api/scraper/scrape
router.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check robots.txt
    const robotsAllowed = await robotsChecker.isAllowed(url, "NewsScraperBot");
    if (!robotsAllowed) {
      return res.status(403).json({
        error: "Scraping not allowed by robots.txt",
        robotsBlocked: true,
      });
    }

    // Fetch webpage
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsScraperBot/1.0; +http://example.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract articles using helper
    const articles = cheerioHelper.extractArticles($, url);

    // Validate and enhance articles before sending response
    const validatedArticles = articles
      .filter((article) => {
        // Ensure we have at least a headline
        return article.headline && article.headline.length > 5;
      })
      .map((article) => ({
        // Ensure all key elements are present
        headline: article.headline || "No headline available",
        author: article.author || "",
        publishDate: article.publishDate || "",
        source: article.source || cheerioHelper.extractDomain(url),
        url: article.url || url,
        summary: article.summary || "",
        image: article.image || "",
        // Add metadata about completeness
        hasAuthor: !!article.author,
        hasDate: !!article.publishDate,
        hasSummary: !!article.summary,
        completeness: [
          !!article.headline,
          !!article.author,
          !!article.publishDate,
          !!article.source,
        ].filter(Boolean).length,
      }));

    res.json({
      success: true,
      articles: validatedArticles,
      totalFound: validatedArticles.length,
      source: cheerioHelper.extractDomain(url),
      scrapedAt: new Date().toISOString(),
      // Add statistics about extracted data
      statistics: {
        withAuthor: validatedArticles.filter((a) => a.hasAuthor).length,
        withDate: validatedArticles.filter((a) => a.hasDate).length,
        withSummary: validatedArticles.filter((a) => a.hasSummary).length,
        averageCompleteness:
          validatedArticles.reduce((sum, a) => sum + a.completeness, 0) /
          validatedArticles.length,
      },
    });
  } catch (error) {
    console.error("Scraping error:", error.message);

    if (error.code === "ENOTFOUND") {
      return res.status(404).json({ error: "Website not found" });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "Connection refused by server" });
    }

    if (error.response && error.response.status === 403) {
      return res.status(403).json({ error: "Access forbidden by website" });
    }

    res.status(500).json({
      error: "Failed to scrape website",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/scraper/robots-check
router.get("/robots-check", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const robotsUrl = new URL("/robots.txt", url).toString();
    const allowed = await robotsChecker.isAllowed(url, "NewsScraperBot");
    const robotsContent = await robotsChecker.getRobotsContent(robotsUrl);

    res.json({
      allowed,
      robotsUrl,
      robotsContent: robotsContent ? robotsContent.substring(0, 500) : null,
    });
  } catch (error) {
    console.error("Robots check error:", error.message);
    res.json({
      allowed: true,
      error: "Could not check robots.txt",
      fallback: true,
    });
  }
});

module.exports = router;
