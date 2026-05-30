import { useState, useCallback, useRef } from 'react';
import type { CVData } from './types';

// Lazy-loaded dependencies
let Tesseract: any = null;
let pdfjsLib: any = null;

async function loadTesseract() {
  if (Tesseract) return Tesseract;
  const module = await import('tesseract.js');
  Tesseract = module;
  return Tesseract;
}

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  pdfjsLib = pdfjs;
  return pdfjs;
}

interface Props {
  onClose: () => void;
  onApply: (data: Partial<CVData>) => void;
}

export default function CVImportModal({ onClose, onApply }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<any>(null);

  // ---------- File handling ----------
  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    const type = selectedFile.type;
    if (!type.startsWith('image/') && type !== 'application/pdf') {
      setError('Please upload an image (PNG/JPG) or PDF file');
      return;
    }
    setFile(selectedFile);
    setExtractedText('');
    setError(null);
  }, []);

  // ---------- OCR Recognition ----------
  const runOCR = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProgressText('Initializing OCR...');

    try {
      const tesseract = await loadTesseract();
      
      const worker = await tesseract.createWorker('eng', 1, {
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

      let text = '';

      if (file.type === 'application/pdf') {
        // Render first page of PDF
        setProgressText('Loading PDF...');
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        
        const { data } = await worker.recognize(canvas);
        text = data.text;
      } else {
        // Process image
        const { data } = await worker.recognize(file);
        text = data.text;
      }

      setExtractedText(text.trim());
      
      await worker.terminate();
      workerRef.current = null;
    } catch (err: any) {
      setError(err?.message || 'OCR recognition failed');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  }, [file]);

  // ---------- Parse CV text ----------
  const parseCV = useCallback((): Partial<CVData> => {
    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
    
    const parsed: Partial<CVData> = {
      personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    // Extract email
    const emailMatch = extractedText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) parsed.personal!.email = emailMatch[0];

    // Extract phone
    const phoneMatch = extractedText.match(/[\+\(]?[0-9][0-9\s\-\(\)]{7,}[0-9]/);
    if (phoneMatch) parsed.personal!.phone = phoneMatch[0];

    // Extract LinkedIn
    const linkedinMatch = extractedText.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) parsed.personal!.linkedin = linkedinMatch[0];

    // Extract GitHub
    const githubMatch = extractedText.match(/github\.com\/[\w-]+/i);
    if (githubMatch) parsed.personal!.github = githubMatch[0];

    // Extract website
    const websiteMatch = extractedText.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+/);
    if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
      parsed.personal!.website = websiteMatch[0].replace(/^https?:\/\//, '');
    }

    // First line is likely the name
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Check if it looks like a name (not too long, mostly letters)
      if (firstLine.length < 50 && /^[A-Za-z\s]+$/.test(firstLine)) {
        parsed.personal!.fullName = firstLine;
      }
    }

    // Second line might be title
    if (lines.length > 1) {
      const secondLine = lines[1];
      if (secondLine.length < 80 && !secondLine.includes('@') && !secondLine.includes('http')) {
        parsed.personal!.title = secondLine;
      }
    }

    // Extract skills (look for common skill keywords)
    const skillKeywords = ['Skills', 'Technical Skills', 'Expertise', 'Technologies'];
    const skillSectionIndex = lines.findIndex(l => 
      skillKeywords.some(k => l.toLowerCase().includes(k.toLowerCase()))
    );
    
    if (skillSectionIndex !== -1) {
      // Get next few lines after skills header
      const skillLines = lines.slice(skillSectionIndex + 1, skillSectionIndex + 10);
      skillLines.forEach((line, idx) => {
        // Stop if we hit another section
        if (line.match(/^(Experience|Education|Certifications)/i)) return;
        
        // Split by common delimiters
        const skills = line.split(/[,•·|]/);
        skills.forEach(skill => {
          const trimmed = skill.trim();
          if (trimmed && trimmed.length < 30) {
            parsed.skills!.push({
              id: `skill-${Date.now()}-${idx}-${Math.random()}`,
              name: trimmed,
              category: 'Technical',
            });
          }
        });
      });
    }

    return parsed;
  }, [extractedText]);

  const handleApply = useCallback(() => {
    const parsed = parseCV();
    onApply(parsed);
    onClose();
  }, [parseCV, onApply, onClose]);

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
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--shell-muted)', marginBottom: 16 }}>
                Upload your existing CV (PDF or image) and we'll extract the text using OCR.
                You can then edit the extracted text and apply it to your CV fields.
              </p>
              
              <div className="cv-import-privacy">
                <span className="cv-import-privacy__icon">🔒</span>
                <span>OCR runs locally in your browser. No file upload.</span>
              </div>

              <button
                className="cv-import-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📄 Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </>
          )}

          {file && !extractedText && !isProcessing && (
            <>
              <div className="cv-import-file">
                <span className="cv-import-file__icon">📄</span>
                <span className="cv-import-file__name">{file.name}</span>
                <button 
                  className="cv-import-file__clear"
                  onClick={() => setFile(null)}
                >
                  ×
                </button>
              </div>

              <button
                className="btn btn--accent"
                onClick={runOCR}
                style={{ width: '100%', marginTop: 16 }}
              >
                🔍 Extract Text
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

          {extractedText && (
            <>
              <p style={{ fontSize: 12, color: 'var(--shell-muted)', marginBottom: 8 }}>
                Extracted text (editable):
              </p>
              <textarea
                className="cv-import-textarea"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={12}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setFile(null);
                    setExtractedText('');
                  }}
                  style={{ flex: 1 }}
                >
                  ← Start Over
                </button>
                <button
                  className="btn btn--accent"
                  onClick={handleApply}
                  style={{ flex: 1 }}
                >
                  ✓ Parse & Fill
                </button>
              </div>

              <p style={{ fontSize: 11, color: 'var(--shell-muted)', marginTop: 12, lineHeight: 1.5 }}>
                We'll attempt to auto-fill your CV fields from the extracted text.
                You can review and edit the results after applying.
              </p>
            </>
          )}

          {error && (
            <div style={{ 
              fontSize: 11.5, 
              color: '#ff8080', 
              background: '#3a1a1a', 
              border: '1px solid #5c2a2a', 
              borderRadius: 6, 
              padding: '10px 14px', 
              marginTop: 12 
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
