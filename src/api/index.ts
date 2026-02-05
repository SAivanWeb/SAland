// API Client for Vue

import type { App, InjectionKey } from 'vue'
import { auth, user, friends, themes, games, health } from './modules'
import { setAccessToken, getAccessToken, ApiRequestError } from './network'
import { ws } from './websocket'

// API object with all modules
export const api = {
  auth,
  user,
  friends,
  themes,
  games,
  health,
  ws,
}

export type Api = typeof api

// Injection key for provide/inject
export const apiKey: InjectionKey<Api> = Symbol('api')

// Vue plugin
export const apiPlugin = {
  install(app: App) {
    app.provide(apiKey, api)
    app.config.globalProperties.$api = api
  },
}

// Re-export utilities
export { setAccessToken, getAccessToken, ApiRequestError }

// Re-export composables
export { useApi } from './composables'

// Re-export WebSocket
export { ws, useWebSocket } from './websocket'

// Re-export all types
export * from './modules/types'

// Type augmentation for Vue
declare module 'vue' {
  interface ComponentCustomProperties {
    $api: Api
  }
}
