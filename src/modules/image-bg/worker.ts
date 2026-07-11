import type { ImageFormat } from './types'

interface WorkerMessage {
  id: string
  imageData: ImageData
  bgColor: string | null
  flattenToJpeg: boolean
  colorKey: string | null
  tolerance: number
}

interface WorkerResponse {
  id: string
  blob?: Blob
  error?: string
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, '')
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ]
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16)
    ]
  }
  return null
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, imageData, bgColor, flattenToJpeg, colorKey, tolerance } = e.data

  try {
    const { width, height, data } = imageData

    // Apply color keying transparency if requested
    if (colorKey) {
      const targetRgb = hexToRgb(colorKey)
      if (targetRgb) {
        const [tr, tg, tb] = targetRgb
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (colorDistance(r, g, b, tr, tg, tb) <= tolerance) {
            data[i + 3] = 0 // transparent
          }
        }
      }
    }

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!

    // Draw background color if solid background is selected
    if (bgColor) {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    }

    const tempCanvas = new OffscreenCanvas(width, height)
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    ctx.drawImage(tempCanvas, 0, 0)

    const format: ImageFormat = flattenToJpeg ? 'jpg' : 'png'
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const blob = await canvas.convertToBlob({ type: mimeType, quality: format === 'jpg' ? 0.92 : undefined })

    self.postMessage({ id, blob } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Processing failed'
    } as WorkerResponse)
  }
}
