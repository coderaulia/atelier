import { useState, useEffect, useRef } from 'react'
import { useToolLimit } from '../../hooks/useToolLimit'
import { usePlan } from '../../hooks/usePlan'
import type { ResizeJob, ImageFormat, CropMode } from './types'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import JobThumb from '../../components/JobThumb'
import { validateImage } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, isLowPowerDevice } from '../../lib/errorHandler'
import '../image-converter/image-converter.css'
import './image-resize.css'

export default function ImageResizeTool() {
  const { canUse, used, limit, increment } = useToolLimit('image-resize')
  const { isPro } = usePlan()

  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png')
  const [targetWidth, setTargetWidth] = useState<number>(800)
  const [targetHeight, setTargetHeight] = useState<number>(600)
  const [aspectRatioLock, setAspectRatioLock] = useState<boolean>(true)
  const [cropMode, setCropMode] = useState<CropMode>('contain')

  const [jobs, setJobs] = useState<ResizeJob[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [mobileWarning] = useState(isLowPowerDevice())

  const workerRef = useRef<Worker | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalDimensionsRef = useRef<{ w: number; h: number } | null>(null)

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

  const handleWidthChange = (val: number) => {
    setTargetWidth(val)
    if (aspectRatioLock && originalDimensionsRef.current) {
      const ratio = originalDimensionsRef.current.h / originalDimensionsRef.current.w
      setTargetHeight(Math.round(val * ratio))
    }
  }

  const handleHeightChange = (val: number) => {
    setTargetHeight(val)
    if (aspectRatioLock && originalDimensionsRef.current) {
      const ratio = originalDimensionsRef.current.w / originalDimensionsRef.current.h
      setTargetWidth(Math.round(val * ratio))
    }
  }

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

    const nextJobs: ResizeJob[] = []

    for (const file of fileArray) {
      try {
        const img = await createImageBitmap(file)
        originalDimensionsRef.current = { w: img.width, h: img.height }

        // Initialize target dimensions if this is the first image or not locked
        let w = targetWidth
        let h = targetHeight
        if (nextJobs.length === 0) {
          w = targetWidth || img.width
          h = aspectRatioLock ? Math.round(w * (img.height / img.width)) : (targetHeight || img.height)
          setTargetWidth(w)
          setTargetHeight(h)
        }

        nextJobs.push({
          id: crypto.randomUUID(),
          file,
          targetFormat,
          targetWidth: w,
          targetHeight: h,
          cropMode,
          status: 'pending',
          progress: 0,
          originalWidth: img.width,
          originalHeight: img.height
        })
      } catch (err) {
        setToast({ message: getFriendlyErrorMessage(err), type: 'error' })
      }
    }

    if (nextJobs.length === 0) return

    setJobs(prev => [...prev, ...nextJobs])

    for (const job of nextJobs) {
      await processJob(job)
    }

    await increment()
  }

  const processJob = async (job: ResizeJob) => {
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
        format: job.targetFormat,
        width: job.targetWidth,
        height: job.targetHeight,
        cropMode: job.cropMode
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

  const downloadSingle = (job: ResizeJob) => {
    if (!job.outputBlob) return

    const url = URL.createObjectURL(job.outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job.file.name.split('.')[0]}-resized.${job.targetFormat}`
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
      const filename = `${job.file.name.split('.')[0]}-resized.${job.targetFormat}`
      zip.file(filename, job.outputBlob!)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resized-images.zip`
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

  const handleSocialPreset = (w: number, h: number) => {
    setAspectRatioLock(false)
    setTargetWidth(w)
    setTargetHeight(h)
  }

  return (
    <div className="img-tool">
      <div className="img-sidebar">
        <div className="img-sidebar__header">
          <div className="img-sidebar__title-row">
            <h1 className="img-sidebar__title">Image Resize & Crop</h1>
          </div>
          <div className="img-usage-bar">
            <div className="img-usage-bar__label">
              {used} / {limit === null ? '∞' : limit} resizes today
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
              <div className="img-section__label">Output Format</div>
              <div className="img-format-grid">
                <button
                  className={`img-format-btn ${targetFormat === 'jpg' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('jpg')}
                >
                  <span className="img-format-btn__icon">📷</span>JPEG
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'png' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('png')}
                >
                  <span className="img-format-btn__icon">🖼️</span>PNG
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'webp' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('webp')}
                >
                  <span className="img-format-btn__icon">🌐</span>WebP
                </button>
                <button
                  className={`img-format-btn ${targetFormat === 'avif' ? 'img-format-btn--active' : ''}`}
                  onClick={() => setTargetFormat('avif')}
                >
                  <span className="img-format-btn__icon">⚡</span>AVIF
                </button>
              </div>
            </div>

            <div className="img-section">
              <div className="img-section__label">Target Dimensions</div>
              <div className="img-resize-dimensions">
                <div className="img-resize-dim-field">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                  />
                </div>
                <div className="img-resize-dim-field">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                  />
                </div>
              </div>
              <label className="img-resize-lock-ratio">
                <input
                  type="checkbox"
                  checked={aspectRatioLock}
                  onChange={(e) => setAspectRatioLock(e.target.checked)}
                /> Maintain Aspect Ratio
              </label>
            </div>

            <div className="img-section">
              <div className="img-section__label">Crop Mode</div>
              <select
                className="img-resize-select"
                value={cropMode}
                onChange={(e) => setCropMode(e.target.value as CropMode)}
              >
                <option value="contain">Contain (Fit & Pad)</option>
                <option value="cover">Cover (Fill & Crop)</option>
                <option value="stretch">Stretch (Scale to Fit)</option>
              </select>
            </div>

            <div className="img-section">
              <div className="img-section__label">Social Presets</div>
              <div className="img-resize-presets">
                <button className="img-btn img-btn--ghost" onClick={() => handleSocialPreset(1080, 1080)}>
                  Instagram Post (1:1)
                </button>
                <button className="img-btn img-btn--ghost" onClick={() => handleSocialPreset(1080, 1920)}>
                  TikTok / Reels (9:16)
                </button>
                <button className="img-btn img-btn--ghost" onClick={() => handleSocialPreset(1200, 630)}>
                  Facebook Share (1.91:1)
                </button>
                <button className="img-btn img-btn--ghost" onClick={() => handleSocialPreset(1920, 1080)}>
                  YouTube Thumbnail (16:9)
                </button>
              </div>
            </div>

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
            <div className="img-preview__empty-icon">📐</div>
            <div className="img-preview__empty-text">
              Upload images to resize & crop
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
                        {job.originalWidth}x{job.originalHeight} → {job.targetWidth}x{job.targetHeight} ({formatLabel(job.targetFormat)})
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
