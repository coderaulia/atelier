const ITERATIONS = 100_000
const HASH_BITS = 256

async function pbkdf2(plain: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(plain), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
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
  const hash = await pbkdf2(plain, salt)
  return `${toHex(salt)}:${hash}`
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [saltHex, expectedHash] = stored.split(':')
  if (!saltHex || !expectedHash) return false
  const actualHash = await pbkdf2(plain, fromHex(saltHex))
  // Constant-time comparison via timing-safe equal length check + XOR
  if (actualHash.length !== expectedHash.length) return false
  let diff = 0
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return diff === 0
}
