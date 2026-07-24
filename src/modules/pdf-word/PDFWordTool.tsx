import { useCallback, useRef, useState } from 'react'
import { usePlan } from '../../hooks/usePlan'
import { useToolLimit } from '../../hooks/useToolLimit'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage } from '../../lib/errorHandler'
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

type TextItem = { str: string; transform: number[]; height?: number }
type Line = { text: string; size: number; y: number }
const FREE_PAGE_LIMIT = 10
const PRO_PAGE_LIMIT = 100

function extractLines(items: TextItem[]): Line[] {
  const positioned = items.filter((item) => item.str?.trim()).map((item) => ({ text: item.str.trim(), x: item.transform?.[4] ?? 0, y: item.transform?.[5] ?? 0, size: Math.abs(item.transform?.[0] ?? item.height ?? 12) })).sort((a, b) => b.y - a.y || a.x - b.x)
  const lines: Line[] = []
  for (const item of positioned) {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) < 3)
    if (line) {
      line.text += `${line.text.endsWith('-') ? '' : ' '}${item.text}`
      line.size = Math.max(line.size, item.size)
    } else lines.push({ text: item.text, size: item.size, y: item.y })
  }
  return lines
}

export default function PDFWordTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isPro } = usePlan()
  const { canUse, increment } = useToolLimit('pdf-word')
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT

  const inspectFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const result = await validatePDF(nextFile)
    if (!result.valid) return setToast({ message: result.error ?? 'Choose a valid PDF.', type: 'error' })
    try {
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await nextFile.arrayBuffer() }).promise
      setFile(nextFile)
      setPageCount(pdf.numPages)
      setToast(pdf.numPages > pageLimit ? { message: `${isPro ? 'Pro' : 'Free'} exports the first ${pageLimit} pages.`, type: 'warning' } : null)
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    }
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
      const [pdfjs, docx] = await Promise.all([loadPdfJs(), import('docx')])
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
      const maxPages = Math.min(pdf.numPages, pageLimit)
      const children: any[] = [new docx.Paragraph({ text: file.name.replace(/\.pdf$/i, ''), heading: docx.HeadingLevel.TITLE })]
      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        const lines = extractLines(content.items as TextItem[])
        const averageSize = lines.reduce((sum, line) => sum + line.size, 0) / Math.max(lines.length, 1)
        children.push(new docx.Paragraph({ text: `Page ${pageNumber}`, heading: docx.HeadingLevel.HEADING_1 }))
        if (!lines.length) children.push(new docx.Paragraph({ text: 'No selectable text found on this page.' }))
        for (const line of lines) {
          const isHeading = line.text.length < 110 && line.size >= averageSize * 1.35
          const isBullet = /^[*-]\s+/.test(line.text)
          children.push(new docx.Paragraph({ text: line.text.replace(/^[*-]\s+/, ''), heading: isHeading ? docx.HeadingLevel.HEADING_2 : undefined, bullet: isBullet ? { level: 0 } : undefined }))
        }
        setProgress(Math.round((pageNumber / maxPages) * 100))
      }
      const wordDocument = new docx.Document({ sections: [{ children }] })
      const blob = await docx.Packer.toBlob(wordDocument)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = `${file.name.replace(/\.pdf$/i, '')}.docx`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)
      if (pdf.numPages > maxPages) setToast({ message: `Exported the first ${maxPages} pages. Pro supports up to ${PRO_PAGE_LIMIT}.`, type: 'warning' })
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setIsProcessing(false); setProgress(0)
    }
  }, [canUse, file, increment, pageLimit])

  return <div className="pdfmd-tool">
    <aside className="pdfmd-sidebar">
      <div className="pdfmd-sidebar__head"><span className="pdfmd-kicker">Private browser conversion</span><h2>PDF to Word</h2><p>Create an editable DOCX from PDF text without uploading your document.</p></div>
      {!file ? <div className={`pdfmd-dropzone ${isDragging ? 'pdfmd-dropzone--active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void inspectFile(event.dataTransfer.files[0]) }}><strong>Choose a PDF</strong><span>or drop one here</span><small>Up to 50 MB</small><input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} /></div> : <><div className="pdfmd-file"><div><strong>{file.name}</strong><span>{pageCount} pages - {(file.size / 1024 / 1024).toFixed(1)} MB</span></div><button type="button" aria-label="Remove file" onClick={clear}>x</button></div><div className="pdfmd-settings"><p className="pdfmd-limit">{isPro ? `Pro: up to ${PRO_PAGE_LIMIT} pages` : `Free: first ${FREE_PAGE_LIMIT} pages. Pro exports up to ${PRO_PAGE_LIMIT}.`}</p></div><button className="pdfmd-primary" type="button" onClick={() => void convert()} disabled={isProcessing}>{isProcessing ? `Creating DOCX ${progress}%` : 'Convert to Word'}</button>{!isPro && <button className="pdfmd-secondary" type="button" onClick={() => setShowUpgrade(true)}>Unlock larger PDFs</button>}</>}
    </aside>
    <section className="pdfmd-output"><header className="pdfmd-output__bar"><div><span>Editable Word export</span><small>Headings, paragraphs, and simple lists are preserved where possible.</small></div></header><div className="pdfmd-empty"><strong>Download an editable DOCX.</strong><span>Text-first PDFs convert best. Complex visual layouts and tables may need cleanup in Word.</span></div></section>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
  </div>
}
