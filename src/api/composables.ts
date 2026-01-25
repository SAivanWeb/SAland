// Composables for API usage in Composition API

import { inject } from 'vue'
import { api, apiKey, type Api } from './index'

/**
 * Use API in Composition API components
 * @example
 * const api = useApi()
 * const data = await api.user.getProfile()
 */
export function useApi(): Api {
  const injected = inject(apiKey)
  if (!injected) {
    // Fallback to direct import if not provided
    return api
  }
  return injected
}
