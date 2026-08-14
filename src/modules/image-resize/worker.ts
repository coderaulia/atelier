import type { ImageFormat, CropMode } from './types'

interface WorkerMessage {
  id: string
  imageData: ImageData
  format: ImageFormat
  width: number
  height: number
  cropMode: CropMode
}

interface WorkerResponse {
  id: string
  blob?: Blob
  error?: string
}

let avifEncoder: any = null

async function loadAVIFEncoder() {
  if (!avifEncoder) {
    const module = await import('@jsquash/avif/encode')
    avifEncoder = module.default
  }
  return avifEncoder
}

async function encodeToBlob(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  format: ImageFormat
): Promise<Blob> {
  switch (format) {
    case 'jpg':
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })

    case 'png':
      return await canvas.convertToBlob({ type: 'image/png' })

    case 'webp':
      return await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 })

    case 'avif':
      const encode = await loadAVIFEncoder()
      const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const encoded = await encode(rawData, { quality: 80 })
      return new Blob([encoded], { type: 'image/avif' })

    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

async function resizeImage(
  imageData: ImageData,
  format: ImageFormat,
  width: number,
  height: number,
  cropMode: CropMode
): Promise<Blob> {
  const sourceWidth = imageData.width
  const sourceHeight = imageData.height

  // Create temporary source canvas to draw the raw ImageData
  const sourceCanvas = new OffscreenCanvas(sourceWidth, sourceHeight)
  const sourceCtx = sourceCanvas.getContext('2d')!
  sourceCtx.putImageData(imageData, 0, 0)

  // Target canvas
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  if (cropMode === 'stretch') {
    ctx.drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height)
  } else if (cropMode === 'contain') {
    // Fit completely inside target dimensions, pad remaining space (transparent or background color)
    ctx.fillStyle = format === 'jpg' ? '#ffffff' : 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, width, height)

    const scale = Math.min(width / sourceWidth, height / sourceHeight)
    const targetW = sourceWidth * scale
    const targetH = sourceHeight * scale
    const x = (width - targetW) / 2
    const y = (height - targetH) / 2

    ctx.drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, x, y, targetW, targetH)
  } else if (cropMode === 'cover') {
    // Fill target dimensions completely, crop excess
    const scale = Math.max(width / sourceWidth, height / sourceHeight)
    const targetW = sourceWidth * scale
    const targetH = sourceHeight * scale
    const x = (width - targetW) / 2
    const y = (height - targetH) / 2

    ctx.drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, x, y, targetW, targetH)
  }

  return await encodeToBlob(canvas, ctx, format)
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, imageData, format, width, height, cropMode } = e.data

  try {
    const blob = await resizeImage(imageData, format, width, height, cropMode)
    self.postMessage({ id, blob } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Resize failed'
    } as WorkerResponse)
  }
}
