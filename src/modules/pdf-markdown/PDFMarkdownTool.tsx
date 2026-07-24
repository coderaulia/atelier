import { useCallback, useRef, useState } from 'react'
import { usePlan } from '../../hooks/usePlan'
import { useToolLimit } from '../../hooks/useToolLimit'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, releaseCanvas } from '../../lib/errorHandler'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './pdf-markdown.css'

let pdfjsLib: any = null
let tesseractLib: any = null

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  pdfjsLib = pdfjs
  return pdfjs
}

async function loadTesseract() {
  if (tesseractLib) return tesseractLib
  tesseractLib = await import('tesseract.js')
  return tesseractLib
}

type Language = 'eng' | 'ind'
type TextItem = { str: string; transform: number[]; height?: number }
type TextLine = { text: string; size: number }

const FREE_PAGE_LIMIT = 10
const PRO_PAGE_LIMIT = 100

function toMarkdownLine(line: TextLine, averageSize: number): string {
  const text = line.text.trim()
  if (!text) return ''
  if (/^[*-]\s+/.test(text)) return `- ${text.replace(/^[*-]\s+/, '')}`
  if (/^\d+[.)]\s+/.test(text)) return text
  if (text.length < 110 && line.size >= averageSize * 1.35) return `## ${text}`
  return text
}

function textContentToMarkdown(items: TextItem[]): string {
  const positioned = items
    .filter((item) => item.str?.trim())
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
      size: Math.abs(item.transform?.[0] ?? item.height ?? 12),
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x)

  const lines: Array<TextLine & { y: number }> = []
  for (const item of positioned) {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) < 3)
    if (line) {
      line.text += `${line.text.endsWith('-') ? '' : ' '}${item.text}`
      line.size = Math.max(line.size, item.size)
    } else {
      lines.push({ text: item.text, size: item.size, y: item.y })
    }
  }

  const averageSize = lines.reduce((sum, line) => sum + line.size, 0) / Math.max(lines.length, 1)
  return lines.map((line) => toMarkdownLine(line, averageSize)).filter(Boolean).join('\n\n')
}

