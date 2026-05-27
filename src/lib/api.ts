const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export interface User {
  id: string
  email: string
  plan: 'free' | 'pro'
  created_at?: number
}

interface AuthResponse {
  token: string
  user: User
}

export interface UsageStatus {
  used: number
  limit: number | null
  reset_at: number
}

export class UsageLimitError extends Error {
  used: number
  limit: number
  reset_at: number
  constructor(used: number, limit: number, reset_at: number) {
    super('Daily limit reached')
    this.name = 'UsageLimitError'
    this.used = used
    this.limit = limit
    this.reset_at = reset_at
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  const data = await res.json() as T & { error?: string }
  if (!res.ok) throw new Error((data as { error: string }).error ?? 'Request failed')
  return data
}

export function register(email: string, password: string) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token: string) {
  return request<{ user: User }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getUsage(toolId: string, token: string) {
  return request<UsageStatus>(`/usage/${toolId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function incrementUsage(toolId: string, token: string): Promise<UsageStatus> {
  const res = await fetch(`${API_URL}/usage/${toolId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  const data = await res.json() as UsageStatus & { error?: string; used: number; limit: number; reset_at: number }
  if (res.status === 429) {
    throw new UsageLimitError(data.used, data.limit, data.reset_at)
  }
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}
