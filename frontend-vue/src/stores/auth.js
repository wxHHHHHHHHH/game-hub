import { defineStore } from 'pinia'
import api from '../api/index.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('bobi_user') || 'null'),
    token: localStorage.getItem('bobi_token') || ''
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'ADMIN',
    canPost: (s) => s.user && (s.user.role === 'ADMIN' || s.user.role === 'MEMBER')
  },
  actions: {
    async login(username, password) {
      const res = await api.post('/auth/login', { username, password })
      this.token = res.token
      this.user = { userId: res.userId, username: res.username, displayName: res.displayName, role: res.role, avatarColor: res.avatarColor }
      localStorage.setItem('bobi_token', res.token)
      localStorage.setItem('bobi_user', JSON.stringify(this.user))
    },
    async logout() {
      try { await api.post('/auth/logout') } catch(e){}
      this.token = ''; this.user = null
      localStorage.removeItem('bobi_token'); localStorage.removeItem('bobi_user')
    },
    async fetchMe() {
      const res = await api.get('/auth/me')
      this.user = { userId: res.userId, username: res.username, displayName: res.displayName, role: res.role }
      localStorage.setItem('bobi_user', JSON.stringify(this.user))
    }
  }
})
