import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToolLimit } from '../../hooks/useToolLimit';
import { usePlan } from '../../hooks/usePlan';
import UpgradeModal from '../../components/UpgradeModal';
import Toast from '../../components/Toast';
import { validatePDF, warnPDFPageLimit } from '../../lib/fileValidation';
import { getFriendlyErrorMessage, isLowPowerDevice, releaseCanvas, canvasToBlob } from '../../lib/errorHandler';

// Lazy-loaded pdfjs-dist
let pdfjsLib: any = null;
let pdfjsLoaded = false;

async function loadPdfJs() {
  if (pdfjsLoaded) return pdfjsLib;
  
  const pdfjs = await import('pdfjs-dist');
  // Set worker from CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  pdfjsLib = pdfjs;
  pdfjsLoaded = true;
  return pdfjs;
}

// Lazy-loaded JSZip
let JSZip: any = null;
let jszipLoaded = false;

async function loadJSZip() {
  if (jszipLoaded) return JSZip;
  const module = await import('jszip');
  JSZip = module.default;
  jszipLoaded = true;
  return JSZip;
}

interface PageRender {
  pageNum: number;
  canvas: HTMLCanvasElement;
  blob: Blob | null;
}

type OutputFormat = 'png' | 'jpg';

const FREE_PAGE_LIMIT = 3;