function downloadMarkdown(name: string, markdown: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name.replace(/\.pdf$/i, '')}.md`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function PDFMarkdownTool() {
  const [file, setFile] = useState<File | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [useOcr, setUseOcr] = useState(false)
  const [language, setLanguage] = useState<Language>('eng')
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isPro } = usePlan()
  const { canUse, increment } = useToolLimit('pdf-markdown')
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT

  const inspectFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const result = await validatePDF(nextFile)
    if (!result.valid) {
      setToast({ message: result.error ?? 'Choose a valid PDF.', type: 'error' })
      return
    }
    try {
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await nextFile.arrayBuffer() }).promise
      setFile(nextFile)
      setPageCount(pdf.numPages)
      setMarkdown('')
      setToast(pdf.numPages > pageLimit
        ? { message: `${isPro ? 'Pro' : 'Free'} converts the first ${pageLimit} pages of this file.`, type: 'warning' }
        : null)
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    }
  }, [isPro, pageLimit])

  const clear = useCallback(() => {
    setFile(null)
    setPageCount(0)
    setMarkdown('')
    setProgress(0)
    setToast(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const extract = useCallback(async () => {
    if (!file) return
    if (!canUse || (useOcr && !isPro)) {
      setShowUpgrade(true)
      return
    }
    setIsProcessing(true)
    setProgress(0)
    setToast(null)
    try {
      const permitted = await increment()
      if (!permitted) {
        setShowUpgrade(true)
        return
      }
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
      const maxPages = Math.min(pdf.numPages, pageLimit)
      let worker: any = null
      const output: string[] = [`# ${file.name.replace(/\.pdf$/i, '')}`]
      if (useOcr) {
        const tesseract = await loadTesseract()
        worker = await tesseract.createWorker(language, 1)
      }
      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        let pageMarkdown = textContentToMarkdown(content.items as TextItem[])
        if (useOcr && !pageMarkdown) {
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Could not prepare this PDF page for OCR.')
          await page.render({ canvasContext: context, viewport }).promise
          const result = await worker.recognize(canvas)
          pageMarkdown = result.data.text.trim()
          releaseCanvas(canvas)
        }
        output.push(`## Page ${pageNumber}`, pageMarkdown || '_No selectable text found on this page._')
        setProgress(Math.round((pageNumber / maxPages) * 100))
      }
      await worker?.terminate()
      setMarkdown(output.join('\n\n'))
      if (pdf.numPages > maxPages) {
        setToast({ message: `Converted the first ${maxPages} pages. Upgrade for up to ${PRO_PAGE_LIMIT} pages.`, type: 'warning' })
      }
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }, [canUse, file, increment, isPro, language, pageLimit, useOcr])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setToast({ message: 'Markdown copied to clipboard.', type: 'warning' })
    } catch {
      setToast({ message: 'Copy was blocked. Select the text and copy it manually.', type: 'error' })
    }
  }, [markdown])

  return (
    <div className="pdfmd-tool">
      <aside className="pdfmd-sidebar">
        <div className="pdfmd-sidebar__head">
          <span className="pdfmd-kicker">Private browser conversion</span>
          <h2>PDF to Markdown</h2>
          <p>Extract readable text without uploading the document.</p>
        </div>
        {!file ? (
          <div className={`pdfmd-dropzone ${isDragging ? 'pdfmd-dropzone--active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void inspectFile(event.dataTransfer.files[0]) }}>
            <strong>Choose a PDF</strong><span>or drop one here</span><small>Up to 50 MB</small>
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} />
          </div>
        ) : (
          <>
            <div className="pdfmd-file"><div><strong>{file.name}</strong><span>{pageCount} pages - {(file.size / 1024 / 1024).toFixed(1)} MB</span></div><button type="button" aria-label="Remove file" onClick={clear}>x</button></div>
            <div className="pdfmd-settings">
              <label className="pdfmd-toggle"><input type="checkbox" checked={useOcr} onChange={(event) => setUseOcr(event.target.checked)} /><span>OCR scanned pages <b>Pro</b></span></label>
              {useOcr && <label className="pdfmd-select-label">OCR language<select value={language} onChange={(event) => setLanguage(event.target.value as Language)} disabled={!isPro}><option value="eng">English</option><option value="ind">Indonesian</option></select></label>}
              <p className="pdfmd-limit">{isPro ? `Pro: up to ${PRO_PAGE_LIMIT} pages` : `Free: first ${FREE_PAGE_LIMIT} pages. Pro unlocks OCR and ${PRO_PAGE_LIMIT} pages.`}</p>
            </div>
            <button className="pdfmd-primary" type="button" onClick={() => void extract()} disabled={isProcessing}>{isProcessing ? `Extracting ${progress}%` : 'Convert to Markdown'}</button>
            {!isPro && <button className="pdfmd-secondary" type="button" onClick={() => setShowUpgrade(true)}>Unlock OCR and larger PDFs</button>}
          </>
        )}
      </aside>
      <section className="pdfmd-output">
        <header className="pdfmd-output__bar"><div><span>Markdown preview</span>{markdown && <small>{markdown.length.toLocaleString()} characters</small>}</div>{markdown && <div className="pdfmd-output__actions"><button type="button" onClick={() => void copy()}>Copy</button><button type="button" className="pdfmd-download" onClick={() => file && downloadMarkdown(file.name, markdown)}>Download .md</button></div>}</header>
        {markdown ? <textarea className="pdfmd-editor" value={markdown} onChange={(event) => setMarkdown(event.target.value)} aria-label="Markdown output" /> : <div className="pdfmd-empty"><strong>Your Markdown will appear here.</strong><span>Selectable PDF text is converted locally. Turn on Pro OCR for scanned pages.</span></div>}
      </section>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
