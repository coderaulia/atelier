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

// Legacy localStorage keys — migrate on first access
const LEGACY_TOKEN_KEY = 'token'
const LEGACY_USER_KEY = 'user'

function migrateFromLocalStorage(): void {
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
  // One-time migration from legacy localStorage
  migrateFromLocalStorage()
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setStoredUser(user: Record<string, unknown>): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
