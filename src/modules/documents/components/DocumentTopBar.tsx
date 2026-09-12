export interface DocumentTopBarProps {
  docType: string;
  socialStep: string;
  ActiveSocial: any;
  cfg: any;
  variant: string;
  setVariant: (v: string) => void;
  isEditorMaximized: boolean;
  setIsEditorMaximized: (fn: (prev: boolean) => boolean) => void;
  fitPreview: () => void;
  mobileTab: 'editor' | 'preview';
  setMobileTab: (tab: 'editor' | 'preview') => void;
  activeDraftId: string;
  setActiveDraftId: (id: string) => void;
  drafts: any[];
  setDrafts: (drafts: any[]) => void;
  data: any;
  activeTab: 'editor' | 'history' | 'bulk';
  setActiveTab: (t: 'editor' | 'history' | 'bulk') => void;
  docStore: any;
  variants: readonly { id: string; name: string }[];
}

export function DocumentTopBar({
  docType,
  socialStep,
  ActiveSocial,
  cfg,
  variant,
  setVariant,
  isEditorMaximized,
  setIsEditorMaximized,
  fitPreview,
  mobileTab,
  setMobileTab,
  activeDraftId,
  setActiveDraftId,
  drafts,
  setDrafts,
  data,
  activeTab,
  setActiveTab,
  docStore,
  variants,
}: DocumentTopBarProps) {
  return (
    <div className="editor__head">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="editor__crumb">
            {docType === 'social'
              ? socialStep === 'pick'
                ? 'Social · Browse'
                : `Social · ${(ActiveSocial as any)?.kind || 'Single'}`
              : cfg?.isTool
              ? 'Tools'
              : `${cfg?.name} · ${variants.find((v) => v.id === variant)?.name}`}
          </div>
          <h1 className="editor__title">
            {docType === 'social'
              ? socialStep === 'pick'
                ? 'Choose a template'
                : (ActiveSocial as any)?.name || 'Template'
              : cfg?.isTool
              ? cfg.name
              : (data as any)?.title || (data as any)?.projectName || (data as any)?.clientName || cfg?.name}
          </h1>
        </div>
        <button
          type="button"
          className={`editor-maximize-btn ${isEditorMaximized ? 'editor-maximize-btn--active' : ''}`}
          onClick={() => {
            setIsEditorMaximized((prev: boolean) => !prev);
            setTimeout(fitPreview, 80);
          }}
          title={isEditorMaximized ? 'Restore preview size' : 'Maximize editor (shrink preview)'}
          aria-label={isEditorMaximized ? 'Restore preview' : 'Maximize editor'}
        >
          {isEditorMaximized ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h6v6" />
                <path d="M20 10h-6V4" />
                <path d="M14 10l7-7" />
                <path d="M3 21l7-7" />
              </svg>
              <span>Restore</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
              <span>Maximize</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile View Switcher */}
      {(docType !== 'social' || socialStep === 'edit') && !cfg?.isTool && (
        <div className="mobile-tab-switch">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'editor' ? 'mobile-tab-btn--active' : ''}`}
            onClick={() => setMobileTab('editor')}
          >
            ✍️ Edit Form
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'preview' ? 'mobile-tab-btn--active' : ''}`}
            onClick={() => {
              setMobileTab('preview');
              setTimeout(fitPreview, 60);
            }}
          >
            👁️ Preview & Export
          </button>
        </div>
      )}

      {/* Drafts Row */}
      {!cfg?.isTool && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}>
          <select
            value={activeDraftId || ''}
            onChange={(e: any) => setActiveDraftId(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--shell-field-bg)',
              color: 'var(--shell-ink)',
              border: '1px solid var(--shell-rule)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            <option value="">Current local draft</option>
            {drafts
              .filter((d: any) => d.docType === docType)
              .map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
          <button
            onClick={() => {
              const name = prompt(
                'Enter draft name:',
                `Draft ${drafts.filter((d: any) => d.docType === docType).length + 1}`
              );
              if (!name) return;
              const newId = 'draft_' + Date.now();
              const newDraft = {
                id: newId,
                name,
                docType,
                lastModified: Date.now(),
                data: JSON.parse(JSON.stringify(data)),
              };
              setDrafts([...drafts, newDraft]);
              setActiveDraftId(newId);
            }}
            title="Save current as new draft"
            style={{
              background: 'var(--shell-btn-bg)',
              color: 'var(--shell-ink)',
              border: '1px solid var(--shell-rule)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ＋ New
          </button>
          {activeDraftId && (
            <>
              <button
                onClick={() => {
                  const activeD = drafts.find((d: any) => d.id === activeDraftId);
                  if (!activeD) return;
                  const name = prompt('Rename draft:', activeD.name);
                  if (!name) return;
                  setDrafts(drafts.map((d: any) => (d.id === activeDraftId ? { ...d, name } : d)));
                }}
                title="Rename draft"
                style={{
                  background: 'var(--shell-btn-bg)',
                  color: 'var(--shell-ink)',
                  border: '1px solid var(--shell-rule)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✎
              </button>
              <button
                onClick={() => {
                  const activeD = drafts.find((d: any) => d.id === activeDraftId);
                  if (!activeD) return;
                  if (!confirm(`Are you sure you want to delete "${activeD.name}"?`)) return;
                  setDrafts(drafts.filter((d: any) => d.id !== activeDraftId));
                  setActiveDraftId('');
                }}
                title="Delete draft"
                style={{
                  background: 'var(--shell-btn-bg)',
                  color: 'var(--vc-red)',
                  border: '1px solid var(--shell-rule)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🗑
              </button>
            </>
          )}
        </div>
      )}

      {/* Tabs & Variants */}
      {cfg?.hasVariants && !cfg?.isTool && (
        <div className="editor__variants" style={{ flexWrap: 'wrap', gap: '8px 12px' }}>
          <div className="bulk-tab-header" style={{ marginBottom: 0, marginRight: 16 }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              ✍️ Editor
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                docStore.refreshCounts();
              }}
            >
              📋 History ({docStore.totalCount})
            </button>
            {!cfg.isTool && docType !== 'social' && (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
                onClick={() => setActiveTab('bulk')}
              >
                ⚡ Bulk CSV
              </button>
            )}
          </div>
          {activeTab === 'editor' &&
            variants.map((v) => (
              <button
                key={v.id}
                className={'variant-pill ' + (variant === v.id ? 'variant-pill--active' : '')}
                onClick={() => setVariant(v.id)}
              >
                {v.name}
              </button>
            ))}
          {activeTab === 'bulk' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--shell-muted)' }}>Variant:</span>
              <select
                value={variant}
                onChange={(e: any) => setVariant(e.target.value)}
                style={{
                  background: 'var(--shell-field-bg)',
                  color: 'var(--shell-ink)',
                  border: '1px solid var(--shell-rule)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
