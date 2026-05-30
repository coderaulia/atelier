import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToolLimit } from '../../hooks/useToolLimit';
import { usePlan } from '../../hooks/usePlan';
import UpgradeModal from '../../components/UpgradeModal';
import Toast from '../../components/Toast';
import { validateImage, validatePDF, validateOCRImage, validateOCRPDFPage } from '../../lib/fileValidation';
import { getFriendlyErrorMessage, isLowPowerDevice, releaseCanvas } from '../../lib/errorHandler';

// Lazy-loaded tesseract.js
let Tesseract: any = null;
let tesseractLoaded = false;

async function loadTesseract() {
  if (tesseractLoaded) return Tesseract;
  
  const module = await import('tesseract.js');
  Tesseract = module;
  tesseractLoaded = true;
  return Tesseract;
}

// Lazy-loaded pdfjs-dist (for PDF support)
let pdfjsLib: any = null;
let pdfjsLoaded = false;

async function loadPdfJs() {
  if (pdfjsLoaded) return pdfjsLib;
  
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  pdfjsLib = pdfjs;
  pdfjsLoaded = true;
  return pdfjs;
}

type Language = 'eng' | 'ind';
type FileType = 'image' | 'pdf';

interface PDFPage {
  pageNum: number;
  canvas: HTMLCanvasElement;
}

const LANG_OPTIONS = [
  { value: 'eng' as Language, label: 'English' },
  { value: 'ind' as Language, label: 'Indonesian' },
];

