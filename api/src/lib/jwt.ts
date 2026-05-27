import { SignJWT, jwtVerify } from 'jose'

const ALG = 'HS256'
const EXPIRY_SECONDS = 30 * 24 * 60 * 60 // 30 days

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

export async function verifyToken(token: string, secret: string): Promise<string> {
  const { payload } = await jwtVerify(token, secretKey(secret))
  if (typeof payload.sub !== 'string') throw new Error('Invalid token payload')
  return payload.sub
}
