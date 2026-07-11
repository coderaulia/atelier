export type ImageFormat = 'png' | 'jpg' | 'webp'

export interface ImageJob {
  id: string
  file: File
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  error?: string
  outputBlob?: Blob
  originalSize: number
  outputSize?: number
  metadata?: Record<string, any>
}

export interface ProcessingSettings {
  removeExif: boolean
  bgColor: string | null
  flattenToJpeg: boolean
  colorKey: string | null
  tolerance: number
}
