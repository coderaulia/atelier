import { useState, useCallback, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CVData, CVTemplate, CV_TEMPLATES, DEFAULT_CV, generateCVFromStartupConfig, type CVStartupConfig, type CVRegionalMode } from './types';
import { CVEditor } from './CVEditor';
import CVStepEditor from './CVStepEditor';
import CVATSPanel from './CVATSPanel';
import CVRegionalToggle from './CVRegionalToggle';
import CVContentLibrary from './CVContentLibrary';
import CVWizard from './CVWizard';
import {
  ClassicTemplate,
  ModernTemplate,
  MinimalTemplate,
  AtsOptimizedTemplate,
  ExecutiveTemplate,
  CreativeTemplate,
} from './templates';
import { useLocalStorage } from '../documents/utils';
import { useToolLimit } from '../../hooks/useToolLimit';
import { usePlan } from '../../hooks/usePlan';
import UpgradeModal from '../../components/UpgradeModal';
import CVImportModal from './CVImportModal';
import Toast from '../../components/Toast';
import { validateCVData } from '../../lib/fileValidation';
import { getFriendlyErrorMessage } from '../../lib/errorHandler';

// ---------- Template renderer map ----------
function renderTemplate(templateId: CVTemplate, data: CVData, accent: string) {
  switch (templateId) {
    case 'classic':    return <ClassicTemplate   data={data} accent={accent} />;
    case 'modern':     return <ModernTemplate    data={data} accent={accent} />;
    case 'minimal':    return <MinimalTemplate   data={data} accent={accent} />;
    case 'ats':        return <AtsOptimizedTemplate data={data} accent={accent} />;
    case 'executive':  return <ExecutiveTemplate data={data} accent={accent} />;
    case 'creative':   return <CreativeTemplate  data={data} accent={accent} />;
    default:           return <ClassicTemplate   data={data} accent={accent} />;
  }
}

// ---------- PDF preview via blob URL -> iframe ----------
function PDFPreview({ blobUrl }: { blobUrl: string | null }) {
  if (!blobUrl) {
    return (
      <div className="cv-preview__placeholder">
        <div className="cv-preview__icon">📄</div>
        <p>Click <strong>Refresh Preview</strong> to render PDF</p>
      </div>
    );
  }
  return (
    <iframe
      src={blobUrl}
      className="cv-preview__iframe"
      title="CV Preview"
    />
  );
}

