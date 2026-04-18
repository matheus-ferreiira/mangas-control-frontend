import { reactive } from 'vue'
import type { User } from '../services/authService'

export const authStore = reactive({
  token: localStorage.getItem('auth_token') as string | null,
  user: JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null,

  get isAuthenticated(): boolean {
    return !!this.token
  },

  setAuth(token: string, user: User) {
    this.token = token
    this.user = user
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
  },

  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  },
})
