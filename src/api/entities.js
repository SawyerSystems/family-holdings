import { apiClient } from './api-client'

/**
 * User entity with API methods
 */
export class User {
  static async me() {
    return apiClient.get('/users/me')
  }

  static async getAll() {
    return apiClient.get('/users')
  }

  static async getById(id) {
    return apiClient.get(`/users/${id}`)
  }

  static async updateMyUserData(data) {
    return apiClient.patch('/users/me', data)
  }

  static async updateUser(id, data) {
    return apiClient.patch(`/users/${id}`, data)
  }

  static async createUser(data) {
    return apiClient.post('/users', data)
  }
}

/**
 * Contribution entity with API methods
 */
export class Contribution {
  static async getAll() {
    return apiClient.get('/contributions')
  }

  static async getMine() {
    return apiClient.get('/contributions/mine')
  }

  static async getById(id) {
    return apiClient.get(`/contributions/${id}`)
  }

  static async create(data) {
    return apiClient.post('/contributions', data)
  }

  static async update(id, data) {
    return apiClient.patch(`/contributions/${id}`, data)
  }

  static async delete(id) {
    return apiClient.delete(`/contributions/${id}`)
  }

  static async markAsPaid(id, amount) {
    return apiClient.post(`/contributions/${id}/mark-paid`, { amount })
  }
}

/**
 * Loan entity with API methods
 */
export class Loan {
  static async getAll() {
    return apiClient.get('/loans')
  }

  static async getMine() {
    return apiClient.get('/loans/mine')
  }

  static async getById(id) {
    return apiClient.get(`/loans/${id}`)
  }

  static async request(data) {
    return apiClient.post('/loans/request', data)
  }

  static async approve(id) {
    return apiClient.post(`/loans/${id}/approve`)
  }

  static async reject(id, reason) {
    return apiClient.post(`/loans/${id}/reject`, { reason })
  }

  static async makePayment(id, amount) {
    return apiClient.post(`/loans/${id}/payment`, { amount })
  }
}