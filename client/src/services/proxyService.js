import axios from "axios"

class ProxyService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api"

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          throw new Error(error.response.data.error || "Server error")
        } else if (error.request) {
          // Request was made but no response received
          throw new Error("Network error - please check your connection")
        } else {
          // Something else happened
          throw new Error("Request failed")
        }
      },
    )
  }

  async scrapeUrl(url) {
    const response = await this.client.post("/scraper/scrape", { url })
    return response.data
  }

  async checkRobots(url) {
    const response = await this.client.get(`/scraper/robots-check?url=${encodeURIComponent(url)}`)
    return response.data
  }

  async healthCheck() {
    const response = await this.client.get("/health")
    return response.data
  }
}

export const proxyService = new ProxyService()
