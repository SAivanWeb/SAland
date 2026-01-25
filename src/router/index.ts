import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { setAccessToken } from '@/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('../views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/games',
      name: 'Games',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/game-create',
      name: 'CreateGame',
      component: () => import('../views/CreateGameView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/game/:id',
      name: 'Game',
      component: () => import('../views/GameView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

let isInitialized = false

router.beforeEach(async (to, _from) => {
  const userStore = useUserStore()

  // Инициализация при первом переходе
  if (!isInitialized) {
    isInitialized = true
    const token = localStorage.getItem('access_token')

    if (token) {
      setAccessToken(token)
      try {
        await userStore.initUser()
      } catch {
        // Токен невалидный, очищаем
        localStorage.removeItem('access_token')
        setAccessToken(null)
      }
    }
  }

  const isAuthenticated = !!userStore.currentUser

  // Защищённые маршруты - редирект на главную
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Home' }
  }

  // Гостевые маршруты - редирект на /games
  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'Games' }
  }
})

export default router
