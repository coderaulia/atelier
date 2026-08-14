import { useState, useCallback, useRef } from 'react'
import { useToolLimit } from '../../hooks/useToolLimit'
import { usePlan } from '../../hooks/usePlan'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, isLowPowerDevice } from '../../lib/errorHandler'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './pdf-split.css'

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

async function loadPdfLib() {
  if (pdfLibLoaded) return PDFDocument
  const module = await import('pdf-lib')
  PDFDocument = module.PDFDocument
  pdfLibLoaded = true
  return module.PDFDocument
}

// Lazy-loaded JSZip
let JSZip: any = null
let jszipLoaded = false

async function loadJSZip() {
  if (jszipLoaded) return JSZip
  const module = await import('jszip')
  JSZip = module.default
  jszipLoaded = true
  return JSZip
}

type PageItem = { id: string; index: number; preview: string }
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

function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const pages: number[] = []
  const clean = rangeStr.replace(/\s+/g, '')
  if (!clean) return []
  for (const part of clean.split(',')) {
    if (part.includes('-')) {
      const [startS, endS] = part.split('-')
      const start = Math.max(1, parseInt(startS, 10))
      const end = Math.min(totalPages, parseInt(endS, 10))
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) pages.push(i - 1)
      }
    } else {
      const num = parseInt(part, 10)
      if (!isNaN(num) && num >= 1 && num <= totalPages) pages.push(num - 1)
    }
  }
  return Array.from(new Set(pages)).sort((a, b) => a - b)
}

