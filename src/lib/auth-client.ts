import { createAuthClient } from 'better-auth/react'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://vanaila-studio-api.atelier-591.workers.dev'

export const authClient = createAuthClient({
  baseURL: API_URL,
})

export const { signIn, signUp, signOut, useSession } = authClient
