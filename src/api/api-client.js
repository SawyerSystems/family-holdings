/**
 * API client for the Python backend
 */
class ApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.token = null
  }

  setAuthToken(token) {
    this.token = token
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Mock auth for development (Phase 1)
    if (import.meta.env.DEV) {
      // Use Family Admin ID for now - you can make this configurable later
      headers['x-user-id'] = '5e98e9eb-375b-49f6-82bc-904df30c4021'
      headers['x-user-role'] = 'admin'
    }

    return headers
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`
    
    const options = {
      method,
      headers: this.getAuthHeaders(),
      credentials: 'include'
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      
      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return { success: true }
      }
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.detail || 'API request failed')
      }
      
      return result
    } catch (error) {
      console.error(`API ${method} ${endpoint} error:`, error)
      throw error
    }
  }

  // Convenience methods
  async get(endpoint) {
    return this.request(endpoint, 'GET')
  }

  async post(endpoint, data) {
    return this.request(endpoint, 'POST', data)
  }

  async put(endpoint, data) {
    return this.request(endpoint, 'PUT', data)
  }

  async patch(endpoint, data) {
    return this.request(endpoint, 'PATCH', data)
  }

  async delete(endpoint) {
    return this.request(endpoint, 'DELETE')
  }
}

export const apiClient = new ApiClient()
