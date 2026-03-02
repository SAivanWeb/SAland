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
import { isErrorMessage } from '@/utils/error'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import { useGameStore } from '@/stores/useGameStore.ts'

export const useUserStore = defineStore('UserStore', () => {
  const currentUser = ref<InitResponse | null>(null)
  const processingStore = useProcessingStore()
  const router = useRouter()
  const roomStore = useRoomStore()
  const gameStore = useGameStore()

  async function loginUser(data: LoginRequest) {
    try {
      processingStore.startLoading()
      const res = await api.auth.login(data)
      localStorage.setItem('access_token', res.access_token)
      await initUser();
      await router.push('/games')
    } catch (e) {
      if (isErrorMessage(e, 'Invalid credentials')) processingStore.setMessage('error', 'Ошибка авторизации', 'Неверный логин или пароль')
      else processingStore.setMessage('error', 'Ошибка авторизации', '')
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
      if (isErrorMessage(e, 'User with this email already exists')) {
        processingStore.setMessage('error', 'Ошибка регистрации', 'Пользователь с таким email уже существует')
      } else {
        processingStore.setMessage(
          'error',
          'Ошибка регистрации',
          '',
        )
      }
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
      if (window.location.pathname !== '/game-create') {
        if (currentUser.value && currentUser.value.active_room_id) {
          await roomStore.initRoom()
        }
        if (currentUser.value && currentUser.value.active_game_id) {
          router.push('/game')
          await gameStore.reconnect();
        }
      }
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
