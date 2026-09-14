import request from '../lib/request'
import { USE_MOCK, mockUser, delay } from './mock'
import type { AuthResult, User } from '../types'

export async function login(username: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) {
    await delay(400)
    return { token: 'mock-token-' + Date.now(), user: { ...mockUser, username } }
  }
  return request.post('/auth/login', { username, password })
}

export async function register(username: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) {
    await delay(400)
    return { token: 'mock-token-' + Date.now(), user: { ...mockUser, username } }
  }
  return request.post('/auth/register', { username, password })
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    await delay(200)
    return mockUser
  }
  return request.get('/auth/me')
}
