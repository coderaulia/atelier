import { Icon } from '../utils';

export interface DocumentPreviewBarProps {
  isToolMode: boolean;
  docType: string;
  ActiveSocial: any;
  paper: string;
  isEditorMaximized: boolean;
  setIsEditorMaximized: (fn: (prev: boolean) => boolean) => void;
  fitPreview: () => void;
  setMobileTab: (tab: 'editor' | 'preview') => void;
  zoom: number;
  setZoom: (fn: (z: number) => number) => void;
  saving: boolean;
  saveSuccess: boolean;
  handleSaveDocument: (status: 'draft' | 'final') => void;
  handleImage: (fmt: string) => void;
  handleExportPDF: () => void;
  exportingPdf: boolean;
  socialSlides: any[];
  downloadAllSlides: (fmt: string) => void;
  handleCopyImage: () => void;
  copyState: string;
}

export function DocumentPreviewBar({
  isToolMode,
  docType,
  ActiveSocial,
  paper,
  isEditorMaximized,
  setIsEditorMaximized,
  fitPreview,
  setMobileTab,
  zoom,
  setZoom,
  saving,
  saveSuccess,
  handleSaveDocument,
  handleImage,
  handleExportPDF,
  exportingPdf,
  socialSlides,
  downloadAllSlides,
  handleCopyImage,
  copyState,
}: DocumentPreviewBarProps) {
  return (
    <div className="preview__bar">
      <button
        type="button"
        className="mobile-back-to-edit-btn"
        onClick={() => setMobileTab('editor')}
      >
        ← Edit Form
      </button>
      <span className="preview__bar-title">Preview</span>
      <span className="preview__bar-meta">
        {isToolMode
          ? 'Quick estimate'
          : docType === 'social'
          ? `${(ActiveSocial as any)?.width || 1080} × ${(ActiveSocial as any)?.height || 1080} · ${(ActiveSocial as any)?.kind}`
          : `${paper === 'a4' ? 'A4' : 'Letter'} · 8.5×11 in`}
      </span>
      <div className="preview__bar-spacer"></div>

      <button
        type="button"
        className={`preview-shrink-btn ${isEditorMaximized ? 'preview-shrink-btn--active' : ''}`}
        onClick={() => {
          setIsEditorMaximized((prev: boolean) => !prev);
          setTimeout(fitPreview, 80);
        }}
        title={isEditorMaximized ? 'Expand preview size' : 'Shrink preview (maximize editor)'}
        aria-label={isEditorMaximized ? 'Expand preview' : 'Shrink preview'}
      >
        {isEditorMaximized ? '⇥ Expand Preview' : '⇤ Shrink Preview'}
      </button>

      {!isToolMode && (
        <div className="zoom-group">
          <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}>
            {Icon.zoomOut}
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn zoom-btn--fit" onClick={fitPreview}>
            Fit
          </button>
          <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.min(1.4, z + 0.1))}>
            {Icon.zoomIn}
          </button>
        </div>
      )}

      {isToolMode ? null : docType !== 'social' ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="export-btn export-btn--ghost"
            onClick={() => handleSaveDocument('draft')}
            disabled={saving}
            style={{ fontSize: 12, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Save this document to your cloud history"
          >
            {saveSuccess ? '✓ Saved' : saving ? 'Saving…' : '💾 Save'}
          </button>
          <button
            type="button"
            className="export-btn export-btn--ghost"
            onClick={() => handleImage('png')}
            style={{ fontSize: 12, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Download high-resolution PNG image"
          >
            {Icon.image} PNG
          </button>
          <button
            type="button"
            className="export-btn"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Download PDF directly to your device"
          >
            {exportingPdf ? (
              <>
                <span style={{ display: 'inline-block' }}>⏳</span>
                <span>Generating PDF…</span>
              </>
            ) : (
              <>
                {Icon.download} Export PDF
              </>
            )}
          </button>
        </div>
      ) : socialSlides.length > 1 ? (
        <>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--shell-muted)',
            }}
          >
            Hover a slide to download
          </span>
          <button className="export-btn export-btn--ghost" onClick={() => downloadAllSlides('png')}>
            {Icon.image} All · PNG
          </button>
          <button className="export-btn" onClick={() => downloadAllSlides('jpg')}>
            {Icon.download} All · JPG
          </button>
        </>
      ) : (
        <>
          <button className="export-btn export-btn--ghost" onClick={handleCopyImage}>
            {Icon.copy} {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Failed' : 'Copy'}
          </button>
          <button className="export-btn export-btn--ghost" onClick={() => handleImage('png')}>
            {Icon.image} PNG
          </button>
          <button className="export-btn" onClick={() => handleImage('jpg')}>
            {Icon.download} JPG
          </button>
        </>
      )}
    </div>
  );
}
