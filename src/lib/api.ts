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
