import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/games',
      name: 'Games',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/game-create',
      name: 'CreateGame',
      component: () => import('../views/CreateGameView.vue'),
    },
    {
      path: '/game/:id',
      name: 'Game',
      component: () => import('../views/GameView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
})

export default router
