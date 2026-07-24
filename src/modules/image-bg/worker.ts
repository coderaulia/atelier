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

/**
 * Remove only keyed pixels that are connected to an image edge. A global
 * colour replacement also removes matching colours inside the subject (eye
 * whites, highlights, clothes, etc.), which is never desirable for a
 * background-removal tool.
 */
function removeEdgeConnectedColor(imageData: ImageData, target: [number, number, number], tolerance: number) {
  const { width, height, data } = imageData
  const pixelCount = width * height
  const visited = new Uint8Array(pixelCount)
  const queue = new Uint32Array(pixelCount)
  let head = 0
  let tail = 0
  const [tr, tg, tb] = target
  const feather = Math.max(4, Math.min(18, tolerance * 0.2))

  const distanceAt = (pixel: number) => {
    const offset = pixel * 4
    return colorDistance(data[offset], data[offset + 1], data[offset + 2], tr, tg, tb)
  }

  const enqueue = (pixel: number) => {
    if (visited[pixel] || distanceAt(pixel) > tolerance + feather) return
    visited[pixel] = 1
    queue[tail++] = pixel
  }

  for (let x = 0; x < width; x++) {
    enqueue(x)
    enqueue((height - 1) * width + x)
  }
  for (let y = 1; y < height - 1; y++) {
    enqueue(y * width)
    enqueue(y * width + width - 1)
  }

  while (head < tail) {
    const pixel = queue[head++]
    const x = pixel % width
    const y = Math.floor(pixel / width)
    const distance = distanceAt(pixel)
    const alpha = distance <= tolerance
      ? 0
      : Math.round(255 * (distance - tolerance) / feather)
    data[pixel * 4 + 3] = Math.min(data[pixel * 4 + 3], alpha)

    if (x > 0) enqueue(pixel - 1)
    if (x + 1 < width) enqueue(pixel + 1)
    if (y > 0) enqueue(pixel - width)
    if (y + 1 < height) enqueue(pixel + width)
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, imageData, bgColor, flattenToJpeg, colorKey, tolerance } = e.data

  try {
    const { width, height } = imageData

    // Apply color keying transparency if requested
    if (colorKey) {
      const targetRgb = hexToRgb(colorKey)
      if (targetRgb) {
        removeEdgeConnectedColor(imageData, targetRgb, tolerance)
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
