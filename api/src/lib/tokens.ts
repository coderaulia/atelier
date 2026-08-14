export function randomToken(bytes = 32): string {
  const data = crypto.getRandomValues(new Uint8Array(bytes))
  return [...data].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
