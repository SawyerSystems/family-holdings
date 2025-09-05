/**
 * API client for the Python backend
 */
class ApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.token = null
    this.getCurrentUser = null // Will be set by AuthContext
  }

  setAuthToken(token) {
    this.token = token
  }

  setCurrentUserGetter(getCurrentUserFn) {
    this.getCurrentUser = getCurrentUserFn
  }

  getAuthHeaders(user = null) {
    const headers = {
      'Content-Type': 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Mock auth for development (Phase 1)
    if (import.meta.env.DEV) {
      // Use provided user, or get current user, or default to Family Admin
      const currentUser = user || (this.getCurrentUser ? this.getCurrentUser() : null) || {
        id: '5e98e9eb-375b-49f6-82bc-904df30c4021',
        role: 'admin',
        email: 'admin@familyholdings.local'
      }
      
      headers['x-user-id'] = currentUser.id
      headers['x-user-role'] = currentUser.role
      headers['x-user-email'] = currentUser.email
    }

    return headers
  }

  async request(endpoint, method = 'GET', data = null, user = null) {
    const url = `${this.baseUrl}${endpoint}`
    
    const options = {
      method,
      headers: this.getAuthHeaders(user),
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
