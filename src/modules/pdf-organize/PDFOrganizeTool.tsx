import { useCallback, useRef, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { usePlan } from '@/hooks/usePlan'
import { validatePDF } from '@/lib/fileValidation'
import { getFriendlyErrorMessage } from '@/lib/errorHandler'
import UpgradeModal from '@/components/UpgradeModal'
import Toast from '@/components/Toast'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './pdf-organize.css'

type PageItem = { id: string; index: number; rotation: number; preview: string }
const FREE_PAGE_LIMIT = 20
const PRO_PAGE_LIMIT = 100
let pdfjsPromise: Promise<any> | null = null

async function loadPdfJs() {
  if (!pdfjsPromise) pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
    return pdfjs
  })
  return pdfjsPromise
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function PDFOrganizeTool() {
  const { isPro } = usePlan()
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [draggedId, setDraggedId] = useState<string | null>(null)
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
        if (!context) throw new Error('Canvas is not available in this browser.')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        await page.render({ canvasContext: context, viewport }).promise
        items.push({ id: crypto.randomUUID(), index: number - 1, rotation: 0, preview: canvas.toDataURL('image/jpeg', 0.78) })
        setProgress(Math.round((number / pdf.numPages) * 100))
      }
      setFile(nextFile)
      setPages(items)
      setSelected(new Set(items.map((item) => item.id)))
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }, [isPro, pageLimit])

  const toggle = useCallback((id: string) => setSelected((current) => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  }), [])

  const rotate = useCallback((amount: number) => {
    setPages((current) => current.map((page) => selected.has(page.id)
      ? { ...page, rotation: (page.rotation + amount + 360) % 360 }
      : page))
  }, [selected])

  const remove = useCallback(() => {
    setPages((current) => current.filter((page) => !selected.has(page.id)))
    setSelected(new Set())
  }, [selected])

  const reorder = useCallback((targetId: string) => {
    if (!draggedId || draggedId === targetId) return
    setPages((current) => {
      const from = current.findIndex((page) => page.id === draggedId)
      const to = current.findIndex((page) => page.id === targetId)
      if (from < 0 || to < 0) return current
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setDraggedId(null)
  }, [draggedId])

  const buildPdf = useCallback(async (items: PageItem[]) => {
    if (!file) throw new Error('Choose a PDF first.')
    const source = await PDFDocument.load(await file.arrayBuffer())
    const output = await PDFDocument.create()
    for (const item of items) {
      const [page] = await output.copyPages(source, [item.index])
      page.setRotation(degrees((source.getPage(item.index).getRotation().angle + item.rotation) % 360))
      output.addPage(page)
    }
    return output.save()
  }, [file])

  const exportPdf = useCallback(async () => {
    if (!pages.length || !file) return
    setExporting(true)
    try {
      const bytes = await buildPdf(pages)
      download(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}-organized.pdf`)
      setToast({ message: 'Organized PDF is ready.', type: 'success' })
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally { setExporting(false) }
  }, [buildPdf, file, pages])

  const extract = useCallback(async () => {
    if (!isPro) return setShowUpgrade(true)
    const chosen = pages.filter((page) => selected.has(page.id))
    if (!chosen.length || !file) return
    setExporting(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (const [position, item] of chosen.entries()) zip.file(`page-${String(position + 1).padStart(2, '0')}.pdf`, await buildPdf([item]))
      download(await zip.generateAsync({ type: 'blob' }), `${file.name.replace(/\.pdf$/i, '')}-pages.zip`)
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally { setExporting(false) }
  }, [buildPdf, file, isPro, pages, selected])

  const clear = () => {
    setFile(null); setPages([]); setSelected(new Set())
    if (inputRef.current) inputRef.current.value = ''
  }

  return <div className="pdforganize-tool">
    <aside className="pdforganize-panel">
      <div className="pdforganize-heading"><div><span>PDF tools</span><h1>Organize PDF</h1></div>{file && <button onClick={clear}>New file</button>}</div>
      {!file && <button className="pdforganize-upload" onClick={() => inputRef.current?.click()} disabled={loading}><b>PDF</b><strong>{loading ? `Preparing ${progress}%` : 'Choose a PDF'}</strong><small>Up to {pageLimit} pages</small></button>}
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => loadFile(event.target.files?.[0] ?? null)} />
      {file && <div className="pdforganize-controls">
        <div className="pdforganize-file"><strong>{file.name}</strong><span>{pages.length} pages, {selected.size} selected</span></div>
        <div className="pdforganize-actions"><button onClick={() => rotate(-90)} disabled={!selected.size || exporting}>Rotate left</button><button onClick={() => rotate(90)} disabled={!selected.size || exporting}>Rotate right</button><button onClick={remove} disabled={!selected.size || exporting}>Remove selected</button></div>
        <button className="pdforganize-export" onClick={exportPdf} disabled={!pages.length || exporting}>{exporting ? 'Preparing...' : 'Export PDF'}</button>
        <button className="pdforganize-extract" onClick={extract} disabled={!selected.size || exporting}>Extract selected {isPro ? '' : '(Pro)'}</button>
        {!isPro && <p>Free: up to 20 pages. Pro: up to 100 pages and individual-page ZIP export.</p>}
      </div>}
    </aside>
    <main className="pdforganize-workspace">
      {!file ? <div className="pdforganize-empty"><span>Private browser processing</span><h2>Put every page in its place.</h2><p>Reorder, rotate, remove, or extract pages without uploading your PDF.</p></div> : <div className="pdforganize-grid">{pages.map((page, position) => <button key={page.id} className={`pdforganize-page ${selected.has(page.id) ? 'is-selected' : ''} ${draggedId === page.id ? 'is-dragging' : ''}`} draggable onClick={() => toggle(page.id)} onDragStart={() => setDraggedId(page.id)} onDragEnd={() => setDraggedId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(page.id)} aria-pressed={selected.has(page.id)}><span>{position + 1}</span><img src={page.preview} alt={`Page ${position + 1}`} style={{ transform: `rotate(${page.rotation}deg)` }} /></button>)}{!pages.length && <p className="pdforganize-none">All pages were removed. Choose a new file to start again.</p>}</div>}
    </main>
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    <Toast message={toast?.message ?? null} type={toast?.type ?? 'error'} onClose={() => setToast(null)} />
  </div>
}
