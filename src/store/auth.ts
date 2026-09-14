import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  userInfo: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  setUserInfo: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  userInfo: null,
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, userInfo: user, isAuthenticated: true })
  },
  setUserInfo: (user) => set({ userInfo: user }),
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, userInfo: null, isAuthenticated: false })
  },
}))
