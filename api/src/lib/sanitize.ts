const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li']

export function sanitizeHtml(html: string): string {
  let clean = html || ''
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
  const tagPattern = new RegExp(`<(?!\\/?(${ALLOWED_TAGS.join('|')})\\b)[^>]+>`, 'gi')
  clean = clean.replace(tagPattern, '')
  return clean
}
