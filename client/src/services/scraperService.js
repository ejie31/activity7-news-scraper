import { proxyService } from "./proxyService"

class ScraperService {
  async scrapeWebsite(url) {
    try {
      // Check robots.txt first
      await this.checkRobotsTxt(url)

      // Use proxy service to make API call
      const response = await proxyService.scrapeUrl(url)

      if (!response.success) {
        throw new Error(response.error || "Failed to scrape website")
      }

      return response.articles || []
    } catch (error) {
      console.error("Scraping error:", error)
      throw new Error(error.message || "Failed to scrape website. Please check the URL and try again.")
    }
  }

  async checkRobotsTxt(url) {
    try {
      const response = await proxyService.checkRobots(url)

      if (!response.allowed) {
        throw new Error("Scraping not allowed by robots.txt")
      }
    } catch (error) {
      console.warn("Robots.txt check failed:", error.message)
      // Continue anyway, but warn user
    }
  }
}

export const scraperService = new ScraperService()
