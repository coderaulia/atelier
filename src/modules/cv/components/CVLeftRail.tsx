import { CVTemplate } from '../types';
import { TemplatePicker } from './TemplatePicker';

export interface CVLeftRailProps {
  template: CVTemplate;
  onSelectTemplate: (id: CVTemplate) => void;
  isPro: boolean;
  onRefreshPreview: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  isRendering: boolean;
  canUse: boolean;
  used: number;
  limit: number | null;
  renderError: string | null;
}

export function CVLeftRail({
  template,
  onSelectTemplate,
  isPro,
  onRefreshPreview,
  onExportDocx,
  onExportPdf,
  isRendering,
  canUse,
  used,
  limit,
  renderError,
}: CVLeftRailProps) {
  return (
    <div className="cv-center">
      <div className="cv-center__top">
        <div className="cv-center__heading">
          <p className="cv-center__sub">Choose template</p>
          <span className="cv-center__hint">Pick a style for your CV</span>
        </div>
        <TemplatePicker
          current={template}
          onSelect={onSelectTemplate}
          isPro={isPro}
        />
        <div className="cv-center__btns">
          <button
            className="cv-btn cv-btn--ghost"
            onClick={onRefreshPreview}
            disabled={isRendering}
          >
            {isRendering ? 'Rendering…' : '↺ Refresh Preview'}
          </button>
          <button
            className="cv-btn cv-btn--ghost"
            onClick={onExportDocx}
            title="Download Word document"
          >
            ↓ Export DOCX
          </button>
          <button
            className={`cv-btn cv-btn--primary ${!canUse ? 'cv-btn--locked' : ''}`}
            onClick={onExportPdf}
            disabled={isRendering}
            title={!canUse ? `Daily limit reached (${used}/${limit})` : 'Download PDF'}
          >
            {isRendering ? 'Exporting…' : !canUse ? '🔒 Limit Reached' : '↓ Export PDF'}
          </button>
        </div>
        {renderError && <div className="cv-error">{renderError}</div>}
      </div>
    </div>
  );
}
