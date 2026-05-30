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

interface PDFFile {
  id: string;
  file: File;
  preview?: string; // base64 preview of first page
}

const FREE_PDF_LIMIT = 3;
const PRO_PDF_LIMIT = 20;

export default function PDFMergeTool() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { canUse, used, limit, increment } = useToolLimit('pdf-merge');
  const { isPro } = usePlan();

  const maxFiles = isPro ? PRO_PDF_LIMIT : FREE_PDF_LIMIT;
  const canAddMore = files.length < maxFiles;

  // ---------- File handling ----------
  const handleFilesSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: PDFFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check if we've hit the limit
      if (files.length + newFiles.length >= maxFiles) {
        if (!isPro) {
          setShowUpgrade(true);
        }
        setToast({ 
          message: `Maximum ${maxFiles} PDFs allowed. ${isPro ? '' : 'Upgrade to Pro for up to 20 PDFs.'}`, 
          type: 'warning' 
        });
        break;
      }

      const result = await validatePDF(file);
      if (!result.valid) {
        setToast({ message: result.error!, type: 'error' });
        continue;
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [files.length, maxFiles, isPro]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelect(e.dataTransfer.files);
  }, [handleFilesSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ---------- Drag and drop reordering ----------
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleDragOverItem = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setFiles(newFiles);
    setDraggedIndex(index);
  }, [draggedIndex, files]);

  // ---------- Merge PDFs ----------
  const handleMerge = useCallback(async () => {
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }

    if (files.length < 2) {
      setToast({ message: 'Add at least 2 PDFs to merge', type: 'error' });
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

      const PDFDoc = await loadPdfLib();
      const mergedPdf = await PDFDoc.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i].file;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDoc.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page: any) => mergedPdf.addPage(page));
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged-${Date.now()}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setToast({ message: 'PDFs merged successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: getFriendlyErrorMessage(err), type: 'error' });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [canUse, increment, files]);

  return (
    <div className="pdfmerge-tool">
      {/* ===== Sidebar ===== */}
      <div className="pdfmerge-sidebar">
        <div className="pdfmerge-sidebar__head">
          <div className="pdfmerge-sidebar__title-row">
            <span className="pdfmerge-sidebar__title">PDF Merge</span>
          </div>

          {/* Privacy badge */}
          <div style={{ marginTop: 10 }}>
            <div className="pdfmerge-privacy">
              <span className="pdfmerge-privacy__icon">🔒</span>
              <span>Files never leave your browser</span>
            </div>
          </div>

          {/* Usage bar */}
          <div style={{ marginTop: 12 }}>
            <div className="pdfmerge-usage">
              <span className="pdfmerge-usage__label">
                Merges: {used}/{limit} today
              </span>
              <div className="pdfmerge-usage__track">
                <div
                  className="pdfmerge-usage__fill"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pdfmerge-sidebar__body">
          {/* Upload zone */}
          {files.length === 0 && (
            <div
              className={`pdfmerge-upload ${isDragging ? 'pdfmerge-upload--dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="pdfmerge-upload__icon">📑</div>
              <div className="pdfmerge-upload__text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div className="pdfmerge-upload__hint">
                Add 2-{maxFiles} PDF files
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                hidden
                onChange={(e) => handleFilesSelect(e.target.files)}
              />
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <>
              <div className="pdfmerge-header">
                <span className="pdfmerge-header__label">
                  {files.length} PDF{files.length !== 1 ? 's' : ''} · Drag to reorder
                </span>
                <button className="pdfmerge-header__clear" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>

              <div className="pdfmerge-list">
                {files.map((pdfFile, index) => (
                  <div
                    key={pdfFile.id}
                    className={`pdfmerge-item ${draggedIndex === index ? 'pdfmerge-item--dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOverItem(e, index)}
                  >
                    <div className="pdfmerge-item__drag">⋮⋮</div>
                    <div className="pdfmerge-item__icon">📄</div>
                    <div className="pdfmerge-item__details">
                      <div className="pdfmerge-item__name">{pdfFile.file.name}</div>
                      <div className="pdfmerge-item__meta">
                        {(pdfFile.file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      className="pdfmerge-item__remove"
                      onClick={() => handleRemoveFile(pdfFile.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add more button */}
              {canAddMore && (
                <button
                  className="pdfmerge-btn pdfmerge-btn--ghost pdfmerge-btn--full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Add more PDFs
                </button>
              )}

              {/* Limit warning */}
              {!isPro && files.length >= FREE_PDF_LIMIT && (
                <div className="pdfmerge-limit-warn">
                  <span className="pdfmerge-limit-warn__icon">⚠️</span>
                  <span>
                    Free plan: max {FREE_PDF_LIMIT} PDFs. Upgrade to Pro for up to {PRO_PDF_LIMIT} PDFs.
                  </span>
                </div>
              )}

              {/* Merge button */}
              <div className="pdfmerge-actions">
                <button
                  className="pdfmerge-btn pdfmerge-btn--primary pdfmerge-btn--full"
                  onClick={handleMerge}
                  disabled={isProcessing || files.length < 2 || !canUse}
                >
                  {isProcessing ? `Merging... ${progress}%` : `📦 Merge ${files.length} PDFs`}
                </button>

                {!isPro && (
                  <button
                    className="pdfmerge-btn pdfmerge-btn--ghost pdfmerge-btn--full"
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
      <div className="pdfmerge-preview">
        <div className="pdfmerge-preview__bar">
          <span className="pdfmerge-preview__title">Merge Order</span>
          {files.length > 0 && (
            <span className="pdfmerge-preview__meta">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="pdfmerge-stage">
          {files.length === 0 && (
            <div className="pdfmerge-placeholder">
              <div className="pdfmerge-placeholder__icon">📑</div>
              <div className="pdfmerge-placeholder__text">
                <strong>Upload PDFs</strong> to merge them into one file
              </div>
              <div className="pdfmerge-placeholder__hint">
                Files are combined in the order shown. Drag to reorder.
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="pdfmerge-flow">
              {files.map((pdfFile, index) => (
                <React.Fragment key={pdfFile.id}>
                  <div className="pdfmerge-flow-item">
                    <div className="pdfmerge-flow-item__number">{index + 1}</div>
                    <div className="pdfmerge-flow-item__icon">📄</div>
                    <div className="pdfmerge-flow-item__name">{pdfFile.file.name}</div>
                  </div>
                  {index < files.length - 1 && (
                    <div className="pdfmerge-flow-arrow">↓</div>
                  )}
                </React.Fragment>
              ))}
              <div className="pdfmerge-flow-result">
                <div className="pdfmerge-flow-result__icon">📦</div>
                <div className="pdfmerge-flow-result__text">Merged PDF</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Toast notification */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
