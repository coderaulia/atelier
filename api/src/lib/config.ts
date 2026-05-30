export function getAppUrl(appUrl?: string): string {
  const fallback = 'http://localhost:5173'
  if (!appUrl) return fallback

  const url = new URL(appUrl)
  if (url.hostname !== 'localhost' && url.protocol !== 'https:') {
    throw new Error('APP_URL must use https:// outside localhost')
  }

  return url.toString().replace(/\/$/, '')
}