export default function PDFToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [pageWarning, setPageWarning] = useState<string | null>(null);
  const [mobileWarning, setMobileWarning] = useState(isLowPowerDevice());
  const [pages, setPages] = useState<PageRender[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [zoom, setZoom] = useState(0.3);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { canUse, used, limit, increment } = useToolLimit('pdf-to-image');
  const { isPro } = usePlan();

  const totalPages = pages.length;
  const effectiveLimit = isPro ? Infinity : FREE_PAGE_LIMIT;
  const canSelectMore = selectedPages.size < effectiveLimit;

  // ---------- File handling ----------
  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    const result = await validatePDF(selectedFile);
    if (!result.valid) {
      setToast({ message: result.error!, type: 'error' });
      return;
    }
    setFile(selectedFile);
    setPages([]);
    setSelectedPages(new Set());
    setPageWarning(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClear = useCallback(() => {
    // Memory guard: release all page canvases
    pages.forEach((p) => releaseCanvas(p.canvas));
    setPages([]);
    setFile(null);
    setSelectedPages(new Set());
    setPageWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [pages]);

  // ---------- PDF rendering ----------
  const renderPDF = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setToast(null);
    setProgress(0);

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const rendered: PageRender[] = [];

      // Memory guard: process one page at a time, release immediately after readback
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          rendered.push({
            pageNum: i,
            canvas,
            blob: null,
          });

          setProgress(Math.round((i / numPages) * 100));
        } catch (pageErr) {
          setToast({
            message: getFriendlyErrorMessage(pageErr, i),
            type: 'error',
          });
          break;
        }
      }

      setPages(rendered);
      setPageWarning(warnPDFPageLimit(numPages));
      // Auto-select first page (or up to limit for free)
      const autoSelect = new Set<number>();
      for (let i = 1; i <= Math.min(numPages, effectiveLimit); i++) {
        autoSelect.add(i);
      }
      setSelectedPages(autoSelect);
    } catch (err: any) {
      setToast({
        message: getFriendlyErrorMessage(err),
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [file, effectiveLimit]);

  // Auto-render when file changes
  useEffect(() => {
    if (file) {
      renderPDF();
    }
  }, [file, renderPDF]);

  // ---------- Page selection ----------
  const togglePage = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        if (!isPro && next.size >= FREE_PAGE_LIMIT) {
          setShowUpgrade(true);
          return prev;
        }
        next.add(pageNum);
      }
      return next;
    });
  }, [isPro]);

  // ---------- Download single ----------
  const downloadSingle = useCallback(async () => {
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    if (selectedPages.size === 0) {
      setToast({ message: 'No pages selected', type: 'error' });
      return;
    }

    setIsProcessing(true);

    try {
      const ok = await increment();
      if (!ok) {
        setShowUpgrade(true);
        setIsProcessing(false);
        return;
      }

      const pageNum = Array.from(selectedPages)[0];
      const pageRender = pages.find((p) => p.pageNum === pageNum);
      if (!pageRender) return;

      const blob = await canvasToBlob(pageRender.canvas, format === 'png' ? 'image/png' : 'image/jpeg', quality);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file!.name.replace('.pdf', '')}-page-${pageNum}.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err: any) {
      setToast({ message: getFriendlyErrorMessage(err), type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [canUse, increment, selectedPages, pages, format, quality, file]);

  // ---------- Download bulk ZIP (Pro) ----------
  const downloadBulkZip = useCallback(async () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    if (selectedPages.size === 0) {
      setToast({ message: 'No pages selected', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const ok = await increment();
      if (!ok) {
        setShowUpgrade(true);
        setIsProcessing(false);
        return;
      }

      const zip = await loadJSZip();
      const zipFile = new zip();

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      let done = 0;

      for (const pageNum of sortedPages) {
        const pageRender = pages.find((p) => p.pageNum === pageNum);
        if (!pageRender) continue;

        // Memory guard: read one page into blob, release canvas immediately after
        const blob = await canvasToBlob(pageRender.canvas, format === 'png' ? 'image/png' : 'image/jpeg', quality);
        releaseCanvas(pageRender.canvas);

        const filename = `page-${String(pageNum).padStart(3, '0')}.${format}`;
        zipFile.file(filename, blob);

        done++;
        setProgress(Math.round((done / sortedPages.length) * 100));
      }

      const zipBlob = await zipFile.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file!.name.replace('.pdf', '')}-images.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err: any) {
      setToast({
        message: getFriendlyErrorMessage(err),
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isPro, canUse, increment, selectedPages, pages, format, quality, file]);

  return (
    <div className="pdf2img-tool">
      {/* ===== Sidebar ===== */}
      <div className="pdf2img-sidebar">
        <div className="pdf2img-sidebar__head">
          <div className="pdf2img-sidebar__title-row">
            <span className="pdf2img-sidebar__title">PDF → Image</span>
          </div>

          {/* Privacy badge */}
          <div style={{ marginTop: 10 }}>
            <div className="pdf2img-privacy">
              <span className="pdf2img-privacy__icon">🔒</span>
              <span>Files never leave your browser</span>
            </div>
          </div>

          {/* Usage bar */}
          <div style={{ marginTop: 12 }}>
            <div className="pdf2img-usage">
              <span className="pdf2img-usage__label">
                Conversions: {used}/{limit} today
              </span>
              <div className="pdf2img-usage__track">
                <div
                  className="pdf2img-usage__fill"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pdf2img-sidebar__body">
          {/* Upload zone */}
          {!file && (
            <div
              className={`pdf2img-upload ${isDragging ? 'pdf2img-upload--dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="pdf2img-upload__icon">📄</div>
              <div className="pdf2img-upload__text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div className="pdf2img-upload__hint">PDF files only</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* File info */}
          {file && (
            <div className="pdf2img-fileinfo">
              <div className="pdf2img-fileinfo__icon">📄</div>
              <div className="pdf2img-fileinfo__details">
                <div className="pdf2img-fileinfo__name">{file.name}</div>
                <div className="pdf2img-fileinfo__meta">
                  {(file.size / 1024).toFixed(1)} KB · {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                </div>
              </div>
              <button className="pdf2img-fileinfo__clear" onClick={handleClear}>
                ×
              </button>
            </div>
          )}

          {/* Settings */}
          {file && pages.length > 0 && (
            <>
              {/* Format */}
              <div className="pdf2img-settings">
                <div className="pdf2img-settings__label">Output Format</div>
                <div className="pdf2img-format-row">
                  <button
                    className={`pdf2img-format-btn ${format === 'png' ? 'pdf2img-format-btn--active' : ''}`}
                    onClick={() => setFormat('png')}
                  >
                    PNG
                  </button>
                  <button
                    className={`pdf2img-format-btn ${format === 'jpg' ? 'pdf2img-format-btn--active' : ''}`}
                    onClick={() => setFormat('jpg')}
                  >
                    JPG
                  </button>
                </div>
              </div>

              {/* Quality (JPG only) */}
              {format === 'jpg' && (
                <div className="pdf2img-settings">
                  <div className="pdf2img-quality-row">
                    <div className="pdf2img-quality-row__label">
                      <span>Quality</span>
                      <span>{Math.round(quality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* Page selection */}
              <div className="pdf2img-page-range">
                <div className="pdf2img-page-range__label">
                  Select Pages ({selectedPages.size} selected)
                </div>
                <div className="pdf2img-page-chips">
                  {pages.map((p) => {
                    const isSelected = selectedPages.has(p.pageNum);
                    const isDisabled = !isSelected && !canSelectMore;
                    return (
                      <button
                        key={p.pageNum}
                        className={`pdf2img-page-chip ${isSelected ? 'pdf2img-page-chip--selected' : ''} ${isDisabled ? 'pdf2img-page-chip--disabled' : ''}`}
                        onClick={() => !isDisabled && togglePage(p.pageNum)}
                        disabled={isDisabled}
                      >
                        {p.pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free limit warning */}
              {!isPro && totalPages > FREE_PAGE_LIMIT && (
                <div className="pdf2img-limit-warn">
                  <span className="pdf2img-limit-warn__icon">⚠️</span>
                  <span>
                    Free plan: max {FREE_PAGE_LIMIT} pages. Upgrade to Pro for unlimited pages & bulk ZIP download.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="pdf2img-actions">
                <button
                  className="pdf2img-btn pdf2img-btn--primary pdf2img-btn--full"
                  onClick={downloadSingle}
                  disabled={isProcessing || selectedPages.size === 0 || !canUse}
                >
                  {isProcessing ? 'Processing…' : `↓ Download ${selectedPages.size === 1 ? 'Image' : `${selectedPages.size} Images`}`}
                </button>

                {isPro && selectedPages.size > 1 && (
                  <button
                    className="pdf2img-btn pdf2img-btn--pro pdf2img-btn--full"
                    onClick={downloadBulkZip}
                    disabled={isProcessing || !canUse}
                  >
                    {isProcessing ? 'Creating ZIP…' : '📦 Download as ZIP (Pro)'}
                  </button>
                )}

                {!isPro && (
                  <button
                    className="pdf2img-btn pdf2img-btn--ghost pdf2img-btn--full"
                    onClick={() => setShowUpgrade(true)}
                  >
                    🔓 Unlock Pro Features
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== Preview Pane ===== */}
      <div className="pdf2img-preview">
        <div className="pdf2img-preview__bar">
          <span className="pdf2img-preview__title">Preview</span>
          {pages.length > 0 && (
            <span className="pdf2img-preview__meta">
              {totalPages} {totalPages === 1 ? 'page' : 'pages'}
            </span>
          )}
          <div className="pdf2img-preview__spacer" />

          {pages.length > 0 && (
            <div className="pdf2img-preview__zoom">
              <button
                className="pdf2img-preview__zoom-btn"
                onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
              >
                −
              </button>
              <span className="pdf2img-preview__zoom-val">{Math.round(zoom * 100)}%</span>
              <button
                className="pdf2img-preview__zoom-btn"
                onClick={() => setZoom((z) => Math.min(1, z + 0.1))}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="pdf2img-stage">
          {!file && (
            <div className="pdf2img-placeholder">
              <div className="pdf2img-placeholder__icon">📄</div>
              <div className="pdf2img-placeholder__text">
                <strong>Upload a PDF</strong> to get started
              </div>
            </div>
          )}

          {file && isProcessing && pages.length === 0 && (
            <div className="pdf2img-spinner">
              <div className="pdf2img-spinner__ring" />
              <div className="pdf2img-spinner__text">Rendering PDF pages…</div>
              {progress > 0 && (
                <div className="pdf2img-spinner__progress">
                  <div
                    className="pdf2img-spinner__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {file && pages.length > 0 && (
            <div className="pdf2img-grid">
              {pages.map((p) => {
                const isSelected = selectedPages.has(p.pageNum);
                return (
                  <div
                    key={p.pageNum}
                    className={`pdf2img-page-card ${isSelected ? 'pdf2img-page-card--selected' : ''}`}
                    onClick={() => togglePage(p.pageNum)}
                  >
                    <canvas
                      className="pdf2img-page-card__canvas"
                      ref={(el) => {
                        if (el && el !== p.canvas) {
                          const ctx = el.getContext('2d')!;
                          el.width = p.canvas.width * zoom;
                          el.height = p.canvas.height * zoom;
                          ctx.drawImage(p.canvas, 0, 0, el.width, el.height);
                        }
                      }}
                    />
                    <div className="pdf2img-page-card__label">Page {p.pageNum}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Mobile performance warning */}
      {mobileWarning && (
        <div className="mobile-warning">
          ⚡ Processing may be slower on mobile devices.
        </div>
      )}

      {/* Page count warning */}
      {pageWarning && (
        <div className="pdf2img-error" style={{ marginLeft: 0 }}>
          ⚠️ {pageWarning}
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
