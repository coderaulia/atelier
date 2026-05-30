import { useState, useCallback, useRef } from 'react';
import type { CVData } from './types';
import { parseCVText, parseDOCX, extractPDFText } from './cvParser';

interface Props {
  onClose: () => void;
  onApply: (data: Partial<CVData>) => void;
}

type FileType = 'pdf' | 'docx' | 'image' | null;

export default function CVImportModal({ onClose, onApply }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<CVData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- File handling ----------
  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;

    let detected: FileType = null;
    const type = selectedFile.type;
    const name = selectedFile.name.toLowerCase();

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      detected = 'pdf';
    } else if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
      detected = 'docx';
    } else if (type.startsWith('image/')) {
      detected = 'image';
    } else {
      setError('Unsupported file type. Please upload PDF, DOCX, or image files (PNG/JPG).');
      return;
    }

    setFile(selectedFile);
    setFileType(detected);
    setParsedData(null);
    setError(null);
  }, []);

  // ---------- Run extraction ----------
  const runExtraction = useCallback(async () => {
    if (!file || !fileType) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      let text = '';

      if (fileType === 'pdf') {
        setProgressText('Extracting PDF text...');
        text = await extractPDFText(file, (page, total) => {
          const pct = Math.round((page / total) * 100);
          setProgress(pct);
          setProgressText(`Reading page ${page} of ${total}...`);
        });
      } else if (fileType === 'docx') {
        setProgressText('Parsing DOCX...');
        setProgress(30);
        text = await parseDOCX(file);
        setProgress(100);
      } else {
        // Image — use Tesseract OCR
        setProgressText('Running OCR on image...');
        const tesseract = await import('tesseract.js');
        const worker = await tesseract.createWorker('eng', 1, {
          workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
          langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-data@1.0.0',
          corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5',
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setProgressText(`OCR: ${Math.round(m.progress * 100)}%`);
            } else if (m.status) {
              setProgressText(m.status);
            }
          },
        });
        const { data } = await worker.recognize(file);
        text = data.text || '';
        await worker.terminate();
      }

      if (!text.trim()) {
        setError('No text could be extracted from this file. Try using a higher-quality scan or PDF with selectable text.');
        setIsProcessing(false);
        return;
      }

      setProgressText('Parsing CV structure...');
      const parsed = parseCVText(text);
      setParsedData(parsed);
    } catch (err: any) {
      setError(err?.message || 'Extraction failed');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  }, [file, fileType]);

  const handleApply = useCallback(() => {
    if (parsedData) {
      onApply(parsedData);
    }
    onClose();
  }, [parsedData, onApply, onClose]);

  // ---------- Render field summary ----------
  function FieldsPreview({ data }: { data: Partial<CVData> }) {
    const fields: { label: string; value: string; filled: boolean }[] = [
      { label: 'Name', value: data.personal?.fullName || '', filled: !!data.personal?.fullName },
      { label: 'Email', value: data.personal?.email || '', filled: !!data.personal?.email },
      { label: 'Phone', value: data.personal?.phone || '', filled: !!data.personal?.phone },
      { label: 'Summary', value: data.summary ? data.summary.slice(0, 100) + (data.summary.length > 100 ? '...' : '') : '', filled: !!data.summary },
      { label: 'Experience', value: `${data.experience?.length || 0} entries found`, filled: (data.experience?.length || 0) > 0 },
      { label: 'Education', value: `${data.education?.length || 0} entries found`, filled: (data.education?.length || 0) > 0 },
      { label: 'Skills', value: `${data.skills?.length || 0} skills found`, filled: (data.skills?.length || 0) > 0 },
    ];

    return (
      <div className="cv-import-fields">
        {fields.map((f) => (
          <div key={f.label} className={`cv-import-field ${f.filled ? 'cv-import-field--ok' : ''}`}>
            <span className="cv-import-field__icon">{f.filled ? '✅' : '❌'}</span>
            <span className="cv-import-field__label">{f.label}</span>
            <span className="cv-import-field__value">{f.value || '—'}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cv-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <span className="modal__title">Import from Existing CV</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">
          {!file && (
            <>
              <p className="cv-import-desc">
                Upload your existing CV — we support <strong>PDF</strong>, <strong>DOCX</strong>, and image files (PNG/JPG).
                Text is extracted locally and parsed into structured CV fields.
              </p>

              <div className="cv-import-privacy">
                <span className="cv-import-privacy__icon">🔒</span>
                <span>All processing is local. No files leave your device.</span>
              </div>

              <button
                className="cv-import-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Choose PDF, DOCX, or Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,image/png,image/jpeg,image/jpg"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </>
          )}

          {file && !parsedData && !isProcessing && (
            <>
              <div className="cv-import-file">
                <span className="cv-import-file__icon">📄</span>
                <div className="cv-import-file__info">
                  <span className="cv-import-file__name">{file.name}</span>
                  <span className="cv-import-file__size">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  className="cv-import-file__clear"
                  onClick={() => { setFile(null); setFileType(null); }}
                >
                  ×
                </button>
              </div>

              <button
                className="btn btn--accent"
                onClick={runExtraction}
                style={{ width: '100%', marginTop: 16 }}
              >
                🔍 Extract & Parse
              </button>
            </>
          )}

          {isProcessing && (
            <div className="cv-import-progress">
              <div className="cv-import-progress__spinner" />
              <div className="cv-import-progress__text">{progressText}</div>
              {progress > 0 && (
                <>
                  <div className="cv-import-progress__bar">
                    <div
                      className="cv-import-progress__fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="cv-import-progress__percent">{progress}%</div>
                </>
              )}
            </div>
          )}

          {parsedData && (
            <>
              <p className="cv-import-result-heading">
                ✓ Text extracted and parsed
              </p>

              <FieldsPreview data={parsedData} />

              <div className="cv-import-actions">
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setFile(null);
                    setFileType(null);
                    setParsedData(null);
                  }}
                  style={{ flex: 1 }}
                >
                  ← Try another file
                </button>
                <button
                  className="btn btn--accent"
                  onClick={handleApply}
                  style={{ flex: 1 }}
                >
                  ✓ Apply to CV
                </button>
              </div>

              <p className="cv-import-hint">
                Fields will be filled with extracted data. Review and adjust in the editor.
              </p>
            </>
          )}

          {error && (
            <div className="cv-import-error">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
