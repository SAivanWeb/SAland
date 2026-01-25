// Health module

import { get } from '../network'
import type { HealthResponse } from './types'

export const health = {
  /**
   * Check server health status
   */
  async check(): Promise<HealthResponse> {
    return get<HealthResponse>('/health', { withAuth: false })
  },
}
