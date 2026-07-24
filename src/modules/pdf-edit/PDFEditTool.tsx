import { useCallback, useEffect, useRef, useState } from 'react'
import { degrees, rgb, PDFDocument, StandardFonts } from 'pdf-lib'
import { usePlan } from '../../hooks/usePlan'
import { useToolLimit } from '../../hooks/useToolLimit'
import UpgradeModal from '../../components/UpgradeModal'
import Toast from '../../components/Toast'
import PDFThemeToggle from '../../components/PDFThemeToggle'
import { validatePDF } from '../../lib/fileValidation'
import { getFriendlyErrorMessage, releaseCanvas } from '../../lib/errorHandler'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import '../pdf-markdown/pdf-markdown.css'
import './pdf-edit.css'

let pdfjsLib: any = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  pdfjsLib = pdfjs
  return pdfjs
}

type Tool = 'select' | 'text' | 'sign' | 'cover'
type TextOverlay = { id: string; type: 'text'; x: number; y: number; text: string; size: number; color: string }
type CoverOverlay = { id: string; type: 'cover'; x: number; y: number; width: number; height: number }
type SignatureOverlay = { id: string; type: 'signature'; x: number; y: number; width: number; height: number; data: string }
type Overlay = TextOverlay | CoverOverlay | SignatureOverlay
type Point = { x: number; y: number }

const FREE_PAGE_LIMIT = 20
const PRO_PAGE_LIMIT = 100

function hexToRgb(hex: string) {
  const value = parseInt(hex.replace('#', ''), 16)
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255)
}

function clamp(value: number) { return Math.max(0, Math.min(100, value)) }

