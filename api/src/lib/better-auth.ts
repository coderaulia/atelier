import { betterAuth } from 'better-auth'
import type { Bindings } from '../types'

export function createAuth(env: Bindings) {
  return betterAuth({
    database: env.DB as any, // D1 database
    secret: env.BETTER_AUTH_SECRET || env.JWT_SECRET,
    baseURL: env.BETTER_AUTH_URL || env.APP_URL || 'http://localhost:8787',
    
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || '',
        clientSecret: env.GITHUB_CLIENT_SECRET || '',
        enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await env.DB
              .prepare(
                `INSERT OR IGNORE INTO users (id, email, password_hash, name, email_verified)
                 VALUES (?, ?, ?, ?, ?)`
              )
              .bind(
                user.id,
                user.email,
                'better-auth-managed',
                user.name ?? null,
                user.emailVerified ? 1 : 0
              )
              .run()
          },
        },
      },
    },
    
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
  })
}
