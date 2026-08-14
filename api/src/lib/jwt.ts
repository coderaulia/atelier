import { SignJWT, jwtVerify } from 'jose'

const ALG = 'HS256'
// Legacy Bearer tokens remain only for the migration path; keep their exposure window bounded.
const EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

function secretKey(secret: string) {
  return new TextEncoder().encode(secret)
}

export async function signToken(userId: string, secret: string): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey(secret))
  return { token, expiresAt }
}

export async function verifyToken(token: string, secret: string, oldSecret?: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret))
    if (typeof payload.sub !== 'string') throw new Error('Invalid token payload')
    return payload.sub
  } catch {
    if (!oldSecret) throw new Error('Token verification failed with both secrets')
    const { payload } = await jwtVerify(token, secretKey(oldSecret))
    if (typeof payload.sub !== 'string') throw new Error('Invalid token payload')
    return payload.sub
  }
}