// ---------- Template Picker ----------
function TemplatePicker({
  current,
  onSelect,
  isPro,
}: {
  current: CVTemplate;
  onSelect: (id: CVTemplate) => void;
  isPro: boolean;
}) {
  return (
    <div className="cv-template-grid">
      {CV_TEMPLATES.map((tpl) => {
        const locked = tpl.pro && !isPro;
        return (
          <button
            key={tpl.id}
            className={`cv-template-card ${current === tpl.id ? 'cv-template-card--active' : ''} ${locked ? 'cv-template-card--locked' : ''}`}
            onClick={() => onSelect(tpl.id)}
            title={locked ? 'Upgrade to Pro to unlock' : tpl.description}
            style={{ borderColor: current === tpl.id ? tpl.accent : undefined }}
          >
            <span className="cv-template-card__swatch" style={{ backgroundColor: tpl.accent }} />
            <span className="cv-template-card__name">{tpl.name}</span>
            {locked && (
              <span className="cv-template-card__lock">
                🔒 Pro
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Main CVTool Component ----------
export default function CVTool() {
  const [cvData, setCvData] = useLocalStorage<CVData>('cv_data_v1', DEFAULT_CV);
  const [template, setTemplate] = useLocalStorage<CVTemplate>('cv_template_v1', 'classic');
  const [hasCompletedWizard, setHasCompletedWizard] = useLocalStorage<boolean>('cv_wizard_done_v1', false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [useStepEditor, setUseStepEditor] = useLocalStorage<boolean>('cv_step_editor_v1', true);
  const [regionalMode, setRegionalMode] = useLocalStorage<CVRegionalMode>('cv_regional_mode_v1', 'international');
  const [jdKeywordInput, setJdKeywordInput] = useLocalStorage<string>('cv_jd_keywords_v1', '');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
  const prevBlobRef = useRef<string | null>(null);

  const { canUse, used, limit, increment } = useToolLimit('cv');
  const { isPro } = usePlan();

  const selectedTpl = CV_TEMPLATES.find((t) => t.id === template)!;
  const accent = selectedTpl?.accent ?? '#1a1a2e';
  const jdKeywords = jdKeywordInput
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);

  // ---------- Handle template selection (gate Pro) ----------
  const handleSelectTemplate = useCallback(
    (id: CVTemplate) => {
      const tpl = CV_TEMPLATES.find((t) => t.id === id)!;
      if (tpl.pro && !isPro) {
        setShowUpgrade(true);
        return;
      }
      setTemplate(id);
      // Invalidate preview when template changes
      setBlobUrl(null);
    },
    [isPro, setTemplate]
  );

  // ---------- Render PDF blob ----------
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
  }, [template, cvData, accent]);

  // ---------- Export PDF (gated by useToolLimit) ----------
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
  }, [canUse, increment, template, cvData, accent]);

  // ---------- Import handlers ----------
  const handleImportLinkedIn = () => {
    setShowImportMenu(false);
    setToast({ message: "LinkedIn import via OAuth is on the roadmap. Paste your LinkedIn profile URL and we'll guide you through export.", type: 'info' });
  };

  const handleImportCV = () => {
    setShowImportMenu(false);
    setShowImportModal(true);
  };

  const handleApplyImport = useCallback((parsedData: Partial<CVData>) => {
    setCvData((prev: CVData) => ({
      ...prev,
      ...parsedData,
      personal: { ...prev.personal, ...parsedData.personal },
      experience: parsedData.experience?.length ? parsedData.experience : prev.experience,
      education: parsedData.education?.length ? parsedData.education : prev.education,
      skills: parsedData.skills?.length ? parsedData.skills : prev.skills,
      certifications: parsedData.certifications?.length ? parsedData.certifications : prev.certifications,
    }));
    setHasCompletedWizard(true);
    setBlobUrl(null); // Invalidate preview
  }, [setCvData, setHasCompletedWizard]);

  const handleWizardComplete = useCallback((config: CVStartupConfig) => {
    const tailoredCv = generateCVFromStartupConfig(config);
    setCvData(tailoredCv);
    setTemplate(config.experienceLevel === 'executive' && isPro ? 'executive' : 'classic');
    setHasCompletedWizard(true);
    setBlobUrl(null);
  }, [isPro, setCvData, setHasCompletedWizard, setTemplate]);

  if (!hasCompletedWizard) {
    return (
      <CVWizard
        onComplete={handleWizardComplete}
        onSkip={() => setHasCompletedWizard(true)}
      />
    );
  }

  return (
    <div className="cv-tool">
      {/* ---- Sidebar: editor ---- */}
      <div className="cv-sidebar">
        <div className="cv-sidebar__header">
          <div className="cv-sidebar__title-row">
            <span className="cv-sidebar__title">CV Builder</span>
            <div className="cv-sidebar__actions">
              <button
                className="cv-btn cv-btn--ghost cv-btn--sm"
                onClick={() => setHasCompletedWizard(false)}
                title="Restart guided setup"
              >
                Guide
              </button>
              <button
                className="cv-btn cv-btn--ghost cv-btn--sm"
                onClick={() => setUseStepEditor((prev: boolean) => !prev)}
                title={useStepEditor ? 'Show full form' : 'Show guided steps'}
              >
                {useStepEditor ? 'Full' : 'Steps'}
              </button>
              {/* Import menu */}
              <div className="cv-import-wrap">
                <button
                  className="cv-btn cv-btn--ghost cv-btn--sm"
                  onClick={() => setShowImportMenu(!showImportMenu)}
                >
                  Import ↓
                </button>
                {showImportMenu && (
                  <div className="cv-import-menu">
                    <button className="cv-import-menu__item" onClick={handleImportLinkedIn}>
                      <span>🔗</span> From LinkedIn
                    </button>
                    <button className="cv-import-menu__item" onClick={handleImportCV}>
                      <span>📄</span> From existing CV
                    </button>
                  </div>
                )}
              </div>
              <button
                className="cv-btn cv-btn--ghost cv-btn--sm"
                onClick={() => setShowLibrary(true)}
                title="Browse content library"
              >
                📚 Library
              </button>
            </div>
          </div>
          {/* Usage indicator */}
          <div className="cv-usage-bar">
            <span className="cv-usage-bar__label">
              PDF exports: {used}/{limit} today
            </span>
            <div className="cv-usage-bar__track">
              <div
                className="cv-usage-bar__fill"
                style={{ width: `${Math.min((used / (limit ?? 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="cv-sidebar__scroll">
          {useStepEditor ? (
            <CVStepEditor data={cvData} onChange={setCvData} regionalMode={regionalMode} />
          ) : (
            <CVEditor data={cvData} onChange={setCvData} regionalMode={regionalMode} />
          )}
        </div>
      </div>

      {/* ---- Center: template picker + preview actions ---- */}
      <div className="cv-center">
        <div className="cv-center__top">
          <p className="cv-center__sub">Choose Template</p>
          <TemplatePicker
            current={template}
            onSelect={handleSelectTemplate}
            isPro={isPro}
          />
          <div className="cv-center__btns">
            <button
              className="cv-btn cv-btn--ghost"
              onClick={refreshPreview}
              disabled={isRendering}
            >
              {isRendering ? 'Rendering…' : '↺ Refresh Preview'}
            </button>
            <button
              className={`cv-btn cv-btn--primary ${!canUse ? 'cv-btn--locked' : ''}`}
              onClick={handleExport}
              disabled={isRendering}
              title={!canUse ? `Daily limit reached (${used}/${limit})` : 'Download PDF'}
            >
              {isRendering ? 'Exporting…' : !canUse ? '🔒 Limit Reached' : '↓ Export PDF'}
            </button>
          </div>
          {renderError && (
            <div className="cv-error">{renderError}</div>
          )}

          <CVRegionalToggle value={regionalMode} onChange={setRegionalMode} />

          <div className="cv-jd-keywords">
            <label className="cv-jd-keywords__label">Job description keywords</label>
            <textarea
              className="cv-jd-keywords__input"
              value={jdKeywordInput}
              onChange={(e) => setJdKeywordInput(e.target.value)}
              placeholder="Paste target keywords, comma-separated or one per line: React, TypeScript, product strategy..."
              rows={3}
            />
          </div>

          <CVATSPanel data={cvData} jdKeywords={jdKeywords} />
        </div>
      </div>

      {/* ---- Right: PDF preview ---- */}
      <div className="cv-preview">
        <PDFPreview blobUrl={blobUrl} />
      </div>

      {/* ---- Upgrade Modal ---- */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      
      {/* ---- Import Modal ---- */}
      {showImportModal && (
        <CVImportModal
          onClose={() => setShowImportModal(false)}
          onApply={handleApplyImport}
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

      {/* Toast notification */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'error'}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
