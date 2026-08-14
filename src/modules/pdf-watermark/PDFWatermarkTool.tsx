import { useState, useCallback, useRef } from 'react'
import { useToolLimit } from '../../hooks/useToolLimit'
import { usePlan } from '../../hooks/usePlan'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage } from '../../lib/errorHandler'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './pdf-watermark.css'

// Lazy-loaded pdfjs-dist
let pdfjsLib: any = null
let pdfjsLoaded = false

async function loadPdfJs() {
  if (pdfjsLoaded) return pdfjsLib
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  pdfjsLib = pdfjs
  pdfjsLoaded = true
  return pdfjs
}

// Lazy-loaded pdf-lib
let PDFDocument: any = null
let pdfLibLoaded = false
let rgb: any = null
let degrees: any = null
let StandardFonts: any = null

async function loadPdfLib() {
  if (pdfLibLoaded) return { PDFDocument, rgb, degrees, StandardFonts }
  const module = await import('pdf-lib')
  PDFDocument = module.PDFDocument
  rgb = module.rgb
  degrees = module.degrees
  StandardFonts = module.StandardFonts
  pdfLibLoaded = true
  return { PDFDocument, rgb, degrees, StandardFonts }
}

const FREE_PAGE_LIMIT = 20
const PRO_PAGE_LIMIT = 100

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function PDFWatermarkTool() {
  const { canUse, used, limit, increment } = useToolLimit('pdf-watermark')
  const { isPro } = usePlan()
  const usageText = `${used}/${limit === null ? '∞' : limit} watermarks today`
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [totalPages, setTotalPages] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Watermark configurations
  const [watermarkText, setWatermarkText] = useState('Confidential')
  const [fontSize, setFontSize] = useState(36)
  const [opacity, setOpacity] = useState(0.3)
  const [rotation, setRotation] = useState(-45)
  const [textColor, setTextColor] = useState('#ff0000')
  const [position, setPosition] = useState<'center' | 'tile' | 'top-right' | 'bottom-left'>('center')

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT

  const loadFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const validation = await validatePDF(nextFile)
    if (!validation.valid) return setToast({ message: validation.error ?? 'Unable to open PDF.', type: 'error' })
    setLoading(true)
    try {
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await nextFile.arrayBuffer() }).promise
      setTotalPages(pdf.numPages)
      if (pdf.numPages > pageLimit) {
        setToast({ message: `This file has ${pdf.numPages} pages. ${isPro ? 'Pro supports up to 100 pages.' : 'Free supports up to 20 pages.'}`, type: 'warning' })
        if (!isPro) setShowUpgrade(true)
        return
      }

      // Render page 1 preview
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.8 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is not available.')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvasContext: context, viewport }).promise
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85))
      setFile(nextFile)
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [isPro, pageLimit])

  const hexToRgb = (hex: string) => {
    const clean = hex.replace(/^#/, '')
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    return { r, g, b }
  }

  const handleApplyWatermark = async () => {
    if (!file) return
    if (!canUse) return setShowUpgrade(true)
    setProcessing(true)
    try {
      const ok = await increment()
      if (!ok) {
        setShowUpgrade(true)
        return
      }
      const pdfLib = await loadPdfLib()
      const sourceDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer())
      const font = await sourceDoc.embedFont(pdfLib.StandardFonts.Helvetica)
      const color = hexToRgb(textColor)
      const pdfColor = pdfLib.rgb(color.r, color.g, color.b)

      const total = sourceDoc.getPageCount()
      for (let i = 0; i < total; i++) {
        const page = sourceDoc.getPage(i)
        const { width, height } = page.getSize()

        const drawOpts = {
          x: width / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: pdfColor,
          opacity,
          rotate: pdfLib.degrees(rotation),
        }

        if (position === 'center') {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
          drawOpts.x = (width - textWidth) / 2
          drawOpts.y = height / 2
          page.drawText(watermarkText, drawOpts)
        } else if (position === 'top-right') {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
          drawOpts.x = width - textWidth - 40
          drawOpts.y = height - fontSize - 40
          page.drawText(watermarkText, drawOpts)
        } else if (position === 'bottom-left') {
          drawOpts.x = 40
          drawOpts.y = 40
          page.drawText(watermarkText, drawOpts)
        } else if (position === 'tile') {
          const stepX = 200
          const stepY = 200
          for (let x = 50; x < width; x += stepX) {
            for (let y = 50; y < height; y += stepY) {
              page.drawText(watermarkText, {
                ...drawOpts,
                x,
                y,
              })
            }
          }
        }
        setProgress(Math.round(((i + 1) / total) * 100))
      }

      const bytes = await sourceDoc.save()
      download(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`)
      setToast({ message: 'Watermark added successfully.', type: 'success' })
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const clear = () => {
    setFile(null); setPreviewUrl(''); setTotalPages(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="pdfwatermark-tool">
      <aside className="pdfwatermark-panel">
        <div className="pdfwatermark-heading">
          <div>
            <span>PDF tools</span>
            <h1>PDF Watermark</h1>
          </div>
          {file && <button onClick={clear}>New file</button>}
        </div>
        {!file && (
          <button className="pdfwatermark-upload" onClick={() => inputRef.current?.click()} disabled={loading}>
            <b>PDF</b>
            <strong>{loading ? 'Preparing...' : 'Choose a PDF'}</strong>
            <small>Up to {pageLimit} pages</small>
          </button>
        )}
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => loadFile(event.target.files?.[0] ?? null)} />
        {file && (
          <div className="pdfwatermark-controls">
            <div className="pdfwatermark-file">
              <strong>{file.name}</strong>
              <span>{totalPages} pages</span>
            </div>
            <div className="pdfwatermark-settings">
              <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>{usageText}</div>
              <div className="pdfwatermark-field">
                <label>Watermark Text</label>
                <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
              </div>
              <div className="pdfwatermark-field">
                <label>Font Size</label>
                <input type="range" min="12" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                <span>{fontSize}px</span>
              </div>
              <div className="pdfwatermark-field">
                <label>Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <div className="pdfwatermark-field">
                <label>Rotation (deg)</label>
                <input type="range" min="-90" max="90" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
                <span>{rotation}°</span>
              </div>
              <div className="pdfwatermark-field">
                <label>Text Color</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>
              <div className="pdfwatermark-field">
                <label>Position</label>
                <select value={position} onChange={(e: any) => setPosition(e.target.value)}>
                  <option value="center">Center</option>
                  <option value="tile">Tile (Repeat grid)</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
            </div>
            <button className="pdfwatermark-export" onClick={handleApplyWatermark} disabled={processing}>
              {processing ? `Applying... ${progress}%` : 'Apply Watermark'}
            </button>
          </div>
        )}
      </aside>
      <main className="pdfwatermark-workspace">
        {!file ? (
          <div className="pdfwatermark-empty">
            <span>Private browser processing</span>
            <h2>Watermark PDFs client-side.</h2>
            <p>Add text overlays privately without sending files to any servers.</p>
          </div>
        ) : (
          <div className="pdfwatermark-preview-container">
            {previewUrl && (
              <div className="pdfwatermark-preview-wrapper" style={{ position: 'relative' }}>
                <img src={previewUrl} alt="PDF page preview" className="pdfwatermark-preview-img" />
                <div
                  className="pdfwatermark-overlay-preview"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {position === 'center' && (
                    <span
                      style={{
                        color: textColor,
                        fontSize: `${fontSize * 0.8}px`,
                        opacity: opacity,
                        transform: `rotate(${rotation}deg)`,
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {watermarkText}
                    </span>
                  )}
                  {position === 'top-right' && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        color: textColor,
                        fontSize: `${fontSize * 0.8}px`,
                        opacity: opacity,
                        transform: `rotate(${rotation}deg)`,
                        fontWeight: 'bold',
                      }}
                    >
                      {watermarkText}
                    </span>
                  )}
                  {position === 'bottom-left' && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        color: textColor,
                        fontSize: `${fontSize * 0.8}px`,
                        opacity: opacity,
                        transform: `rotate(${rotation}deg)`,
                        fontWeight: 'bold',
                      }}
                    >
                      {watermarkText}
                    </span>
                  )}
                  {position === 'tile' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '40px',
                        width: '120%',
                        height: '120%',
                        transform: `rotate(${rotation}deg)`,
                        opacity: opacity,
                      }}
                    >
                      {Array.from({ length: 16 }).map((_, idx) => (
                        <span
                          key={idx}
                          style={{
                            color: textColor,
                            fontSize: `${fontSize * 0.6}px`,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {watermarkText}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <Toast message={toast?.message ?? null} type={toast?.type ?? 'error'} onClose={() => setToast(null)} />
    </div>
  )
}
