import { useState, useCallback, useEffect } from 'react';
import { CVData, CVTemplate, CV_TEMPLATES, generateCVFromStartupConfig, type CVStartupConfig } from './types';
import { CVEditor } from './CVEditor';
import CVStepEditor from './CVStepEditor';
import CVATSPanel from './CVATSPanel';
import CVRegionalToggle from './CVRegionalToggle';
import CVContentLibrary from './CVContentLibrary';
import CoverLetterEditor from './CoverLetterEditor';
import { DEFAULT_COVER_LETTER } from './coverLetterTypes';
import { useCVDocuments } from './useCVDocuments';
import CVWizard from './CVWizard';
import { exportCVToDocx } from './cvDocxExport';
import { useLocalStorage } from '../documents/utils';
import { useToolLimit } from '../../hooks/useToolLimit';
import { usePlan } from '../../hooks/usePlan';
import UpgradeModal from '../../components/UpgradeModal';
import CVImportModal from './CVImportModal';
import Toast from '../../components/Toast';
import { CVPdfViewer } from './components/CVPdfViewer';
import { CVLeftRail } from './components/CVLeftRail';
import { CVTopBar } from './components/CVTopBar';
import { useCVPdfPreview } from './hooks/useCVPdfPreview';

export default function CVTool() {
  const {
    resumes,
    activeId,
    activeCV,
    switchCV,
    createCV,
    duplicateCV,
    renameCV,
    deleteCV,
    updateActiveData: setCvData,
    updateActiveTemplate: setTemplate,
    updateActiveRegionalMode: setRegionalMode,
    updateActiveCoverLetter: setCoverLetter,
    updateActiveJdKeywords: setJdKeywordInput,
  } = useCVDocuments();

  const cvData = activeCV.data;
  const template = activeCV.template;
  const regionalMode = activeCV.regionalMode;
  const coverLetter = activeCV.coverLetter || DEFAULT_COVER_LETTER;
  const jdKeywordInput = activeCV.jdKeywords || '';

  const [hasCompletedWizard, setHasCompletedWizard] = useLocalStorage<boolean>('cv_wizard_done_v1', false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSource, setImportSource] = useState<'cv' | 'linkedin'>('cv');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [useStepEditor, setUseStepEditor] = useLocalStorage<boolean>('cv_step_editor_v1', true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
  const [isPreviewShrunk, setIsPreviewShrunk] = useState(false);

  const { canUse, used, limit, increment } = useToolLimit('cv-builder');
  const { isPro } = usePlan();

  const selectedTpl = CV_TEMPLATES.find((t) => t.id === template)!;
  const accent = selectedTpl?.accent ?? '#1a1a2e';
  const jdKeywords = jdKeywordInput
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);

  const {
    blobUrl,
    setBlobUrl,
    isRendering,
    renderError,
    setRenderError,
    refreshPreview,
    handleExport,
  } = useCVPdfPreview({
    template,
    cvData,
    accent,
    canUse,
    increment,
    setShowUpgrade,
    setToast,
  });

  // Invalidate rendered preview whenever active CV changes
  useEffect(() => {
    setBlobUrl(null);
  }, [activeId, setBlobUrl]);

  // Handle template selection (gate Pro)
  const handleSelectTemplate = useCallback(
    (id: CVTemplate) => {
      const tpl = CV_TEMPLATES.find((t) => t.id === id)!;
      if (tpl.pro && !isPro) {
        setShowUpgrade(true);
        return;
      }
      setTemplate(id);
      setBlobUrl(null);
    },
    [isPro, setTemplate, setBlobUrl]
  );

  const handleImportLinkedIn = () => {
    setImportSource('linkedin');
    setToast({ message: 'Export your LinkedIn profile as a PDF, then upload it here. Your file stays on this device.', type: 'info' });
    setShowImportModal(true);
  };

  const handleImportCV = () => {
    setImportSource('cv');
    setShowImportModal(true);
  };

  const handleExportDocx = async () => {
    try {
      const blob = await exportCVToDocx(cvData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personal.fullName || 'cv'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setRenderError('Failed to export DOCX. Please try again.');
    }
  };

  const handleApplyImport = useCallback((parsedData: Partial<CVData>) => {
    setCvData((prev: CVData) => ({
      ...prev,
      ...parsedData,
      personal: {
        ...prev.personal,
        ...Object.fromEntries(
          Object.entries(parsedData.personal || {}).filter(([, value]) => Boolean(value))
        ),
      },
      experience: parsedData.experience?.length ? parsedData.experience : prev.experience,
      education: parsedData.education?.length ? parsedData.education : prev.education,
      skills: parsedData.skills?.length ? parsedData.skills : prev.skills,
      certifications: parsedData.certifications?.length ? parsedData.certifications : prev.certifications,
    }));
    setHasCompletedWizard(true);
    setBlobUrl(null);
  }, [setCvData, setHasCompletedWizard, setBlobUrl]);

  const handleWizardComplete = useCallback((config: CVStartupConfig) => {
    const tailoredCv = generateCVFromStartupConfig(config);
    setCvData(tailoredCv);
    setTemplate(config.experienceLevel === 'executive' && isPro ? 'executive' : 'classic');
    setHasCompletedWizard(true);
    setBlobUrl(null);
  }, [isPro, setCvData, setHasCompletedWizard, setTemplate, setBlobUrl]);

  if (!hasCompletedWizard) {
    return (
      <CVWizard
        onComplete={handleWizardComplete}
        onSkip={() => setHasCompletedWizard(true)}
      />
    );
  }

  return (
    <div className={`cv-tool ${isPreviewShrunk ? 'cv-tool--preview-shrunk' : ''}`}>
      {/* ---- Left rail: template picker + actions ---- */}
      <CVLeftRail
        template={template}
        onSelectTemplate={handleSelectTemplate}
        isPro={isPro}
        onRefreshPreview={refreshPreview}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExport}
        isRendering={isRendering}
        canUse={canUse}
        used={used}
        limit={limit}
        renderError={renderError}
      />

      {/* ---- Main editor ---- */}
      <div className="cv-sidebar">
        <CVTopBar
          resumes={resumes}
          activeCV={activeCV}
          onSwitch={(id) => {
            switchCV(id);
            setBlobUrl(null);
          }}
          onCreateNew={(title) => {
            createCV(title);
            setBlobUrl(null);
            setToast({ message: 'Created new resume. You can rename it anytime.', type: 'info' });
          }}
          onDuplicate={(id) => {
            const dup = duplicateCV(id);
            setBlobUrl(null);
            if (dup) {
              setToast({ message: `Duplicated as "${dup.title}"`, type: 'info' });
            }
          }}
          onRename={renameCV}
          onDelete={(id) => {
            deleteCV(id);
            setBlobUrl(null);
            setToast({ message: 'Resume deleted', type: 'info' });
          }}
          onRestartGuide={() => setHasCompletedWizard(false)}
          useStepEditor={useStepEditor}
          setUseStepEditor={setUseStepEditor}
          onImportLinkedIn={handleImportLinkedIn}
          onImportCV={handleImportCV}
          onOpenLibrary={() => setShowLibrary(true)}
          onOpenCoverLetter={() => setShowCoverLetter(true)}
          used={used}
          limit={limit}
        />

        <div className="cv-sidebar__scroll">
          {useStepEditor ? (
            <CVStepEditor data={cvData} onChange={setCvData} regionalMode={regionalMode} />
          ) : (
            <CVEditor data={cvData} onChange={setCvData} regionalMode={regionalMode} />
          )}
          <div className="cv-editor-tools">
            <CVRegionalToggle value={regionalMode} onChange={setRegionalMode} />
            <div className="cv-jd-keywords">
              <label className="cv-jd-keywords__label">Job description keywords</label>
              <textarea
                className="cv-jd-keywords__input"
                value={jdKeywordInput}
                onChange={(e) => setJdKeywordInput(e.target.value)}
                placeholder="React, TypeScript, product strategy…"
                rows={3}
              />
            </div>
            <CVATSPanel data={cvData} jdKeywords={jdKeywords} />
          </div>
        </div>
      </div>

      {/* ---- Right: PDF preview ---- */}
      <div className="cv-preview">
        <div className="cv-preview__toolbar">
          <div>
            <span className="cv-preview__title">Live preview</span>
            <span className="cv-preview__status">{blobUrl ? 'Ready to review' : 'Refresh after editing'}</span>
          </div>
          <button
            className="cv-btn cv-btn--ghost cv-btn--sm"
            onClick={() => setIsPreviewShrunk((prev) => !prev)}
            aria-pressed={isPreviewShrunk}
            title={isPreviewShrunk ? 'Show larger preview' : 'Shrink preview and enlarge editor'}
          >
            {isPreviewShrunk ? '↗ Expand preview' : '↙ Shrink preview'}
          </button>
        </div>
        <CVPdfViewer blobUrl={blobUrl} />
      </div>

      {/* ---- Upgrade Modal ---- */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      
      {/* ---- Import Modal ---- */}
      {showImportModal && (
        <CVImportModal
          onClose={() => setShowImportModal(false)}
          onApply={handleApplyImport}
          source={importSource}
        />
      )}

      {showLibrary && (
        <div className="cv-modal-overlay" onClick={() => setShowLibrary(false)}>
          <div className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
            <CVContentLibrary
              onInsert={(phrase) => {
                navigator.clipboard.writeText(phrase);
                setToast({ message: 'Copied to clipboard! Paste into your CV.', type: 'info' });
              }}
              onClose={() => setShowLibrary(false)}
            />
          </div>
        </div>
      )}

      {showCoverLetter && (
        <div className="cv-modal-overlay" onClick={() => setShowCoverLetter(false)}>
          <div className="cv-modal-content cv-modal-content--wide" onClick={(e) => e.stopPropagation()}>
            <CoverLetterEditor
              cvData={cvData}
              value={coverLetter}
              onChange={setCoverLetter}
              onClose={() => setShowCoverLetter(false)}
              onToast={(message, type = 'info') => setToast({ message, type })}
            />
          </div>
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
