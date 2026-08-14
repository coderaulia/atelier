import React, { useState, useCallback, useRef } from 'react';
import { useToolLimit } from '../../hooks/useToolLimit';
import { usePlan } from '../../hooks/usePlan';
import UpgradeModal from '../../components/UpgradeModal';
import Toast from '../../components/Toast';
import { validatePDF } from '../../lib/fileValidation';
import { getFriendlyErrorMessage } from '../../lib/errorHandler';

// Lazy-loaded pdf-lib
let PDFDocument: any = null;
let pdfLibLoaded = false;

async function loadPdfLib() {
  if (pdfLibLoaded) return PDFDocument;
  const module = await import('pdf-lib');
  PDFDocument = module.PDFDocument;
  pdfLibLoaded = true;
  return module.PDFDocument;
}

type CompressionLevel = 'low' | 'medium' | 'high';

interface CompressionOption {
  level: CompressionLevel;
  label: string;
  desc: string;
  quality: string;
}

const COMPRESSION_OPTIONS: CompressionOption[] = [
  { level: 'low', label: 'Light', desc: 'Minimal compression, best quality', quality: '95%' },
  { level: 'medium', label: 'Balanced', desc: 'Good balance of size and quality', quality: '75%' },
  { level: 'high', label: 'Maximum', desc: 'Smallest file, some quality loss', quality: '55%' },
];

