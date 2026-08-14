import type { ImageFormat } from './types'

interface WorkerMessage {
  id: string
  imageData: ImageData
  format: ImageFormat
  targetQuality?: number
  targetSizeKB?: number
}

interface WorkerResponse {
  id: string
  blob?: Blob
  size?: number
  error?: string
}

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

async function encodeToBlob(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  format: ImageFormat,
  quality: number
): Promise<Blob> {
  switch (format) {
    case 'jpg':
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 })

    case 'png':
      return await canvas.convertToBlob({ type: 'image/png' })

    case 'webp':
      if (quality < 95) {
        return await canvas.convertToBlob({ type: 'image/webp', quality: quality / 100 })
      } else {
        const encode = await loadWebPEncoder()
        const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const encoded = await encode(rawData, { quality })
        return new Blob([encoded], { type: 'image/webp' })
      }

    case 'avif':
      const encode = await loadAVIFEncoder()
      const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const encoded = await encode(rawData, { quality })
      return new Blob([encoded], { type: 'image/avif' })

    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

async function compressImage(
  imageData: ImageData,
  format: ImageFormat,
  targetQuality?: number,
  targetSizeKB?: number
): Promise<Blob> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)

  // Case 1: Target Quality is defined
  if (targetQuality !== undefined) {
    return await encodeToBlob(canvas, ctx, format, targetQuality)
  }

  // Case 2: Target Size in KB is defined
  if (targetSizeKB !== undefined) {
    const targetBytes = targetSizeKB * 1024

    // For PNG, canvas.convertToBlob quality parameter is not supported natively.
    // If target size is requested for PNG, we try compressing as target webp/jpg or warn.
    // However, we just do a binary search or linear stepping on quality for lossy formats.
    if (format === 'png') {
      // PNG is lossless, so we can't change quality. We just export.
      return await encodeToBlob(canvas, ctx, format, 100)
    }

    let low = 1
    let high = 100
    let bestBlob: Blob | null = null

    // Try standard quality step checks (binary search style to avoid too many iterations)
    for (let step = 0; step < 5; step++) {
      const mid = Math.round((low + high) / 2)
      const blob = await encodeToBlob(canvas, ctx, format, mid)

      if (blob.size <= targetBytes) {
        bestBlob = blob
        low = mid + 1 // try higher quality
      } else {
        high = mid - 1 // need lower quality to fit
      }
    }

    if (bestBlob) {
      return bestBlob
    }

    // If even quality=1 is larger, return quality=1 blob
    return await encodeToBlob(canvas, ctx, format, 1)
  }

  // Fallback: 80% quality
  return await encodeToBlob(canvas, ctx, format, 80)
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, imageData, format, targetQuality, targetSizeKB } = e.data

  try {
    const blob = await compressImage(imageData, format, targetQuality, targetSizeKB)
    self.postMessage({ id, blob, size: blob.size } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Compression failed'
    } as WorkerResponse)
  }
}
