import { useCallback, useRef, useState } from 'react'
import { usePlan } from '../../hooks/usePlan'
import { useToolLimit } from '../../hooks/useToolLimit'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import PDFThemeToggle from '../../components/PDFThemeToggle'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, releaseCanvas } from '../../lib/errorHandler'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import '../pdf-markdown/pdf-markdown.css'

let pdfjsLib: any = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  pdfjsLib = pdfjs
  return pdfjs
}

type ExportMode = 'editable' | 'visual'
const FREE_PAGE_LIMIT = 10
const PRO_PAGE_LIMIT = 50

function pageText(items: Array<{ str: string; transform: number[] }>) {
  return items.filter((item) => item.str?.trim()).map((item) => ({ text: item.str.trim(), x: item.transform?.[4] ?? 0, y: item.transform?.[5] ?? 0 })).sort((a, b) => b.y - a.y || a.x - b.x).map((item) => item.text).join(' ')
}

export default function PDFPowerPointTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [mode, setMode] = useState<ExportMode>('editable')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isPro } = usePlan()
  const { canUse, increment } = useToolLimit('pdf-powerpoint')
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT

  const inspectFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const result = await validatePDF(nextFile)
    if (!result.valid) return setToast({ message: result.error ?? 'Choose a valid PDF.', type: 'error' })
    try {
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await nextFile.arrayBuffer() }).promise
      setFile(nextFile); setPageCount(pdf.numPages)
      setToast(pdf.numPages > pageLimit ? { message: `${isPro ? 'Pro' : 'Free'} exports the first ${pageLimit} pages.`, type: 'warning' } : null)
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
  }, [isPro, pageLimit])

  const clear = useCallback(() => {
    setFile(null); setPageCount(0); setProgress(0); setToast(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const convert = useCallback(async () => {
    if (!file) return
    if (!canUse) return setShowUpgrade(true)
    setIsProcessing(true); setProgress(0); setToast(null)
    try {
      if (!await increment()) return setShowUpgrade(true)
      const [pdfjs, pptxModule] = await Promise.all([loadPdfJs(), import('pptxgenjs')])
      const PptxGenJS = pptxModule.default
      const pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_WIDE'
      pptx.author = 'Vanaila Studio'
      pptx.subject = 'PDF conversion'
      pptx.title = file.name.replace(/\.pdf$/i, '')
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
      const maxPages = Math.min(pdf.numPages, pageLimit)
      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const slide = pptx.addSlide()
        if (mode === 'visual') {
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Could not render this PDF page.')
          await page.render({ canvasContext: context, viewport }).promise
          slide.addImage({ data: canvas.toDataURL('image/jpeg', 0.92), x: 0, y: 0, w: 13.333, h: 7.5 })
          releaseCanvas(canvas)
        } else {
          const content = await page.getTextContent()
          const text = pageText(content.items as Array<{ str: string; transform: number[] }>) || 'No selectable text found on this page.'
          slide.background = { color: 'F8FAFC' }
          slide.addText(`Page ${pageNumber}`, { x: 0.6, y: 0.45, w: 12.1, h: 0.45, fontFace: 'Aptos Display', fontSize: 22, bold: true, color: '172033' })
          slide.addText(text, { x: 0.7, y: 1.25, w: 11.95, h: 5.55, fontFace: 'Aptos', fontSize: 16, color: '26364A', breakLine: false, margin: 0.08, valign: 'top', fit: 'shrink' })
          slide.addText(`Converted locally from ${file.name}`, { x: 0.7, y: 7.03, w: 11.95, h: 0.2, fontSize: 7, color: '7B8798', align: 'right' })
        }
        setProgress(Math.round((pageNumber / maxPages) * 100))
      }
      await pptx.writeFile({ fileName: `${file.name.replace(/\.pdf$/i, '')}.pptx` })
      if (pdf.numPages > maxPages) setToast({ message: `Exported the first ${maxPages} pages. Pro supports up to ${PRO_PAGE_LIMIT}.`, type: 'warning' })
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
    finally { setIsProcessing(false); setProgress(0) }
  }, [canUse, file, increment, mode, pageLimit])

  return <div className={`pdfmd-tool ${isLight ? 'pdfmd-tool--light' : ''}`}>
    <aside className="pdfmd-sidebar">
      <div className="pdfmd-sidebar__head"><span className="pdfmd-kicker">Private browser conversion</span><h2>PDF to PowerPoint</h2><p>Turn PDF pages into a PPTX without uploading your document.</p><PDFThemeToggle isLight={isLight} onToggle={() => setIsLight((current) => !current)} /></div>
      {!file ? <div className={`pdfmd-dropzone ${isDragging ? 'pdfmd-dropzone--active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void inspectFile(event.dataTransfer.files[0]) }}><strong>Choose a PDF</strong><span>or drop one here</span><small>Up to 50 MB</small><input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} /></div> : <><div className="pdfmd-file"><div><strong>{file.name}</strong><span>{pageCount} pages - {(file.size / 1024 / 1024).toFixed(1)} MB</span></div><button type="button" aria-label="Remove file" onClick={clear}>x</button></div><div className="pdfmd-settings"><label className="pdfmd-select-label">Slide style<select value={mode} onChange={(event) => setMode(event.target.value as ExportMode)}><option value="editable">Editable text slides</option><option value="visual">Visual PDF pages</option></select></label><p className="pdfmd-limit">{isPro ? `Pro: up to ${PRO_PAGE_LIMIT} slides` : `Free: first ${FREE_PAGE_LIMIT} slides. Pro exports up to ${PRO_PAGE_LIMIT}.`}</p></div><button className="pdfmd-primary" type="button" onClick={() => void convert()} disabled={isProcessing}>{isProcessing ? `Creating PPTX ${progress}%` : 'Convert to PowerPoint'}</button>{!isPro && <button className="pdfmd-secondary" type="button" onClick={() => setShowUpgrade(true)}>Unlock larger PDFs</button>}</>}
    </aside>
    <section className="pdfmd-output"><header className="pdfmd-output__bar"><div><span>PowerPoint export</span><small>Choose editable text slides for revision, or visual slides for page fidelity.</small></div></header><div className="pdfmd-empty"><strong>One PDF page becomes one slide.</strong><span>Editable text mode works best with text-first PDFs. Visual mode preserves the original page as a slide image.</span></div></section>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
  </div>
}
