import { useState, useEffect } from 'react'
import { getMe, type User } from '@/lib/api'
import { getAuthToken, getStoredUser, setStoredUser, clearAuth } from '@/lib/auth'

interface AuthResult {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
}

export function useAuth(): AuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    // Try cached user first
    const cached = getStoredUser<User>()
    if (cached) {
      setUser(cached)
      setIsLoading(false)
      // Refresh in background
      getMe(token)
        .then(({ user: freshUser }) => {
          setUser(freshUser)
          setStoredUser(freshUser as unknown as Record<string, unknown>)
        })
        .catch(() => {
          // Token invalid, clear auth
          clearAuth()
          setUser(null)
        })
      return
    }

    // No cache, fetch fresh
    getMe(token)
      .then(({ user: freshUser }) => {
        setUser(freshUser)
        setStoredUser(freshUser as unknown as Record<string, unknown>)
      })
      .catch(() => {
        clearAuth()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = () => {
    clearAuth()
    setUser(null)
    window.location.href = '/login'
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  }
}
