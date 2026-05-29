const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export interface User {
  id: string
  email: string
  plan: 'free' | 'pro'
  role?: 'user' | 'admin'
  status?: 'active' | 'banned'
  pro_expires_at?: number | null
  created_at?: number
  last_login?: number | null
  total_tool_uses?: number
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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token') ?? localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
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

export type AdminStats = {
  total_users: number
  users_today: number
  pro_users: number
  free_users: number
  revenue_this_month: number
  top_tools: { tool_id: string; count: number }[]
  limit_hits_today: { tool_id: string; count: number }[]
  daily_tool_usage: { date: string; tool_id: string; count: number }[]
  daily_signups: { date: string; count: number }[]
}

export type AdminTransaction = {
  id: number
  user_email: string
  amount: number
  currency: string
  plan_type: string
  status: 'success' | 'pending' | 'failed'
  midtrans_order_id?: string
  created_at: number
}

export type AdminError = {
  id: number
  tool_id: string
  error_type: string
  user_agent?: string
  plan?: 'free' | 'pro'
  created_at: number
}

export function getAdminStats() {
  return request<AdminStats>('/admin/stats', { headers: authHeaders() })
}

export function getAdminUsers(params: { page?: number; limit?: number; search?: string; plan?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; users: User[] }>(`/admin/users?${qs}`, { headers: authHeaders() })
}

export function getAdminUser(id: string) {
  return request<{ user: User; transactions: AdminTransaction[]; usage_log: { date: string; tool_id: string; count: number; limit_hits: number }[] }>(`/admin/users/${id}`, { headers: authHeaders() })
}

export function patchAdminUser(id: string, body: Partial<Pick<User, 'plan' | 'status' | 'pro_expires_at'>>) {
  return request<{ user: User }>(`/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function getAdminTransactions(params: { page?: number; limit?: number; sort?: string; direction?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; transactions: AdminTransaction[] }>(`/admin/transactions?${qs}`, { headers: authHeaders() })
}

export function getAdminErrors() {
  return request<{ errors: AdminError[]; groups: { tool_id: string; error_type: string; count: number }[] }>('/admin/errors', { headers: authHeaders() })
}

export function logToolError(payload: { tool_id: string; error_type: string; user_agent?: string; plan?: 'free' | 'pro' }) {
  return request<{ ok: true }>('/api/log-error', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
