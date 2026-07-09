import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(__dirname, 'dist')
const indexFile = join(distDir, 'index.html')
const port = Number(process.env.PORT || 3000)

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

function sendFile(res, filePath) {
  const ext = extname(filePath)
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
    'Cache-Control': filePath.includes(`${join('dist', 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(filePath).pipe(res)
}

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not found')
}

function staticFileFor(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0] || '/')
  const requestPath = decodedPath === '/' ? '/index.html' : decodedPath
  const filePath = normalize(join(distDir, requestPath))
  if (!filePath.startsWith(distDir)) return null
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null
  return filePath
}

createServer((req, res) => {
  if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
    sendNotFound(res)
    return
  }

  const filePath = staticFileFor(req.url)
  if (filePath) {
    sendFile(res, filePath)
    return
  }

  const acceptsHtml = req.headers.accept?.includes('text/html') ?? true
  if (acceptsHtml && existsSync(indexFile)) {
    sendFile(res, indexFile)
    return
  }

  sendNotFound(res)
}).listen(port, () => {
  console.log(`Vanaila Studio frontend serving ${distDir} on port ${port}`)
})
