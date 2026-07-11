export type ImageFormat = 'jpg' | 'png' | 'webp' | 'avif'
export type CropMode = 'cover' | 'contain' | 'stretch'

export interface ResizeJob {
  id: string
  file: File
  targetFormat: ImageFormat
  targetWidth: number
  targetHeight: number
  cropMode: CropMode
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  outputBlob?: Blob
  originalWidth: number
  originalHeight: number
  error?: string
}

export interface ResizeOptions {
  format: ImageFormat
  width: number
  height: number
  cropMode: CropMode
}
