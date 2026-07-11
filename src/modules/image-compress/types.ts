export type ImageFormat = 'jpg' | 'png' | 'webp' | 'avif'

export interface CompressionJob {
  id: string
  file: File
  targetFormat: ImageFormat
  targetSizeKB?: number
  targetQuality?: number
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  outputBlob?: Blob
  originalSize: number
  outputSize?: number
  error?: string
}

export interface CompressionOptions {
  format: ImageFormat
  targetSizeKB?: number
  targetQuality?: number
}
