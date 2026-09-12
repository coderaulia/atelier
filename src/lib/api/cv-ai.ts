import { request, authHeaders } from './client'
import type { CVAIAction } from './types'

export function generateCVAI(payload: { action: CVAIAction; text?: string; context?: string }) {
  return request<{ result: string }>('/api/cv/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
}
