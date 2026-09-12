import { useState, useRef, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CVData, CVTemplate } from '../types';
import { renderTemplate } from '../renderTemplate';
import { validateCVData } from '../../../lib/fileValidation';
import { getFriendlyErrorMessage } from '../../../lib/errorHandler';

export interface UseCVPdfPreviewOptions {
  template: CVTemplate;
  cvData: CVData;
  accent: string;
  canUse: boolean;
  increment: () => Promise<boolean>;
  setShowUpgrade: (show: boolean) => void;
  setToast: (toast: { message: string; type: 'error' | 'warning' | 'info' } | null) => void;
}

export function useCVPdfPreview({
  template,
  cvData,
  accent,
  canUse,
  increment,
  setShowUpgrade,
  setToast,
}: UseCVPdfPreviewOptions) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const prevBlobRef = useRef<string | null>(null);

  const refreshPreview = useCallback(async () => {
    const validation = validateCVData(cvData);
    if (!validation.valid) {
      setToast({ message: validation.error!, type: 'error' });
      return;
    }

    setIsRendering(true);
    setRenderError(null);
    try {
      const doc = renderTemplate(template, cvData, accent);
      const blob = await pdf(doc).toBlob();
      // Revoke previous URL to avoid memory leak
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
      const url = URL.createObjectURL(blob);
      prevBlobRef.current = url;
      setBlobUrl(url);
    } catch (err: any) {
      const message = getFriendlyErrorMessage(err);
      setRenderError(message);
      setToast({ message, type: 'error' });
    } finally {
      setIsRendering(false);
    }
  }, [template, cvData, accent, setToast]);

  const handleExport = useCallback(async () => {
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }

    const validation = validateCVData(cvData);
    if (!validation.valid) {
      setToast({ message: validation.error!, type: 'error' });
      return;
    }

    setIsRendering(true);
    setRenderError(null);
    try {
      const ok = await increment();
      if (!ok) {
        setShowUpgrade(true);
        setIsRendering(false);
        return;
      }

      const doc = renderTemplate(template, cvData, accent);
      const blob = await pdf(doc).toBlob();
      const name =
        (cvData.personal.fullName || 'resume')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') + '-cv.pdf';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    } catch (err: any) {
      const message = getFriendlyErrorMessage(err);
      setRenderError(message);
      setToast({ message, type: 'error' });
    } finally {
      setIsRendering(false);
    }
  }, [canUse, increment, template, cvData, accent, setToast, setShowUpgrade]);

  return {
    blobUrl,
    setBlobUrl,
    isRendering,
    renderError,
    setRenderError,
    refreshPreview,
    handleExport,
  };
}
