export function getFriendlyErrorMessage(error: unknown, pageNumber?: number): string {
  const err = error as { name?: string; message?: string; code?: number }
  const message = err?.message || ''
  const name = err?.name || ''

  if (name === 'PasswordException' || /password/i.test(message)) {
    return 'This PDF is password-protected. Remove the password first.'
  }

  if (pageNumber) {
    return `Something went wrong processing page ${pageNumber}. Try fewer pages.`
  }

  if (/valid image|decode|bitmap|unsupported image/i.test(message)) {
    return "This doesn't look like a valid image file."
  }

  if (/valid PDF|pdf/i.test(message)) {
    return "This doesn't look like a valid PDF file."
  }

  return message || 'Something went wrong. Try a different file.'
}

export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.hardwareConcurrency <= 4 || /Android|iPhone/.test(navigator.userAgent)
}

export function releaseCanvas(canvas: HTMLCanvasElement | OffscreenCanvas | null | undefined): void {
  if (!canvas) return
  canvas.width = 0
  canvas.height = 0
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create file. Try a different page.'))),
      type,
      quality
    )
  })
}
