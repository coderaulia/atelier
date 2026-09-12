import { request, authHeaders } from './client'
import type { User, AuthResponse, Session } from './types'
import type { GlobalMetadata } from '../globalMetadata'

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
    headers: authHeaders(token),
  })
}

export function updateProfile(
  name: string | null,
  global_metadata: Partial<GlobalMetadata> | undefined,
  version: number
) {
  return request<{ user: User }>('/auth/profile', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name, global_metadata, version }),
  })
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>('/auth/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getSessions() {
  return request<{ sessions: Session[] }>('/auth/sessions', { headers: authHeaders() })
}

export function signOutAll() {
  return request<{ ok: true }>('/auth/sessions/all', {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function deleteAccount(confirm: 'DELETE' = 'DELETE') {
  return request<{ ok: true }>('/auth/account', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ confirm }),
  })
}

export function forgotPassword(email: string) {
  return request<{ ok: true }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, password: string) {
  return request<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function resendVerificationEmail() {
  return request<{ ok: true }>('/auth/verify-email', {
    method: 'POST',
    headers: authHeaders(),
  })
}

export function logout() {
  return request<{ ok: true }>('/auth/logout', {
    method: 'POST',
    headers: authHeaders(),
  })
}
