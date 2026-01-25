import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, type LoginRequest, type RegisterRequest, type AuthUser } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('UserStore', () => {
  const currentUser = ref<AuthUser | null>(null)
  const processingStore = useProcessingStore()
  const router = useRouter()

  async function loginUser(data: LoginRequest) {
    try {
      processingStore.startLoading()
      const res = await api.auth.login(data)
      currentUser.value = res.data.user
      console.log(res)
      localStorage.setItem('access_token', res.data.access_token)
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
      currentUser.value = res.user
      localStorage.setItem('access_token', res.access_token)
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
      currentUser.value = null
      localStorage.removeItem('access_token')
      await router.push('/auth')
    }
  }

  async function initUser() {
    try {
      processingStore.startLoading()
      const res = await api.user.init();
      currentUser.value = res.data.user;
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
