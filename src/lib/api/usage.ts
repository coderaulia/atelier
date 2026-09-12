import { API_URL, UsageLimitError, request, authHeaders } from './client'
import type { UsageStatus, UsageLogEntry } from './types'

export function getUsage(toolId: string, token: string) {
  return request<UsageStatus>(`/usage/${toolId}`, {
    headers: authHeaders(token),
  })
}

export async function incrementUsage(
  toolId: string,
  token: string,
  idempotencyKey = crypto.randomUUID()
): Promise<UsageStatus> {
  const res = await fetch(`${API_URL}/usage/${toolId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
      'Idempotency-Key': idempotencyKey,
      ...authHeaders(token),
    },
  })
  const data = (await res.json()) as UsageStatus & { error?: string }
  if (res.status === 429) throw new UsageLimitError(data.used, data.limit, data.reset_at)
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

export function getAnonUsage(toolId: string) {
  return request<UsageStatus>(`/anon-usage/${toolId}`)
}

export async function incrementAnonUsage(toolId: string): Promise<UsageStatus> {
  const res = await fetch(`${API_URL}/anon-usage/${toolId}`, { method: 'POST' })
  const data = (await res.json()) as UsageStatus & { error?: string }
  if (res.status === 429) throw new UsageLimitError(data.used, data.limit ?? 1, data.reset_at)
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

export function getMyUsage() {
  return request<{ usage: UsageLogEntry[] }>('/usage/me', { headers: authHeaders() })
}