export default function PDFSplitTool() {
  const { canUse, used, limit, increment } = useToolLimit('pdf-split')
  const { isPro } = usePlan()
  // ...
  // use used/limit to drive UI usage indicators
  const usageText = `${used}/${limit === null ? '∞' : limit} splits today`
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [splitMode, setSplitMode] = useState<'all' | 'custom' | 'every'>('all')
  const [customRange, setCustomRange] = useState('')
  const [everyN, setEveryN] = useState(1)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null)
  const [mobileWarning] = useState(isLowPowerDevice())
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
      if (pdf.numPages > pageLimit) {
        setToast({ message: `This file has ${pdf.numPages} pages. ${isPro ? 'Pro supports up to 100 pages.' : 'Free supports up to 20 pages.'}`, type: 'warning' })
        if (!isPro) setShowUpgrade(true)
        return
      }
      const items: PageItem[] = []
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await pdf.getPage(number)
        const viewport = page.getViewport({ scale: 0.28 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas is not available.')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        await page.render({ canvasContext: context, viewport }).promise
        items.push({ id: crypto.randomUUID(), index: number - 1, preview: canvas.toDataURL('image/jpeg', 0.78) })
        setProgress(Math.round((number / pdf.numPages) * 100))
      }
      setFile(nextFile)
      setPages(items)
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }, [isPro, pageLimit])

  const handleSplit = async () => {
    if (!file || !pages.length) return
    if (!canUse) return setShowUpgrade(true)
    setProcessing(true)
    try {
      const ok = await increment()
      if (!ok) {
        setShowUpgrade(true)
        return
      }
      const pdfLib = await loadPdfLib()
      const sourceDoc = await pdfLib.load(await file.arrayBuffer())
      const total = pages.length
      let groups: number[][] = []

      if (splitMode === 'all') {
        groups = Array.from({ length: total }, (_, i) => [i])
      } else if (splitMode === 'every') {
        const step = Math.max(1, everyN)
        for (let i = 0; i < total; i += step) {
          const group: number[] = []
          for (let j = i; j < i + step && j < total; j++) group.push(j)
          groups.push(group)
        }
      } else if (splitMode === 'custom') {
        const indices = parsePageRange(customRange, total)
        if (!indices.length) {
          setToast({ message: 'Enter a valid page range (e.g. 1-3, 5).', type: 'error' })
          return
        }
        groups.push(indices)
        // Add remainder if Pro, or let it just split selected
        const remainder = Array.from({ length: total }, (_, i) => i).filter(idx => !indices.includes(idx))
        if (remainder.length) groups.push(remainder)
      }

      if (groups.length === 1) {
        const output = await pdfLib.create()
        const copied = await output.copyPages(sourceDoc, groups[0])
        copied.forEach((p: any) => output.addPage(p))
        const bytes = await output.save()
        download(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}-split.pdf`)
        setToast({ message: 'PDF split successfully.', type: 'success' })
      } else {
        const zipLib = await loadJSZip()
        const zip = new zipLib()
        for (let i = 0; i < groups.length; i++) {
          const output = await pdfLib.create()
          const copied = await output.copyPages(sourceDoc, groups[i])
          copied.forEach((p: any) => output.addPage(p))
          const bytes = await output.save()
          zip.file(`split-part-${i + 1}.pdf`, bytes)
        }
        const blob = await zip.generateAsync({ type: 'blob' })
        download(blob, `${file.name.replace(/\.pdf$/i, '')}-split.zip`)
        setToast({ message: 'ZIP archive is ready.', type: 'success' })
      }
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const clear = () => {
    setFile(null); setPages([]); setCustomRange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="pdfsplit-tool">
      <aside className="pdfsplit-panel">
        <div className="pdfsplit-heading">
          <div>
            <span>PDF tools</span>
            <h1>PDF Split</h1>
          </div>
          {file && <button onClick={clear}>New file</button>}
        </div>
        {!file && (
          <button className="pdfsplit-upload" onClick={() => inputRef.current?.click()} disabled={loading}>
            <b>PDF</b>
            <strong>{loading ? `Preparing ${progress}%` : 'Choose a PDF'}</strong>
            <small>Up to {pageLimit} pages</small>
          </button>
        )}
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => loadFile(event.target.files?.[0] ?? null)} />
        {file && (
          <div className="pdfsplit-controls">
            <div className="pdfsplit-file">
              <strong>{file.name}</strong>
              <span>{pages.length} pages</span>
            </div>
            <div className="pdfsplit-options">
              <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '8px'}}>{usageText}</div>
              <label>
                <input type="radio" checked={splitMode === 'all'} onChange={() => setSplitMode('all')} /> Split all pages
              </label>
              <label>
                <input type="radio" checked={splitMode === 'every'} onChange={() => setSplitMode('every')} /> Split every N pages
              </label>
              {splitMode === 'every' && (
                <input type="number" min="1" max={pages.length} value={everyN} onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value, 10)))} className="pdfsplit-input" />
              )}
              <label>
                <input type="radio" checked={splitMode === 'custom'} onChange={() => setSplitMode('custom')} /> Custom range
              </label>
              {splitMode === 'custom' && (
                <input type="text" placeholder="e.g. 1-3, 5" value={customRange} onChange={(e) => setCustomRange(e.target.value)} className="pdfsplit-input" />
              )}
            </div>
            <button className="pdfsplit-export" onClick={handleSplit} disabled={processing}>
              {processing ? 'Processing...' : 'Split PDF'}
            </button>
            {!isPro && <p className="pdfsplit-upgrade-text">Free limits: files up to 20 pages.</p>}
          </div>
        )}
      </aside>
      <main className="pdfsplit-workspace">
        {!file ? (
          <div className="pdfsplit-empty">
            <span>Private browser processing</span>
            <h2>Split any PDF in seconds.</h2>
            <p>Extract single pages or ranges directly in your browser without uploading files.</p>
          </div>
        ) : (
          <div className="pdfsplit-grid">
            {pages.map((page, position) => (
              <div key={page.id} className="pdfsplit-page">
                <span>{position + 1}</span>
                <img src={page.preview} alt={`Page ${position + 1}`} />
              </div>
            ))}
          </div>
        )}
      </main>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <Toast message={toast?.message ?? null} type={toast?.type ?? 'error'} onClose={() => setToast(null)} />
      {mobileWarning && <div className="mobile-warning">⚡ Slower processing on mobile devices.</div>}
    </div>
  )
}
