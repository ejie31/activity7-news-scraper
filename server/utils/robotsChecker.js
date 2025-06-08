const axios = require("axios");
const robotsParser = require("robots-parser");

class RobotsChecker {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour
  }

  async isAllowed(url, userAgent = "NewsScraperBot") {
    try {
      const robotsUrl = new URL("/robots.txt", url).toString();
      const cacheKey = robotsUrl;

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.robots.isAllowed(url, userAgent);
        }
      }

      // Fetch robots.txt
      const robotsContent = await this.getRobotsContent(robotsUrl);

      if (!robotsContent) {
        return true; // If no robots.txt, assume allowed
      }

      const robots = robotsParser(robotsUrl, robotsContent);

      // Cache the result
      this.cache.set(cacheKey, {
        robots,
        timestamp: Date.now(),
      });

      return robots.isAllowed(url, userAgent);
    } catch (error) {
      console.warn("Robots.txt check failed:", error.message);
      return true; // Default to allowed if check fails
    }
  }

  async getRobotsContent(robotsUrl) {
    try {
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: {
          "User-Agent": "NewsScraperBot/1.0",
        },
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No robots.txt file
      }
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new RobotsChecker();
