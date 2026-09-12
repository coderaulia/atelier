import { useState, useMemo } from 'react';
import { exportImage, exportPDF, copyImage } from '../utils';

export interface UseDocumentExportOptions {
  docType: string;
  data: any;
  socialTemplateId: string;
  AllSocialTemplates: any[];
  activeSocialLocked: boolean;
  canUse: boolean;
  setShowUpgrade: (show: boolean) => void;
  increment: () => void;
  handleSaveDocument?: (status?: 'draft' | 'final') => Promise<void>;
  isToolMode?: boolean;
  paper?: string;
  socialSlides?: any[];
  exportTarget: string;
}

export function useDocumentExport({
  docType,
  data,
  socialTemplateId,
  AllSocialTemplates,
  activeSocialLocked,
  canUse,
  setShowUpgrade,
  increment,
  handleSaveDocument,
  isToolMode = false,
  paper = 'a4',
  socialSlides = [],
  exportTarget,
}: UseDocumentExportOptions) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

  const filename = useMemo(() => {
    if (docType === 'invoice') return `${((data as any)?.invoiceNo || 'invoice').replace(/\s+/g, '-')}`;
    if (docType === 'receipt') return `${((data as any)?.receiptNo || 'receipt').replace(/\s+/g, '-')}`;
    if (docType === 'quote') return 'quick-quote';
    if (docType === 'social') {
      const tpl = AllSocialTemplates.find((s: any) => s.id === socialTemplateId);
      return `${((tpl as any)?.name || 'social').toLowerCase().replace(/\s+/g, '-')}`;
    }
    const slug = ((data as any)?.title || (data as any)?.projectName || (data as any)?.clientName || (data as any)?.refNo || 'doc')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .slice(0, 40);
    return `${docType}-${slug}`;
  }, [docType, data, socialTemplateId, AllSocialTemplates]);

  const handleExportPDF = async () => {
    if (activeSocialLocked) {
      setShowUpgrade(true);
      return;
    }
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    if (docType !== 'social' && !isToolMode && handleSaveDocument) {
      handleSaveDocument('final').catch(() => {});
    }
    setExportingPdf(true);
    try {
      await exportPDF(exportTarget, filename, (paper as any) || 'a4');
      increment();
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleImage = async (fmt: string) => {
    if (activeSocialLocked) {
      setShowUpgrade(true);
      return;
    }
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    await exportImage(exportTarget, filename, fmt);
    increment();
  };

  const handleCopyImage = async () => {
    if (activeSocialLocked) {
      setShowUpgrade(true);
      return;
    }
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    setCopyState('copying');
    try {
      await copyImage(exportTarget);
      setCopyState('copied');
      increment();
      setTimeout(() => setCopyState('idle'), 1600);
    } catch (err) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2200);
    }
  };

  const downloadAllSlides = async (fmt: string) => {
    if (activeSocialLocked) {
      setShowUpgrade(true);
      return;
    }
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }
    for (let i = 0; i < socialSlides.length; i++) {
      await exportImage(`#social-target-${i}`, `${filename}-${String(i + 1).padStart(2, '0')}`, fmt);
      await new Promise((r) => setTimeout(r, 300));
    }
    increment();
  };

  return {
    filename,
    exportingPdf,
    copyState,
    handleExportPDF,
    handleImage,
    handleCopyImage,
    downloadAllSlides,
  };
}
