/**
 * Centralized auth token management.
 * Uses sessionStorage so tokens are cleared when the browser tab closes.
 * This prevents XSS-exposed tokens from persisting across sessions in localStorage.
 *
 * User data (JSON) is kept in sessionStorage alongside the token.
 * Non-sensitive app data (brand, documents, usage cache) remains in localStorage.
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const AUTH_CHANGE_EVENT = 'vanaila-auth-change'

// Legacy localStorage keys — migrate on first access
const LEGACY_TOKEN_KEY = 'token'
const LEGACY_USER_KEY = 'user'

function migrateFromLocalStorage(): void {
  if (typeof window === 'undefined') return
  try {
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)
    if (legacyToken) {
      sessionStorage.setItem(TOKEN_KEY, legacyToken)
      localStorage.removeItem(LEGACY_TOKEN_KEY)
    }
    const legacyUser = localStorage.getItem(LEGACY_USER_KEY)
    if (legacyUser) {
      sessionStorage.setItem(USER_KEY, legacyUser)
      localStorage.removeItem(LEGACY_USER_KEY)
    }
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  // One-time migration from legacy localStorage
  migrateFromLocalStorage()
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(TOKEN_KEY, token)
  notifyAuthChanged()
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setStoredUser(user: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  notifyAuthChanged()
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  notifyAuthChanged()
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(AUTH_CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}
