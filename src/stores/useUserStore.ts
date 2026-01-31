import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  api,
  type LoginRequest,
  type RegisterRequest,
  type InitResponse,
} from '@/api'
import { ws } from '@/api/websocket'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('UserStore', () => {
  const currentUser = ref<InitResponse | null>(null)
  const processingStore = useProcessingStore()
  const router = useRouter()

  async function loginUser(data: LoginRequest) {
    try {
      processingStore.startLoading()
      const res = await api.auth.login(data)
      localStorage.setItem('access_token', res.access_token)
      await initUser();
      await router.push('/games')
    } catch (e) {
      console.error('Login error:', e)
      throw e
    } finally {
      processingStore.stopLoading()
    }
  }

  async function registerUser(data: RegisterRequest) {
    try {
      processingStore.startLoading()
      const res = await api.auth.register(data)
      localStorage.setItem('access_token', res.access_token)
      await initUser()
      await router.push('/games')
    } catch (e) {
      console.error('Register error:', e)
      throw e
    } finally {
      processingStore.stopLoading()
    }
  }

  async function logout() {
    try {
      await api.auth.logout()
    } finally {
      ws.disconnect()
      currentUser.value = null
      localStorage.removeItem('access_token')
      await router.push('/auth')
    }
  }

  async function initUser() {
    try {
      processingStore.startLoading()
      currentUser.value = await api.user.init();
      await ws.connect();
    } catch (e) {
      console.log(e)
    } finally {
      processingStore.stopLoading()
    }
  }

  return {
    currentUser,
    registerUser,
    loginUser,
    logout,
    initUser,
  }
})