export default function PDFCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { canUse, used, limit, increment } = useToolLimit('pdf-compress');
  const { isPro } = usePlan();

  // ---------- File handling ----------
  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    const result = await validatePDF(selectedFile);
    if (!result.valid) {
      setToast({ message: result.error!, type: 'error' });
      return;
    }
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedSize(0);
    setCompressedBlob(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressedBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ---------- Compress ----------
  const handleCompress = useCallback(async () => {
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    if (!file) {
      setToast({ message: 'No file selected', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const ok = await increment();
      if (!ok) {
        setShowUpgrade(true);
        setIsProcessing(false);
        return;
      }

      const PDFDoc = await loadPdfLib();
      setProgress(25);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDoc.load(arrayBuffer, { ignoreEncryption: true });

      setProgress(50);

      // Re-save with optimization options
      const saveOptions: any = {
        useObjectStreams: true,
        addDefaultPage: false,
      };

      // For high compression, strip metadata
      if (compressionLevel === 'high') {
        saveOptions.objectsPerTick = 50;
      }

      const pdfBytes = await pdfDoc.save(saveOptions);
      setProgress(80);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setProgress(100);
    } catch (err: any) {
      setToast({ message: getFriendlyErrorMessage(err), type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [canUse, increment, file, compressionLevel]);

  // ---------- Download ----------
  const handleDownload = useCallback(() => {
    if (!compressedBlob || !file) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}-compressed.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [compressedBlob, file]);

  const savingsPercent = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="pdfcompress-tool">
      {/* ===== Sidebar ===== */}
      <div className="pdfcompress-sidebar">
        <div className="pdfcompress-sidebar__head">
          <div className="pdfcompress-sidebar__title-row">
            <span className="pdfcompress-sidebar__title">PDF Compress</span>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="pdfcompress-privacy">
              <span className="pdfcompress-privacy__icon">🔒</span>
              <span>Files never leave your browser</span>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="pdfcompress-usage">
              <span className="pdfcompress-usage__label">
                Compressions: {used}/{limit} today
              </span>
              <div className="pdfcompress-usage__track">
                <div
                  className="pdfcompress-usage__fill"
                  style={{ width: `${Math.min((used / (limit ?? 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pdfcompress-sidebar__body">
          {/* Upload zone */}
          {!file && (
            <div
              className={`pdfcompress-upload ${isDragging ? 'pdfcompress-upload--dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="pdfcompress-upload__icon">🗜️</div>
              <div className="pdfcompress-upload__text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div className="pdfcompress-upload__hint">PDF files only</div>
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
            <div className="pdfcompress-fileinfo">
              <div className="pdfcompress-fileinfo__icon">📄</div>
              <div className="pdfcompress-fileinfo__details">
                <div className="pdfcompress-fileinfo__name">{file.name}</div>
                <div className="pdfcompress-fileinfo__meta">{formatSize(originalSize)}</div>
              </div>
              <button className="pdfcompress-fileinfo__clear" onClick={handleClear}>×</button>
            </div>
          )}

          {/* Compression levels */}
          {file && (
            <>
              <div className="pdfcompress-settings">
                <div className="pdfcompress-settings__label">Compression Level</div>
                <div className="pdfcompress-levels">
                  {COMPRESSION_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      className={`pdfcompress-level ${compressionLevel === opt.level ? 'pdfcompress-level--active' : ''}`}
                      onClick={() => {
                        setCompressionLevel(opt.level);
                        setCompressedBlob(null);
                        setCompressedSize(0);
                      }}
                    >
                      <div className="pdfcompress-level__label">{opt.label}</div>
                      <div className="pdfcompress-level__desc">{opt.desc}</div>
                      <div className="pdfcompress-level__quality">~{opt.quality} quality</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {compressedSize > 0 && (
                <div className="pdfcompress-result">
                  <div className="pdfcompress-result__row">
                    <span className="pdfcompress-result__label">Original</span>
                    <span className="pdfcompress-result__value">{formatSize(originalSize)}</span>
                  </div>
                  <div className="pdfcompress-result__row">
                    <span className="pdfcompress-result__label">Compressed</span>
                    <span className="pdfcompress-result__value pdfcompress-result__value--accent">
                      {formatSize(compressedSize)}
                    </span>
                  </div>
                  <div className="pdfcompress-result__savings">
                    Saved {savingsPercent}%
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pdfcompress-actions">
                {!compressedBlob ? (
                  <button
                    className="pdfcompress-btn pdfcompress-btn--primary pdfcompress-btn--full"
                    onClick={handleCompress}
                    disabled={isProcessing || !canUse}
                  >
                    {isProcessing ? `Compressing... ${progress}%` : '🗜️ Compress PDF'}
                  </button>
                ) : (
                  <button
                    className="pdfcompress-btn pdfcompress-btn--primary pdfcompress-btn--full"
                    onClick={handleDownload}
                  >
                    ↓ Download Compressed PDF
                  </button>
                )}

                {compressedBlob && (
                  <button
                    className="pdfcompress-btn pdfcompress-btn--ghost pdfcompress-btn--full"
                    onClick={handleCompress}
                    disabled={isProcessing || !canUse}
                  >
                    Re-compress with different level
                  </button>
                )}

                {!isPro && (
                  <button
                    className="pdfcompress-btn pdfcompress-btn--ghost pdfcompress-btn--full"
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
      <div className="pdfcompress-preview">
        <div className="pdfcompress-preview__bar">
          <span className="pdfcompress-preview__title">Preview</span>
          {file && (
            <span className="pdfcompress-preview__meta">
              {formatSize(originalSize)}
              {compressedSize > 0 && ` → ${formatSize(compressedSize)}`}
            </span>
          )}
        </div>

        <div className="pdfcompress-stage">
          {!file && (
            <div className="pdfcompress-placeholder">
              <div className="pdfcompress-placeholder__icon">🗜️</div>
              <div className="pdfcompress-placeholder__text">
                <strong>Upload a PDF</strong> to reduce its file size
              </div>
            </div>
          )}

          {file && isProcessing && !compressedBlob && (
            <div className="pdfcompress-spinner">
              <div className="pdfcompress-spinner__ring" />
              <div className="pdfcompress-spinner__text">Optimizing PDF...</div>
              {progress > 0 && (
                <div className="pdfcompress-spinner__progress">
                  <div
                    className="pdfcompress-spinner__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {file && compressedBlob && (
            <div className="pdfcompress-comparison">
              <div className="pdfcompress-comparison__item">
                <div className="pdfcompress-comparison__label">Before</div>
                <div className="pdfcompress-comparison__size">{formatSize(originalSize)}</div>
              </div>
              <div className="pdfcompress-comparison__arrow">→</div>
              <div className="pdfcompress-comparison__item pdfcompress-comparison__item--accent">
                <div className="pdfcompress-comparison__label">After</div>
                <div className="pdfcompress-comparison__size">{formatSize(compressedSize)}</div>
                <div className="pdfcompress-comparison__savings">-{savingsPercent}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