export default function PDFEditTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [overlays, setOverlays] = useState<Record<number, Overlay[]>>({})
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [text, setText] = useState('')
  const [textSize, setTextSize] = useState(18)
  const [textColor, setTextColor] = useState('#172033')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [draftCover, setDraftCover] = useState<{ start: Point; end: Point } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [signatureReady, setSignatureReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const signaturePadRef = useRef<HTMLCanvasElement>(null)
  const isSigningRef = useRef(false)
  const { isPro } = usePlan()
  const { canUse, increment } = useToolLimit('pdf-edit')
  const pageLimit = isPro ? PRO_PAGE_LIMIT : FREE_PAGE_LIMIT
  const currentOverlays = overlays[selectedPage] ?? []

  const renderPreview = useCallback(async () => {
    if (!file || !canvasRef.current) return
    setPreviewLoading(true)
    try {
      const pdfjs = await loadPdfJs()
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
      const page = await pdf.getPage(selectedPage)
      const viewport = page.getViewport({ scale: 1.6, rotation: rotations[selectedPage] ?? 0 })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not display this PDF page.')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvasContext: context, viewport }).promise
    } catch (error) {
      setToast({ message: getFriendlyErrorMessage(error), type: 'error' })
    } finally { setPreviewLoading(false) }
  }, [file, rotations, selectedPage])

  useEffect(() => { void renderPreview() }, [renderPreview])

  const inspectFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return
    const result = await validatePDF(nextFile)
    if (!result.valid) return setToast({ message: result.error ?? 'Choose a valid PDF.', type: 'error' })
    try {
      const pdf = await PDFDocument.load(await nextFile.arrayBuffer(), { ignoreEncryption: false })
      const count = pdf.getPageCount()
      setFile(nextFile); setPageCount(count); setPageOrder(Array.from({ length: Math.min(count, pageLimit) }, (_, index) => index + 1)); setSelectedPage(1); setRotations({}); setOverlays({}); setActiveTool('select')
      setToast(count > pageLimit ? { message: `${isPro ? 'Pro' : 'Free'} edits the first ${pageLimit} pages.`, type: 'warning' } : null)
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
  }, [isPro, pageLimit])

  const clear = useCallback(() => {
    if (canvasRef.current) releaseCanvas(canvasRef.current)
    setFile(null); setPageCount(0); setPageOrder([]); setRotations({}); setOverlays({}); setSelectedPage(1); setToast(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const move = useCallback((direction: -1 | 1) => setPageOrder((current) => {
    const index = current.indexOf(selectedPage); const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current
    const next = [...current]; ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    return next
  }), [selectedPage])

  const removePage = useCallback(() => {
    if (pageOrder.length === 1) return setToast({ message: 'A PDF must keep at least one page.', type: 'error' })
    const next = pageOrder.filter((page) => page !== selectedPage)
    setPageOrder(next); setSelectedPage(next[Math.max(0, pageOrder.indexOf(selectedPage) - 1)])
  }, [pageOrder, selectedPage])

  const rotate = useCallback((amount: number) => setRotations((current) => ({ ...current, [selectedPage]: ((current[selectedPage] ?? 0) + amount + 360) % 360 })), [selectedPage])

  const pointFromEvent = useCallback((event: React.PointerEvent<HTMLDivElement>): Point | null => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: clamp((event.clientX - rect.left) / rect.width * 100), y: clamp((event.clientY - rect.top) / rect.height * 100) }
  }, [])

  const addOverlay = useCallback((overlay: Overlay) => setOverlays((current) => ({ ...current, [selectedPage]: [...(current[selectedPage] ?? []), overlay] })), [selectedPage])

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event)
    if (!point || activeTool === 'select') return
    if (activeTool === 'text') {
      if (!text.trim()) return setToast({ message: 'Enter text before placing it on the page.', type: 'error' })
      addOverlay({ id: crypto.randomUUID(), type: 'text', x: point.x, y: point.y, text: text.trim(), size: textSize, color: textColor })
      setActiveTool('select')
    } else if (activeTool === 'sign') {
      const signature = signaturePadRef.current
      if (!signature || !signatureReady) return setToast({ message: 'Draw your signature before placing it on the page.', type: 'error' })
      addOverlay({ id: crypto.randomUUID(), type: 'signature', x: point.x, y: point.y, width: 28, height: 12, data: signature.toDataURL('image/png') })
      setActiveTool('select')
    } else setDraftCover({ start: point, end: point })
  }, [activeTool, addOverlay, pointFromEvent, signatureReady, text, textColor, textSize])

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draftCover) return
    const point = pointFromEvent(event)
    if (point) setDraftCover({ ...draftCover, end: point })
  }, [draftCover, pointFromEvent])

  const onPointerUp = useCallback(() => {
    if (!draftCover) return
    const x = Math.min(draftCover.start.x, draftCover.end.x); const y = Math.min(draftCover.start.y, draftCover.end.y)
    const width = Math.abs(draftCover.start.x - draftCover.end.x); const height = Math.abs(draftCover.start.y - draftCover.end.y)
    if (width > 1 && height > 1) addOverlay({ id: crypto.randomUUID(), type: 'cover', x, y, width, height })
    setDraftCover(null); setActiveTool('select')
  }, [addOverlay, draftCover])

  const deleteOverlay = useCallback((id: string) => setOverlays((current) => ({ ...current, [selectedPage]: (current[selectedPage] ?? []).filter((item) => item.id !== id) })), [selectedPage])

  const signaturePoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signaturePadRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }
  }, [])

  const startSignature = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = signaturePoint(event); const context = signaturePadRef.current?.getContext('2d')
    if (!point || !context) return
    isSigningRef.current = true; event.currentTarget.setPointerCapture(event.pointerId)
    context.beginPath(); context.moveTo(point.x, point.y)
  }, [signaturePoint])

  const drawSignature = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSigningRef.current) return
    const point = signaturePoint(event); const context = signaturePadRef.current?.getContext('2d')
    if (!point || !context) return
    context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = 5; context.strokeStyle = '#0a0f18'
    context.lineTo(point.x, point.y); context.stroke(); setSignatureReady(true)
  }, [signaturePoint])

  const endSignature = useCallback(() => { isSigningRef.current = false }, [])

  const clearSignature = useCallback(() => {
    const canvas = signaturePadRef.current; const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureReady(false)
  }, [])

  const exportPdf = useCallback(async () => {
    if (!file) return
    if (!canUse) return setShowUpgrade(true)
    setIsProcessing(true); setToast(null)
    try {
      if (!await increment()) return setShowUpgrade(true)
      const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false })
      const output = await PDFDocument.create(); const font = await output.embedFont(StandardFonts.Helvetica)
      const pages = await output.copyPages(source, pageOrder.map((page) => page - 1))
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index]
        output.addPage(page)
        const originalPage = pageOrder[index]
        if (rotations[originalPage]) page.setRotation(degrees(rotations[originalPage]))
        const { width, height } = page.getSize()
        for (const overlay of overlays[originalPage] ?? []) {
          if (overlay.type === 'text') page.drawText(overlay.text, { x: width * overlay.x / 100, y: height * (1 - overlay.y / 100) - overlay.size, size: overlay.size, maxWidth: width * (1 - overlay.x / 100), font, color: hexToRgb(overlay.color) })
          else if (overlay.type === 'cover') page.drawRectangle({ x: width * overlay.x / 100, y: height * (1 - overlay.y / 100) - height * overlay.height / 100, width: width * overlay.width / 100, height: height * overlay.height / 100, color: rgb(0, 0, 0) })
          else {
            const signature = await output.embedPng(await (await fetch(overlay.data)).arrayBuffer())
            page.drawImage(signature, { x: width * overlay.x / 100, y: height * (1 - overlay.y / 100) - height * overlay.height / 100, width: width * overlay.width / 100, height: height * overlay.height / 100 })
          }
        }
      }
      const outputBytes = new Uint8Array(await output.save())
      const url = URL.createObjectURL(new Blob([outputBytes.buffer], { type: 'application/pdf' }))
      const link = document.createElement('a'); link.href = url; link.download = `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (error) { setToast({ message: getFriendlyErrorMessage(error), type: 'error' }) }
    finally { setIsProcessing(false) }
  }, [canUse, file, increment, overlays, pageOrder, rotations])

  return <div className={`pdfedit-tool ${isLight ? 'pdfedit-tool--light' : ''}`}>
    <aside className="pdfmd-sidebar pdfedit-sidebar">
      <div className="pdfmd-sidebar__head"><span className="pdfmd-kicker">Private browser editing</span><h2>Edit PDF</h2><p>Edit against the rendered PDF page, then export a new file locally.</p><PDFThemeToggle isLight={isLight} onToggle={() => setIsLight((current) => !current)} /></div>
      {!file ? <div className={`pdfmd-dropzone ${isDragging ? 'pdfmd-dropzone--active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void inspectFile(event.dataTransfer.files[0]) }}><strong>Choose a PDF</strong><span>or drop one here</span><small>Up to 50 MB</small><input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} /></div> : <><div className="pdfmd-file"><div><strong>{file.name}</strong><span>{pageCount} pages - editing {pageOrder.length}</span></div><button type="button" aria-label="Remove file" onClick={clear}>x</button></div><p className="pdfmd-limit">{isPro ? `Pro: up to ${PRO_PAGE_LIMIT} pages` : `Free: first ${FREE_PAGE_LIMIT} pages. Pro edits up to ${PRO_PAGE_LIMIT}.`}</p><button className="pdfmd-primary" type="button" onClick={() => void exportPdf()} disabled={isProcessing}>{isProcessing ? 'Exporting PDF' : 'Export edited PDF'}</button>{!isPro && <button className="pdfmd-secondary" type="button" onClick={() => setShowUpgrade(true)}>Unlock larger PDFs</button>}</>}
    </aside>
    <section className="pdfedit-workspace">
      {!file ? <div className="pdfmd-empty"><strong>Make visual PDF changes.</strong><span>Upload a PDF to place text and covers directly on the rendered page.</span></div> : <>
        <div className="pdfedit-toolbar"><label>Page<select value={selectedPage} onChange={(event) => setSelectedPage(Number(event.target.value))}>{pageOrder.map((page, index) => <option value={page} key={page}>Page {page} (position {index + 1})</option>)}</select></label><div className="pdfedit-actions"><button type="button" onClick={() => move(-1)}>Move left</button><button type="button" onClick={() => move(1)}>Move right</button><button type="button" onClick={() => rotate(-90)}>Rotate left</button><button type="button" onClick={() => rotate(90)}>Rotate right</button><button type="button" className="pdfedit-danger" onClick={removePage}>Remove page</button></div></div>
        <div className="pdfedit-editor"><aside className="pdfedit-tools"><div className="pdfedit-tool-tabs"><button type="button" className={activeTool === 'select' ? 'is-active' : ''} onClick={() => setActiveTool('select')}>Select</button><button type="button" className={activeTool === 'text' ? 'is-active' : ''} onClick={() => setActiveTool('text')}>Add text</button><button type="button" className={activeTool === 'sign' ? 'is-active' : ''} onClick={() => setActiveTool('sign')}>Sign PDF</button><button type="button" className={activeTool === 'cover' ? 'is-active' : ''} onClick={() => setActiveTool('cover')}>Cover block</button></div>{activeTool === 'text' && <div className="pdfedit-control"><label>Text<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Type text, then click the page" /></label><label>Size<input type="number" min="8" max="72" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></label><label>Color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label><p>Click a spot on the PDF page to place this text.</p></div>}{activeTool === 'sign' && <div className="pdfedit-control"><label>Draw signature<canvas ref={signaturePadRef} className="pdfedit-signature-pad" width="560" height="190" onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={endSignature} onPointerLeave={endSignature} /></label><button type="button" className="pdfedit-clear-signature" onClick={clearSignature}>Clear signature</button><p>Draw above, then click the PDF page to place it.</p></div>}{activeTool === 'cover' && <div className="pdfedit-control"><p>Drag on the PDF page to add a black cover block.</p><p className="pdfedit-warning">A cover block only hides content visually. It is not secure redaction.</p></div>}<div className="pdfedit-layer-list"><strong>Page layers</strong>{currentOverlays.length ? currentOverlays.map((overlay, index) => <div key={overlay.id}><span>{overlay.type === 'text' ? `Text ${index + 1}` : overlay.type === 'signature' ? `Signature ${index + 1}` : `Cover ${index + 1}`}</span><button type="button" onClick={() => deleteOverlay(overlay.id)} aria-label={`Delete layer ${index + 1}`}>x</button></div>) : <small>No added layers</small>}</div></aside><div className={`pdfedit-stage-wrap tool-${activeTool}`}><div ref={stageRef} className="pdfedit-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}><canvas ref={canvasRef} />{previewLoading && <div className="pdfedit-loading">Rendering page</div>}{currentOverlays.map((overlay) => overlay.type === 'text' ? <div key={overlay.id} className="pdfedit-overlay pdfedit-overlay--text" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, fontSize: `${overlay.size}px`, color: overlay.color }}>{overlay.text}</div> : overlay.type === 'signature' ? <img key={overlay.id} className="pdfedit-overlay pdfedit-overlay--signature" src={overlay.data} alt="Signature" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%` }} /> : <div key={overlay.id} className="pdfedit-overlay pdfedit-overlay--cover" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%` }} />)}{draftCover && <div className="pdfedit-overlay pdfedit-overlay--cover pdfedit-overlay--draft" style={{ left: `${Math.min(draftCover.start.x, draftCover.end.x)}%`, top: `${Math.min(draftCover.start.y, draftCover.end.y)}%`, width: `${Math.abs(draftCover.start.x - draftCover.end.x)}%`, height: `${Math.abs(draftCover.start.y - draftCover.end.y)}%` }} />}</div></div></div>
      </>}
    </section>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
  </div>
}
