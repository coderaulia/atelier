import { useCallback, useRef, useState } from 'react'
import { degrees, rgb, PDFDocument, StandardFonts } from 'pdf-lib'
import { usePlan } from '../../hooks/usePlan'
import { useToolLimit } from '../../hooks/useToolLimit'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage } from '../../lib/errorHandler'
import '../pdf-markdown/pdf-markdown.css'
import './pdf-edit.css'

type OverlayTarget = 'selected' | 'all'
const FREE_PAGE_LIMIT = 20
const PRO_PAGE_LIMIT = 100

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value = parseInt(normalized, 16)
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255)
}

export default function PDFEditTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [text, setText] = useState('')
  const [textSize, setTextSize] = useState(18)
  const [textColor, setTextColor] = useState('#172033')
  const [textX, setTextX] = useState(10)
  const [textY, setTextY] = useState(10)
  const [textTarget, setTextTarget] = useState<OverlayTarget>('selected')
  const [redactX, setRedactX] = useState(10)
  const [redactY, setRedactY] = useState(10)
  const [redactWidth, setRedactWidth] = useState(30)
  const [redactHeight, setRedactHeight] = useState(8)
  const [redactTarget, setRedactTarget] = useState<OverlayTarget>('selected')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isPro } = usePlan()
  const { canUse, increment } = useToolLimit('pdf-edit')
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT

  const inspectFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const result = await validatePDF(nextFile)
    if (!result.valid) return setToast({ message: result.error ?? 'Choose a valid PDF.', type: 'error' })
    try {
      const pdf = await PDFDocument.load(await nextFile.arrayBuffer(), { ignoreEncryption: false })
      const count = pdf.getPageCount()
      setFile(nextFile); setPageCount(count); setPageOrder(Array.from({ length: Math.min(count, pageLimit) }, (_, index) => index + 1)); setSelectedPage(1); setRotations({})
      setToast(count > pageLimit ? { message: `${isPro ? 'Pro' : 'Free'} edits the first ${pageLimit} pages.`, type: 'warning' } : null)
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
  }, [isPro, pageLimit])

  const clear = useCallback(() => {
    setFile(null); setPageCount(0); setPageOrder([]); setRotations({}); setSelectedPage(1); setToast(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const move = useCallback((direction: -1 | 1) => {
    setPageOrder((current) => {
      const index = current.indexOf(selectedPage)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }, [selectedPage])

  const removePage = useCallback(() => {
    if (pageOrder.length === 1) return setToast({ message: 'A PDF must keep at least one page.', type: 'error' })
    const next = pageOrder.filter((page) => page !== selectedPage)
    setPageOrder(next); setSelectedPage(next[Math.max(0, pageOrder.indexOf(selectedPage) - 1)])
  }, [pageOrder, selectedPage])

  const rotate = useCallback((amount: number) => setRotations((current) => ({ ...current, [selectedPage]: ((current[selectedPage] ?? 0) + amount + 360) % 360 })), [selectedPage])

  const exportPdf = useCallback(async () => {
    if (!file) return
    if (!canUse) return setShowUpgrade(true)
    setIsProcessing(true); setToast(null)
    try {
      if (!await increment()) return setShowUpgrade(true)
      const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false })
      const output = await PDFDocument.create()
      const font = await output.embedFont(StandardFonts.Helvetica)
      const pages = await output.copyPages(source, pageOrder.map((page) => page - 1))
      pages.forEach((page, index) => {
        const originalPage = pageOrder[index]
        const targetText = textTarget === 'all' || originalPage === selectedPage
        const targetRedaction = redactTarget === 'all' || originalPage === selectedPage
        if (rotations[originalPage]) page.setRotation(degrees(rotations[originalPage]))
        const { width, height } = page.getSize()
        if (text.trim() && targetText) page.drawText(text.trim(), { x: width * textX / 100, y: height * (1 - textY / 100) - textSize, size: textSize, maxWidth: width * (1 - textX / 100), font, color: hexToRgb(textColor) })
        if (targetRedaction) page.drawRectangle({ x: width * redactX / 100, y: height * (1 - redactY / 100) - height * redactHeight / 100, width: width * redactWidth / 100, height: height * redactHeight / 100, color: rgb(0, 0, 0) })
      })
      const bytes = await output.save()
      const outputBytes = new Uint8Array(bytes)
      const blob = new Blob([outputBytes.buffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
    finally { setIsProcessing(false) }
  }, [canUse, file, increment, pageOrder, redactHeight, redactTarget, redactWidth, redactX, redactY, rotations, selectedPage, text, textColor, textSize, textTarget, textX, textY])

  return <div className="pdfedit-tool">
    <aside className="pdfmd-sidebar pdfedit-sidebar">
      <div className="pdfmd-sidebar__head"><span className="pdfmd-kicker">Private browser editing</span><h2>Edit PDF</h2><p>Organize pages, add text, and apply black cover blocks locally.</p></div>
      {!file ? <div className={`pdfmd-dropzone ${isDragging ? 'pdfmd-dropzone--active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void inspectFile(event.dataTransfer.files[0]) }}><strong>Choose a PDF</strong><span>or drop one here</span><small>Up to 50 MB</small><input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} /></div> : <><div className="pdfmd-file"><div><strong>{file.name}</strong><span>{pageCount} pages - editing {pageOrder.length}</span></div><button type="button" aria-label="Remove file" onClick={clear}>x</button></div><p className="pdfmd-limit">{isPro ? `Pro: up to ${PRO_PAGE_LIMIT} pages` : `Free: first ${FREE_PAGE_LIMIT} pages. Pro edits up to ${PRO_PAGE_LIMIT}.`}</p><button className="pdfmd-primary" type="button" onClick={() => void exportPdf()} disabled={isProcessing}>{isProcessing ? 'Exporting PDF' : 'Export edited PDF'}</button>{!isPro && <button className="pdfmd-secondary" type="button" onClick={() => setShowUpgrade(true)}>Unlock larger PDFs</button>}</>}
    </aside>
    <section className="pdfedit-workspace">
      {!file ? <div className="pdfmd-empty"><strong>Make practical PDF changes.</strong><span>Use the dedicated organizer for visual page thumbnails; this editor focuses on page actions and overlays.</span></div> : <>
        <div className="pdfedit-pages"><label>Pages<select value={selectedPage} onChange={(event) => setSelectedPage(Number(event.target.value))}>{pageOrder.map((page, index) => <option value={page} key={page}>Page {page} (position {index + 1})</option>)}</select></label><div className="pdfedit-page-actions"><button type="button" onClick={() => move(-1)}>Move left</button><button type="button" onClick={() => move(1)}>Move right</button><button type="button" onClick={() => rotate(-90)}>Rotate left</button><button type="button" onClick={() => rotate(90)}>Rotate right</button><button type="button" className="pdfedit-danger" onClick={removePage}>Remove page</button></div></div>
        <div className="pdfedit-panels"><section><h3>Add text overlay</h3><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Text to add" /><div className="pdfedit-grid"><label>Size<input type="number" min="8" max="72" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></label><label>Color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label><label>X position %<input type="number" min="0" max="95" value={textX} onChange={(event) => setTextX(Number(event.target.value))} /></label><label>Y position %<input type="number" min="0" max="95" value={textY} onChange={(event) => setTextY(Number(event.target.value))} /></label></div><label>Apply to<select value={textTarget} onChange={(event) => setTextTarget(event.target.value as OverlayTarget)}><option value="selected">Selected page</option><option value="all">All pages</option></select></label></section><section><h3>Black cover block</h3><p>Cover blocks hide content visually but do not securely remove underlying PDF data. Do not use them as legal or security redaction.</p><div className="pdfedit-grid"><label>X position %<input type="number" min="0" max="95" value={redactX} onChange={(event) => setRedactX(Number(event.target.value))} /></label><label>Y position %<input type="number" min="0" max="95" value={redactY} onChange={(event) => setRedactY(Number(event.target.value))} /></label><label>Width %<input type="number" min="1" max="100" value={redactWidth} onChange={(event) => setRedactWidth(Number(event.target.value))} /></label><label>Height %<input type="number" min="1" max="100" value={redactHeight} onChange={(event) => setRedactHeight(Number(event.target.value))} /></label></div><label>Apply to<select value={redactTarget} onChange={(event) => setRedactTarget(event.target.value as OverlayTarget)}><option value="selected">Selected page</option><option value="all">All pages</option></select></label></section></div>
      </>}
    </section>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
  </div>
}
