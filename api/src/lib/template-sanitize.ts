// Server-side template sanitizer (Cloudflare Workers — no DOM available).
//
// This is the WRITE layer of a dual-layer defense. It strips known-dangerous
// constructs and reports what it removed so the admin gets feedback. It is NOT
// the authoritative security boundary — the client re-sanitizes every template
// with DOMPurify at render time (RuntimeTemplate.tsx). Because a regex pass in a
// DOM-less runtime cannot catch every mutation-XSS trick, treat this as
// defense-in-depth + validation, and never rely on it alone.

// Tags allowed in template body markup (layout + inline text + inline SVG).
const ALLOWED_TAGS = new Set([
  'div', 'span', 'p', 'br', 'hr', 'section', 'article', 'header', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i', 'u', 'small', 'sup', 'sub', 'blockquote', 'q',
  'figure', 'figcaption', 'img', 'picture',
  // inline SVG (templates use decorative vector marks)
  'svg', 'path', 'circle', 'rect', 'ellipse', 'g', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'defs', 'lineargradient', 'radialgradient',
  'stop', 'clippath', 'mask', 'use', 'symbol', 'pattern', 'filter',
])

// Tags that are removed together with their entire content.
const DANGEROUS_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template']

// Tags removed (tag only) — never allowed but no inner content to strip specially.
const FORBIDDEN_VOID_TAGS = ['link', 'meta', 'base', 'form', 'input', 'button', 'textarea', 'select', 'video', 'audio', 'source', 'track', 'a']

export interface TemplateSanitizeResult {
  clean: string
  removed: string[]
}

function record(removed: string[], msg: string) {
  if (!removed.includes(msg)) removed.push(msg)
}

export function sanitizeTemplateHtml(input: string): TemplateSanitizeResult {
  const removed: string[] = []
  let html = input || ''

  // 1. Strip dangerous element blocks entirely (tag + content).
  for (const tag of DANGEROUS_TAGS) {
    const block = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
    const selfClose = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi')
    if (block.test(html) || selfClose.test(html)) record(removed, `<${tag}> blocks`)
    html = html.replace(block, '').replace(selfClose, '')
  }

  // 2. Remove forbidden standalone tags (keep any inner text).
  for (const tag of FORBIDDEN_VOID_TAGS) {
    const open = new RegExp(`<${tag}\\b[^>]*>`, 'gi')
    const close = new RegExp(`<\\/${tag}>`, 'gi')
    if (open.test(html)) record(removed, `<${tag}> tags`)
    html = html.replace(open, '').replace(close, '')
  }

  // 3. Strip inline event handlers (on*="...", on*='...', on*=bare).
  if (/\son\w+\s*=/i.test(html)) record(removed, 'inline event handlers')
  html = html.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  html = html.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  html = html.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // 4. Neutralize dangerous URL schemes in any attribute.
  if (/(?:href|src|xlink:href|action|formaction)\s*=\s*["']?\s*(?:javascript|vbscript|data:text\/html)/i.test(html)) {
    record(removed, 'dangerous URL schemes')
  }
  html = html.replace(
    /(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data:text\/html)[^"'\s>]*("|')?/gi,
    '$1="#"',
  )

  // 5. Block external resource loads (leak vector + breaks html-to-image export).
  //    Allow only data:image, blob:, {{tokens}}, and relative/same-origin paths.
  html = html.replace(/\ssrc\s*=\s*"(https?:|\/\/)[^"]*"/gi, () => {
    record(removed, 'external src (use data:image or {{token}})')
    return ' src=""'
  })
  html = html.replace(/\ssrc\s*=\s*'(https?:|\/\/)[^']*'/gi, () => {
    record(removed, 'external src (use data:image or {{token}})')
    return " src=''"
  })

  // 6. Strip any remaining tag that is not in the allowlist (keep inner text).
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/g, (match, tagName: string) => {
    const name = String(tagName).toLowerCase()
    if (ALLOWED_TAGS.has(name)) return match
    record(removed, `<${name}> (not allowed)`)
    return ''
  })

  return { clean: html, removed }
}

export function sanitizeTemplateCss(input: string): TemplateSanitizeResult {
  const removed: string[] = []
  let css = input || ''

  // Prevent style-context breakout.
  if (/<\/?\s*style|<\/?\s*script|[<>]/i.test(css)) record(removed, 'angle brackets in CSS')
  css = css.replace(/[<>]/g, '')

  // @import can pull external/remote stylesheets — forbid.
  if (/@import/i.test(css)) record(removed, '@import rules')
  css = css.replace(/@import[^;]*;?/gi, '')

  // IE expression() and js: schemes.
  if (/expression\s*\(/i.test(css)) record(removed, 'CSS expression()')
  css = css.replace(/expression\s*\([^)]*\)/gi, '')
  if (/(javascript|vbscript):/i.test(css)) record(removed, 'script: URLs in CSS')
  css = css.replace(/(javascript|vbscript):/gi, '')

  // Block external url() — allow only data: URIs (fonts/images embedded inline).
  css = css.replace(/url\(\s*(['"]?)(https?:|\/\/)[^)]*\1\s*\)/gi, () => {
    record(removed, 'external url() (embed as data: URI)')
    return 'none'
  })

  return { clean: css, removed }
}

// Extract {{token}} names and {{#each rows}} repeat blocks from template markup.
export function extractTokens(html: string): { tokens: string[]; repeats: string[] } {
  const tokens = new Set<string>()
  const repeats = new Set<string>()
  const src = html || ''

  const eachRe = /\{\{\s*#each\s+([a-zA-Z0-9_.]+)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = eachRe.exec(src))) repeats.add(m[1])

  const tokenRe = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g
  while ((m = tokenRe.exec(src))) {
    const name = m[1]
    // ignore control words and brand.* (resolved from brand, not user fields)
    if (name === 'each' || name.startsWith('brand.') || name === 'this') continue
    tokens.add(name)
  }

  return { tokens: [...tokens], repeats: [...repeats] }
}
