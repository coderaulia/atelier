import { useState, useEffect, useRef } from 'react'
import { useToolLimit } from '../../hooks/useToolLimit'
import { usePlan } from '../../hooks/usePlan'
import type { ConversionJob, ImageFormat } from './types'
import Toast from '../../components/Toast'
import JobThumb from '../../components/JobThumb'
import { validateImage } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, isLowPowerDevice } from '../../lib/errorHandler'
import './image-converter.css'

export default function ImageConverterTool() {
  const { canUse, used, limit, increment } = useToolLimit('image-converter')
  const { isPro } = usePlan()

  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(90)
  const [jobs, setJobs] = useState<ConversionJob[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [mobileWarning] = useState(isLowPowerDevice())

  const workerRef = useRef<Worker | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { id, blob, error } = e.data
      setJobs(prev => prev.map(job => {
        if (job.id === id) {
          if (error) {
            return { ...job, status: 'error', error, progress: 0 }
          }
          return { ...job, status: 'complete', outputBlob: blob, progress: 100 }
        }
        return job
      }))
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Validate each file
    for (const file of fileArray) {
      const result = validateImage(file)
      if (!result.valid) {
        setToast({ message: result.error!, type: 'error' })
        return
      }
    }
    
    // Free plan: 1 file only
    if (!isPro && fileArray.length > 1) {
      setShowUpgrade(true)
      return
    }

    // Pro plan: max 20 files
    if (isPro && fileArray.length > 20) {
      setToast({ message: 'Maximum 20 files at a time', type: 'error' })
      return
    }

    // Check usage limit
    if (!canUse) {
      setShowUpgrade(true)
      return
    }

    const newJobs: ConversionJob[] = fileArray.map(file => ({
      id: crypto.randomUUID(),
      file,
      targetFormat,
      quality,
      status: 'pending',
      progress: 0
    }))

    if (newJobs.length === 0) return

    setJobs(prev => [...prev, ...newJobs])

    // Process each job
    for (const job of newJobs) {
      await processJob(job)
    }

    // Increment usage after successful conversion
    await increment()
  }

  const processJob = async (job: ConversionJob) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing', progress: 50 } : j))

    try {
      // Load image
      const img = await createImageBitmap(job.file)
      
      // Create ImageData
      const canvas = new OffscreenCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)

      // Send to worker
      workerRef.current?.postMessage({
        id: job.id,
        imageData,
        format: job.targetFormat,
        quality: job.quality
      })
    } catch (error) {
      const friendlyError = getFriendlyErrorMessage(error)
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'error', error: friendlyError, progress: 0 }
          : j
      ))
    }
  }

  const downloadSingle = (job: ConversionJob) => {
    if (!job.outputBlob) return

    const url = URL.createObjectURL(job.outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job.file.name.split('.')[0]}.${job.targetFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const completeJobs = jobs.filter(j => j.status === 'complete' && j.outputBlob)
    
    if (completeJobs.length === 0) return

    if (completeJobs.length === 1) {
      downloadSingle(completeJobs[0])
      return
    }

    // Batch download as ZIP (Pro only)
    if (!isPro) {
      setShowUpgrade(true)
      return
    }

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    
    for (const job of completeJobs) {
      const filename = `${job.file.name.split('.')[0]}.${job.targetFormat}`
      zip.file(filename, job.outputBlob!)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-images.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearJobs = () => {
    setJobs([])
  }

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const formatLabel = (format: ImageFormat) => {
    switch (format) {
      case 'jpg': return 'JPEG'
      case 'png': return 'PNG'
      case 'webp': return 'WebP'
      case 'avif': return 'AVIF'
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const completeCount = jobs.filter(j => j.status === 'complete').length

  return (
    <div className="img-tool">
      {/* Sidebar */}
      <div className="img-sidebar">
        <div className="img-sidebar__header">
          <div className="img-sidebar__title-row">
            <h1 className="img-sidebar__title">Image Converter</h1>
          </div>
          <div className="img-usage-bar">
            <div className="img-usage-bar__label">
              {used} / {limit === null ? '∞' : limit} conversions today
            </div>
            <div className="img-usage-bar__track">
              <div 
                className="img-usage-bar__fill" 
                style={{ width: limit ? `${(used / limit) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        <div className="img-sidebar__scroll">
          <div className="img-controls">
            {/* Format Selection */}
            <div className="img-section">
              <div className="img-section__label">Output Format</div>
              <div className="img-format-grid">
                <button
                  className={`img-format-btn ${targetFormat === 'jpg' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('jpg')}
                >
                  <span className="img-format-btn__icon">📷</span>
                  JPEG
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'png' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('png')}
                >
                  <span className="img-format-btn__icon">🖼️</span>
                  PNG
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'webp' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('webp')}
                >
                  <span className="img-format-btn__icon">🌐</span>
                  WebP
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'avif' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('avif')}
                >
                  <span className="img-format-btn__icon">⚡</span>
                  AVIF
                </button>
              </div>
            </div>

            {/* Quality */}
            {targetFormat !== 'png' && (
              <div className="img-section">
                <div className="img-section__label">Quality</div>
                <div className="img-quality">
                  <div className="img-quality__row">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="img-quality__slider"
                    />
                    <span className="img-quality__value">{quality}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload */}
            <div className="img-section">
              <div className="img-section__label">Upload Images</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple={isPro}
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />
              <div
                className="img-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="img-upload-zone__icon">📁</div>
                <div className="img-upload-zone__text">
                  {isPro ? 'Click or drag up to 20 images' : 'Click or drag 1 image'}
                </div>
                <div className="img-upload-zone__hint">
                  JPG, PNG, WebP, AVIF
                </div>
              </div>
            </div>

            {/* Actions */}
            {jobs.length > 0 && (
              <div className="img-section">
                <button
                  className="img-btn img-btn--primary"
                  onClick={downloadAll}
                  disabled={completeCount === 0}
                >
                  {completeCount > 1 && isPro ? '📦 Download ZIP' : '⬇️ Download'}
                  {completeCount > 0 && ` (${completeCount})`}
                </button>
                <button
                  className="img-btn img-btn--ghost"
                  onClick={clearJobs}
                  style={{ marginTop: '8px' }}
                >
                  🗑️ Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="img-preview">
        {jobs.length === 0 ? (
          <div className="img-preview__empty">
            <div className="img-preview__empty-icon">🖼️</div>
            <div className="img-preview__empty-text">
              Upload images to convert between formats
              <br />
              <strong>Free:</strong> 1 file at a time · <strong>Pro:</strong> Batch up to 20 files
            </div>
          </div>
        ) : (
          <div className="img-preview__scroll">
            <div className="img-jobs">
              {jobs.map(job => (
                <div key={job.id} className="img-job">
                  <div className="img-job__header">
                    <JobThumb
                      file={job.file}
                      alt={job.file.name}
                      className="img-job__thumb"
                    />
                    <div className="img-job__info">
                      <div className="img-job__name">{job.file.name}</div>
                      <div className="img-job__meta">
                        {formatSize(job.file.size)} → {formatLabel(job.targetFormat)} @ {job.quality}%
                      </div>
                    </div>
                    <span className={`img-job__status img-job__status--${job.status}`}>
                      {job.status}
                    </span>
                  </div>

                  {job.status === 'processing' && (
                    <div className="img-job__progress">
                      <div 
                        className="img-job__progress-fill" 
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}

                  {job.error && (
                    <div className="img-job__error">{job.error}</div>
                  )}

                  {job.status === 'complete' && job.outputBlob && (
                    <div className="img-job__actions">
                      <button
                        className="img-btn img-btn--primary img-job__btn"
                        onClick={() => downloadSingle(job)}
                      >
                        ⬇️ Download ({formatSize(job.outputBlob.size)})
                      </button>
                      <button
                        className="img-btn img-btn--ghost img-job__btn"
                        onClick={() => removeJob(job.id)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowUpgrade(false)}
        >
          <div 
            style={{
              background: 'var(--shell-bg-2)',
              border: '1px solid var(--shell-rule)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Upgrade to Pro</h2>
            <p style={{ color: 'var(--shell-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Unlock batch conversion (up to 20 files), unlimited daily conversions, and ZIP download.
            </p>
            <button className="img-btn img-btn--primary" style={{ marginBottom: '8px' }}>
              Upgrade Now
            </button>
            <button 
              className="img-btn img-btn--ghost"
              onClick={() => setShowUpgrade(false)}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Mobile performance warning */}
      {mobileWarning && (
        <div className="mobile-warning">
          ⚡ Processing may be slower on mobile devices.
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
