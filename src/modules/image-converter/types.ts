export type ImageFormat = 'jpg' | 'png' | 'webp' | 'avif'

export interface ConversionJob {
  id: string
  file: File
  targetFormat: ImageFormat
  quality: number
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  outputBlob?: Blob
  error?: string
}

export interface ConversionOptions {
  format: ImageFormat
  quality: number
}
