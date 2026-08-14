import type { ImageFormat } from './types'

interface WorkerMessage {
  id: string
  imageData: ImageData
  format: ImageFormat
  quality: number
}

interface WorkerResponse {
  id: string
  blob?: Blob
  error?: string
}

// Lazy-load WASM modules
let avifEncoder: any = null
let webpEncoder: any = null

async function loadAVIFEncoder() {
  if (!avifEncoder) {
    const module = await import('@jsquash/avif/encode')
    avifEncoder = module.default
  }
  return avifEncoder
}

async function loadWebPEncoder() {
  if (!webpEncoder) {
    const module = await import('@jsquash/webp/encode')
    webpEncoder = module.default
  }
  return webpEncoder
}

async function convertImage(
  imageData: ImageData,
  format: ImageFormat,
  quality: number
): Promise<Blob> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)

  switch (format) {
    case 'jpg':
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 })
    
    case 'png':
      return await canvas.convertToBlob({ type: 'image/png' })
    
    case 'webp':
      // Use native Canvas API for WebP if quality < 95, otherwise use jsquash for max quality
      if (quality < 95) {
        return await canvas.convertToBlob({ type: 'image/webp', quality: quality / 100 })
      } else {
        const encode = await loadWebPEncoder()
        const rawData = ctx.getImageData(0, 0, imageData.width, imageData.height)
        const encoded = await encode(rawData, { quality })
        return new Blob([encoded], { type: 'image/webp' })
      }
    
    case 'avif':
      const encode = await loadAVIFEncoder()
      const rawData = ctx.getImageData(0, 0, imageData.width, imageData.height)
      const encoded = await encode(rawData, { quality })
      return new Blob([encoded], { type: 'image/avif' })
    
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, imageData, format, quality } = e.data

  try {
    const blob = await convertImage(imageData, format, quality)
    self.postMessage({ id, blob } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Conversion failed'
    } as WorkerResponse)
  }
}
