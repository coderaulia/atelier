import type { Bindings } from '../types'

const DEFAULT_ORIGINS = ['https://studio.vanaila.com']
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function getAllowedOrigins(env: Pick<Bindings, 'ALLOWED_ORIGINS' | 'ENVIRONMENT'>): string[] {
  const configured = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ORIGINS

  if (env.ENVIRONMENT !== 'production') {
    configured.push('http://localhost:5173', 'http://localhost:8787')
  }

  return [...new Set(configured)]
}

export function isAllowedOrigin(origin: string, env: Pick<Bindings, 'ALLOWED_ORIGINS' | 'ENVIRONMENT'>): boolean {
  return getAllowedOrigins(env).includes(origin)
}

/**
 * Cookie sessions are ambient credentials, so browser mutations need an origin
 * check and a header that an off-site HTML form cannot set.
 */
export function requiresCsrfProtection(request: Request): boolean {
  return STATE_CHANGING_METHODS.has(request.method)
    && !request.headers.has('Authorization')
    && request.headers.has('Cookie')
}

export function hasSensitiveConfigKey(key: string): boolean {
  return /(api[_-]?key|credential|password|private|secret|token)/i.test(key)
}
