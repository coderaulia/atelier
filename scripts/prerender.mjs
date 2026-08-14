/**
 * Prerender script: reads dist/index.html template, renders each static route
 * with the React app (StaticRouter), injects SEO <head> tags, writes to dist/<path>/index.html.
 * Run: node scripts/prerender.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')
const htmlPath = resolve(distDir, 'index.html')

// Dynamic import of compiled server entry — built by Vite separately.
// pathToFileURL is required on Windows: a bare absolute path (C:\...) isn't
// a valid ESM specifier there and throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
const serverEntry = await import(pathToFileURL(resolve(distDir, 'server/entry-server.js')).href)

const template = readFileSync(htmlPath, 'utf-8')
const routes = serverEntry.default ?? []

const siteUrl = 'https://studio.vanaila.com'

function buildHead(url, meta) {
  const canonical = url === '/' ? siteUrl : `${siteUrl}${url}`
  let head = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.ogImage}">`
  if (meta.schema) {
    head += `\n    <script type="application/ld+json">${JSON.stringify(meta.schema)}</script>`
  }
  return head
}

let count = 0
for (const route of routes) {
  const { url, meta } = route
  const html = await serverEntry.render(url)
  const fullHtml = template
    .replace('<!--ssr-head-->', buildHead(url, meta))
    .replace('<!--ssr-outlet-->', html)

  const outPath = url === '/'
    ? resolve(distDir, 'index.html')
    : resolve(distDir, `${url.replace(/^\//, '')}/index.html`)

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, fullHtml, 'utf-8')
  console.log(`✅ ${url}`)
  count++
}

console.log(`\nPrerendered ${count} pages.`)
