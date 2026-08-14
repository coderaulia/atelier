import { useSyncExternalStore } from 'react'
import { getAuthToken, subscribeToAuthChanges } from '../lib/auth'

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribeToAuthChanges, getAuthToken, () => null)
}
