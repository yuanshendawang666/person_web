import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.baseURL = '/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    async fetchUser() {
      if (!this.token) return
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      try {
        const { data } = await axios.get('/auth/me')
        this.user = data.user
      } catch {
        this.logout()
      }
    },
    async login(credentials) {
      const { data } = await axios.post('/auth/login', credentials)
      this.setToken(data.token)
      await this.fetchUser()
    },
    async register(form) {
      const { data } = await axios.post('/auth/register', form)
      this.setToken(data.token)
      await this.fetchUser()
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
  },
})
