import { getAuthToken } from '../auth'

export const API_URL = import.meta.env.VITE_API_URL ?? 'https://vanaila-studio-api.atelier-591.workers.dev'

export class UsageLimitError extends Error {
  used: number
  limit: number | null
  reset_at: number

  constructor(used: number, limit: number | null, reset_at: number) {
    super('Daily limit reached')
    this.name = 'UsageLimitError'
    this.used = used
    this.limit = limit
    this.reset_at = reset_at
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  const method = init?.method?.toUpperCase()
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-CSRF-Protection', '1')
  }
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error((data as { error: string }).error ?? 'Request failed')
  return data
}

export function authHeaders(token?: string | null): HeadersInit {
  const t = token ?? getAuthToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}
