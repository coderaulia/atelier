import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path'
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

export function staticFileFor(urlPath) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(urlPath.split('?')[0] || '/')
  } catch {
    return null
  }
  const requestPath = decodedPath === '/' ? '/index.html' : decodedPath
  const filePath = normalize(join(distDir, requestPath))
  const relativePath = relative(distDir, filePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) return null
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null
  return filePath
}

export function startServer() {
  return createServer((req, res) => {
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
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer()
}
