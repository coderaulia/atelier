import { useState, useEffect, useRef } from 'react'
import { useToolLimit } from '../../hooks/useToolLimit'
import { usePlan } from '../../hooks/usePlan'
import type { ImageJob } from './types'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import JobThumb from '../../components/JobThumb'
import { validateImage } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, isLowPowerDevice } from '../../lib/errorHandler'
import '../image-converter/image-converter.css'
import './image-bg.css'

export default function ImageBgTool() {
  const { canUse, used, limit, increment } = useToolLimit('image-bg')
  const { isPro } = usePlan()

  const [removeExif, setRemoveExif] = useState(true)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [flattenToJpeg, setFlattenToJpeg] = useState(false)
  const [colorKey, setColorKey] = useState<string | null>(null)
  const [tolerance, setTolerance] = useState(30)

  const [jobs, setJobs] = useState<ImageJob[]>([])
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
          return { ...job, status: 'complete', outputBlob: blob, outputSize: blob.size, progress: 100 }
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

    for (const file of fileArray) {
      const result = validateImage(file)
      if (!result.valid) {
        setToast({ message: result.error!, type: 'error' })
        return
      }
    }

    if (!isPro && fileArray.length > 1) {
      setShowUpgrade(true)
      return
    }

    if (isPro && fileArray.length > 20) {
      setToast({ message: 'Maximum 20 files at a time', type: 'error' })
      return
    }

    if (!canUse) {
      setShowUpgrade(true)
      return
    }

    const nextJobs: ImageJob[] = []
    for (const file of fileArray) {
      let metadata: Record<string, any> = {
        name: file.name,
        type: file.type,
      }

      // Read basic dimensions
      try {
        const img = await createImageBitmap(file)
        metadata.width = img.width
        metadata.height = img.height
      } catch (err) {
        // Fallback if bitmap loader fails
      }

      nextJobs.push({
        id: crypto.randomUUID(),
        file,
        status: 'pending',
        progress: 0,
        originalSize: file.size,
        metadata
      })
    }

    if (nextJobs.length === 0) return

    setJobs(prev => [...prev, ...nextJobs])

    for (const job of nextJobs) {
      await processJob(job)
    }

    await increment()
  }

  const processJob = async (job: ImageJob) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing', progress: 50 } : j))

    try {
      const img = await createImageBitmap(job.file)
      const canvas = new OffscreenCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)

      workerRef.current?.postMessage({
        id: job.id,
        imageData,
        bgColor,
        flattenToJpeg,
        colorKey,
        tolerance
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

  const downloadSingle = (job: ImageJob) => {
    if (!job.outputBlob) return

    const url = URL.createObjectURL(job.outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job.file.name.split('.')[0]}-processed.${flattenToJpeg ? 'jpg' : 'png'}`
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

    if (!isPro) {
      setShowUpgrade(true)
      return
    }

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    for (const job of completeJobs) {
      const filename = `${job.file.name.split('.')[0]}-processed.${flattenToJpeg ? 'jpg' : 'png'}`
      zip.file(filename, job.outputBlob!)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `processed-images.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearJobs = () => setJobs([])
  const removeJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const completeCount = jobs.filter(j => j.status === 'complete').length

  return (
    <div className="img-tool">
      <div className="img-sidebar">
        <div className="img-sidebar__header">
          <div className="img-sidebar__title-row">
            <h1 className="img-sidebar__title">Image Background & Metadata</h1>
          </div>
          <div className="img-usage-bar">
            <div className="img-usage-bar__label">
              {used} / {limit === null ? '∞' : limit} processed today
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
            <div className="img-section">
              <label className="img-bg-checkbox-label">
                <input
                  type="checkbox"
                  checked={removeExif}
                  onChange={(e) => setRemoveExif(e.target.checked)}
                /> Strip EXIF Metadata
              </label>
            </div>

            <div className="img-section">
              <label className="img-bg-checkbox-label">
                <input
                  type="checkbox"
                  checked={flattenToJpeg}
                  disabled={colorKey !== null && bgColor === null}
                  onChange={(e) => setFlattenToJpeg(e.target.checked)}
                /> Flatten to JPEG
              </label>
              {colorKey !== null && bgColor === null && (
                <div className="img-bg-help">Transparent backgrounds are exported as PNG.</div>
              )}
            </div>

            <div className="img-section">
              <div className="img-section__label">Background Color</div>
              <div className="img-bg-color-picker-row">
                <button
                  className={`img-bg-color-btn ${bgColor === null ? 'active' : ''}`}
                  onClick={() => setBgColor(null)}
                >
                  Transparent
                </button>
                <button
                  className={`img-bg-color-btn ${bgColor === '#ffffff' ? 'active' : ''}`}
                  onClick={() => setBgColor('#ffffff')}
                >
                  White
                </button>
                <button
                  className={`img-bg-color-btn ${bgColor === '#000000' ? 'active' : ''}`}
                  onClick={() => setBgColor('#000000')}
                >
                  Black
                </button>
                <input
                  type="color"
                  value={bgColor || '#ffffff'}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="img-bg-custom-color"
                />
              </div>
            </div>

            <div className="img-section">
              <div className="img-section__label">Background Color Keying</div>
              <div className="img-bg-color-key">
                <label className="img-bg-checkbox-label">
                  <input
                    type="checkbox"
                    checked={colorKey !== null}
                    onChange={(e) => {
                      const enabled = e.target.checked
                      setColorKey(enabled ? '#ffffff' : null)
                      if (enabled && bgColor === null) setFlattenToJpeg(false)
                    }}
                  /> Remove background color
                </label>
                {colorKey !== null && (
                  <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={colorKey}
                        onChange={(e) => setColorKey(e.target.value)}
                      />
                      <span style={{ fontSize: '12px' }}>Color to remove</span>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tolerance</label>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <span style={{ fontSize: '11px', display: 'block', textAlign: 'right' }}>{tolerance}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="img-section">
              <div className="img-section__label">Upload Image</div>
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
                <div className="img-upload-zone__hint">JPG, PNG, WebP, AVIF</div>
              </div>
            </div>

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

      <div className="img-preview">
        {jobs.length === 0 ? (
          <div className="img-preview__empty">
            <div className="img-preview__empty-icon">🎨</div>
            <div className="img-preview__empty-text">
              Upload images to remove background or view metadata
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
                        {formatSize(job.originalSize)}
                        {job.outputSize ? ` → ${formatSize(job.outputSize)}` : ''}
                        {job.metadata?.width && ` (${job.metadata.width}x${job.metadata.height})`}
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
                        ⬇️ Download
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

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {mobileWarning && (
        <div className="mobile-warning">
          ⚡ Processing may be slower on mobile devices.
        </div>
      )}

      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
