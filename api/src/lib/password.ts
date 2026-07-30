const ALGORITHM = 'pbkdf2_sha256'
// Highest PBKDF2-HMAC-SHA256 work factor that fits inside a Workers request's
// CPU budget. OWASP's 600k baseline blows the limit and makes every hash throw.
// Existing hashes are upgraded after a successful login so raising this later
// does not lock users out.
const CURRENT_ITERATIONS = 100_000
const LEGACY_ITERATIONS = 310_000
const HASH_BITS = 256

async function pbkdf2(plain: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(plain), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BITS,
  )
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  return new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(plain, salt, CURRENT_ITERATIONS)
  return `${ALGORITHM}$${CURRENT_ITERATIONS}$${toHex(salt)}$${hash}`
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length === 4 && parts[0] === ALGORITHM) {
    const iterations = Number(parts[1])
    const [, , saltHex, expectedHash] = parts
    if (!Number.isSafeInteger(iterations) || iterations <= 0 || !saltHex || !expectedHash) return false
    const actualHash = await pbkdf2(plain, fromHex(saltHex), iterations)
    return timingSafeEqual(actualHash, expectedHash)
  }

  const [saltHex, expectedHash] = stored.split(':')
  if (!saltHex || !expectedHash) return false
  const actualHash = await pbkdf2(plain, fromHex(saltHex), LEGACY_ITERATIONS)
  return timingSafeEqual(actualHash, expectedHash)
}

export function needsPasswordRehash(stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 4) return stored.includes(':')
  if (parts[0] !== ALGORITHM) return false
  const iterations = Number(parts[1])
  return Number.isSafeInteger(iterations) && iterations < CURRENT_ITERATIONS
}

function timingSafeEqual(actualHash: string, expectedHash: string): boolean {
  // Constant-time comparison via timing-safe equal length check + XOR
  if (actualHash.length !== expectedHash.length) return false
  let diff = 0
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return diff === 0
}