export default function OCRTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState<Language>('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [mobileWarning] = useState(isLowPowerDevice());
  const [recognizedText, setRecognizedText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<any>(null);

  const { canUse, used, limit, increment } = useToolLimit('ocr');
  const { isPro } = usePlan();

  // ---------- File handling ----------
  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    const type = selectedFile.type;
    if (type.startsWith('image/')) {
      // Validate image
      const imgResult = validateImage(selectedFile);
      if (!imgResult.valid) {
        setToast({ message: imgResult.error!, type: 'error' });
        return;
      }
      const ocrResult = validateOCRImage(selectedFile);
      if (!ocrResult.valid) {
        setToast({ message: ocrResult.error!, type: 'error' });
        return;
      }

      setFileType('image');
      setFile(selectedFile);
      setPdfPages([]);
      setSelectedPages(new Set());
      setRecognizedText('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else if (type === 'application/pdf') {
      // Validate PDF
      const result = await validatePDF(selectedFile);
      if (!result.valid) {
        setToast({ message: result.error!, type: 'error' });
        return;
      }

      setFileType('pdf');
      setFile(selectedFile);
      setRecognizedText('');
      setPreviewUrl(null);
      
      // Render PDF pages
      await renderPDFPages(selectedFile);
    } else {
      setToast({ message: 'Please upload an image (PNG/JPG/WebP) or PDF file', type: 'error' });
    }
  }, []);

  const renderPDFPages = useCallback(async (pdfFile: File) => {
    setIsProcessing(true);
    setProgressText('Loading PDF...');
    
    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const rendered: PDFPage[] = [];

      // Memory guard: process one page at a time
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          // Validate rendered page size for OCR
          const dataUrl = canvas.toDataURL('image/png');
          const blob = await (await fetch(dataUrl)).blob();
          const sizeCheck = validateOCRPDFPage(blob.size);
          if (!sizeCheck.valid) {
            setToast({ message: `Page ${i}: ${sizeCheck.error}`, type: 'warning' });
            continue;
          }

          rendered.push({ pageNum: i, canvas });
        } catch (pageErr) {
          setToast({ message: getFriendlyErrorMessage(pageErr, i), type: 'error' });
          break;
        }
      }

      setPdfPages(rendered);
      
      // Auto-select first page (or all for Pro)
      const autoSelect = new Set<number>();
      if (isPro) {
        for (let i = 1; i <= numPages; i++) {
          autoSelect.add(i);
        }
      } else {
        autoSelect.add(1);
      }
      setSelectedPages(autoSelect);
      
      // Set preview to first page
      if (rendered.length > 0) {
        const url = rendered[0].canvas.toDataURL();
        setPreviewUrl(url);
      }
    } catch (err: any) {
      setToast({ message: getFriendlyErrorMessage(err), type: 'error' });
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  }, [isPro]);

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
    // Memory guard: release all PDF page canvases
    pdfPages.forEach((p) => releaseCanvas(p.canvas));
    setPdfPages([]);
    setFile(null);
    setFileType(null);
    setSelectedPages(new Set());
    setRecognizedText('');
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Terminate worker if exists
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, [previewUrl, pdfPages]);

  // ---------- Page selection (PDF) ----------
  const togglePage = useCallback((pageNum: number) => {
    if (!isPro && pageNum !== 1) {
      setShowUpgrade(true);
      return;
    }
    
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
    
    // Update preview
    const page = pdfPages.find(p => p.pageNum === pageNum);
    if (page) {
      const url = page.canvas.toDataURL();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    }
  }, [isPro, pdfPages, previewUrl]);

  // ---------- OCR Recognition ----------
  const runOCR = useCallback(async () => {
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    if (!file) {
      setError('No file selected');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProgressText('Initializing OCR...');
    setRecognizedText('');

    try {
      const ok = await increment();
      if (!ok) {
        setShowUpgrade(true);
        setIsProcessing(false);
        return;
      }

      const tesseract = await loadTesseract();
      
      // Create worker with CDN language data
      const worker = await tesseract.createWorker(language, 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-data@1.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5',
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setProgressText(`Recognizing text... ${Math.round(m.progress * 100)}%`);
          } else if (m.status) {
            setProgressText(m.status);
          }
        },
      });
      
      workerRef.current = worker;

      let allText = '';

      if (fileType === 'image') {
        // Process single image
        const { data } = await worker.recognize(file);
        allText = data.text;
      } else if (fileType === 'pdf') {
        // Process selected PDF pages
        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        
        for (let i = 0; i < sortedPages.length; i++) {
          const pageNum = sortedPages[i];
          const page = pdfPages.find(p => p.pageNum === pageNum);
          if (!page) continue;

          setProgressText(`Processing page ${pageNum} of ${sortedPages.length}...`);
          
          const { data } = await worker.recognize(page.canvas);
          
          if (sortedPages.length > 1) {
            allText += `\n\n--- Page ${pageNum} ---\n\n`;
          }
          allText += data.text;
        }
      }

      setRecognizedText(allText.trim());
      
      await worker.terminate();
      workerRef.current = null;
    } catch (err: any) {
      setToast({ message: getFriendlyErrorMessage(err), type: 'error' });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  }, [canUse, increment, file, fileType, language, selectedPages, pdfPages]);

  // ---------- Download text ----------
  const downloadText = useCallback(() => {
    if (!recognizedText) return;
    
    const blob = new Blob([recognizedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'ocr-output'}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [recognizedText, file]);

  // ---------- Copy text ----------
  const copyText = useCallback(async () => {
    if (!recognizedText) return;
    
    try {
      await navigator.clipboard.writeText(recognizedText);
      // Could add a toast notification here
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }, [recognizedText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="ocr-tool">
      {/* ===== Sidebar ===== */}
      <div className="ocr-sidebar">
        <div className="ocr-sidebar__head">
          <div className="ocr-sidebar__title-row">
            <span className="ocr-sidebar__title">OCR Text Recognition</span>
          </div>

          {/* Privacy badge */}
          <div style={{ marginTop: 10 }}>
            <div className="ocr-privacy">
              <span className="ocr-privacy__icon">🔒</span>
              <span>OCR runs locally in your browser</span>
            </div>
          </div>

          {/* Usage bar */}
          <div style={{ marginTop: 12 }}>
            <div className="ocr-usage">
              <span className="ocr-usage__label">
                OCR uses: {used}/{limit} today
              </span>
              <div className="ocr-usage__track">
                <div
                  className="ocr-usage__fill"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ocr-sidebar__body">
          {/* Upload zone */}
          {!file && (
            <div
              className={`ocr-upload ${isDragging ? 'ocr-upload--dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="ocr-upload__icon">🖼️</div>
              <div className="ocr-upload__text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div className="ocr-upload__hint">Images (PNG/JPG/WebP) or PDF</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* File info */}
          {file && (
            <div className="ocr-fileinfo">
              <div className="ocr-fileinfo__icon">{fileType === 'pdf' ? '📄' : '🖼️'}</div>
              <div className="ocr-fileinfo__details">
                <div className="ocr-fileinfo__name">{file.name}</div>
                <div className="ocr-fileinfo__meta">
                  {(file.size / 1024).toFixed(1)} KB
                  {fileType === 'pdf' && ` · ${pdfPages.length} ${pdfPages.length === 1 ? 'page' : 'pages'}`}
                </div>
              </div>
              <button className="ocr-fileinfo__clear" onClick={handleClear}>
                ×
              </button>
            </div>
          )}

          {/* Language selection */}
          {file && (
            <div className="ocr-settings">
              <div className="ocr-settings__label">Recognition Language</div>
              <div className="ocr-lang-row">
                {LANG_OPTIONS.map((lang) => (
                  <button
                    key={lang.value}
                    className={`ocr-lang-btn ${language === lang.value ? 'ocr-lang-btn--active' : ''}`}
                    onClick={() => setLanguage(lang.value)}
                    disabled={isProcessing}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF page selection */}
          {file && fileType === 'pdf' && pdfPages.length > 0 && (
            <div className="ocr-page-select">
              <div className="ocr-page-select__label">
                Select Pages ({selectedPages.size} selected)
              </div>
              <div className="ocr-page-chips">
                {pdfPages.map((p) => {
                  const isSelected = selectedPages.has(p.pageNum);
                  const isDisabled = !isPro && p.pageNum !== 1 && !isSelected;
                  return (
                    <button
                      key={p.pageNum}
                      className={`ocr-page-chip ${isSelected ? 'ocr-page-chip--selected' : ''} ${isDisabled ? 'ocr-page-chip--disabled' : ''}`}
                      onClick={() => !isDisabled && togglePage(p.pageNum)}
                      disabled={isDisabled || isProcessing}
                    >
                      {p.pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Free limit warning */}
          {!isPro && fileType === 'pdf' && pdfPages.length > 1 && (
            <div className="ocr-limit-warn">
              <span className="ocr-limit-warn__icon">⚠️</span>
              <span>
                Free plan: 1 page only. Upgrade to Pro for multi-page PDF recognition.
              </span>
            </div>
          )}

          {/* Actions */}
          {file && (
            <div className="ocr-actions">
              <button
                className="ocr-btn ocr-btn--primary ocr-btn--full"
                onClick={runOCR}
                disabled={isProcessing || !canUse || (fileType === 'pdf' && selectedPages.size === 0)}
              >
                {isProcessing ? 'Processing…' : '🔍 Recognize Text'}
              </button>

              {!isPro && (
                <button
                  className="ocr-btn ocr-btn--ghost ocr-btn--full"
                  onClick={() => setShowUpgrade(true)}
                >
                  🔓 Unlock Pro Features
                </button>
              )}
            </div>
          )}

          {error && <div className="ocr-error">{error}</div>}
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="ocr-main">
        <div className="ocr-main__bar">
          <span className="ocr-main__title">Results</span>
          <div className="ocr-main__spacer" />
          {recognizedText && (
            <div className="ocr-main__actions">
              <button className="ocr-btn ocr-btn--ghost" onClick={copyText}>
                📋 Copy
              </button>
              <button className="ocr-btn ocr-btn--primary" onClick={downloadText}>
                ↓ Download .txt
              </button>
            </div>
          )}
        </div>

        <div className="ocr-content">
          {/* Preview pane */}
          <div className="ocr-pane">
            <div className="ocr-pane__head">Preview</div>
            <div className="ocr-pane__body">
              {previewUrl ? (
                <div className="ocr-preview">
                  <img src={previewUrl} alt="Preview" className="ocr-preview__img" />
                </div>
              ) : (
                <div className="ocr-preview">
                  <div className="ocr-preview__placeholder">
                    Upload an image or PDF to preview
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text output pane */}
          <div className="ocr-pane">
            <div className="ocr-pane__head">Recognized Text</div>
            <div className="ocr-pane__body">
              {isProcessing ? (
                <div className="ocr-progress">
                  <div className="ocr-progress__spinner" />
                  <div className="ocr-progress__text">{progressText}</div>
                  {progress > 0 && (
                    <>
                      <div className="ocr-progress__bar">
                        <div
                          className="ocr-progress__fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="ocr-progress__percent">{progress}%</div>
                    </>
                  )}
                </div>
              ) : recognizedText ? (
                <div className="ocr-output">{recognizedText}</div>
              ) : (
                <div className="ocr-output ocr-output--empty">
                  Recognized text will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Mobile performance warning */}
      {mobileWarning && (
        <div className="mobile-warning">
          ⚡ OCR may be slower on mobile devices.
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
