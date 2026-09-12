import { useState } from 'react';
import { CVSwitcher } from '../CVSwitcher';

export interface CVTopBarProps {
  resumes: any[];
  activeCV: any;
  onSwitch: (id: string) => void;
  onCreateNew: (title?: string) => void;
  onDuplicate: (id?: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onRestartGuide: () => void;
  useStepEditor: boolean;
  setUseStepEditor: (use: boolean) => void;
  onImportLinkedIn: () => void;
  onImportCV: () => void;
  onOpenLibrary: () => void;
  onOpenCoverLetter: () => void;
  used: number;
  limit: number | null;
}

export function CVTopBar({
  resumes,
  activeCV,
  onSwitch,
  onCreateNew,
  onDuplicate,
  onRename,
  onDelete,
  onRestartGuide,
  useStepEditor,
  setUseStepEditor,
  onImportLinkedIn,
  onImportCV,
  onOpenLibrary,
  onOpenCoverLetter,
  used,
  limit,
}: CVTopBarProps) {
  const [showImportMenu, setShowImportMenu] = useState(false);

  return (
    <div className="cv-sidebar__header">
      <div className="cv-sidebar__title-row">
        <div className="cv-sidebar__heading-group">
          <span className="cv-sidebar__title">CV Builder</span>
          <CVSwitcher
            resumes={resumes}
            activeCV={activeCV}
            onSwitch={onSwitch}
            onCreateNew={onCreateNew}
            onDuplicate={onDuplicate}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
        <div className="cv-sidebar__actions">
          <div className="cv-editor-mode" role="group" aria-label="Editor mode">
            <button
              className="cv-btn cv-btn--ghost cv-btn--sm"
              onClick={onRestartGuide}
              title="Restart guided setup"
            >
              ✦ Guide
            </button>
            <button
              className={`cv-btn cv-btn--ghost cv-btn--sm ${useStepEditor ? 'cv-btn--selected' : ''}`}
              onClick={() => setUseStepEditor(true)}
              title="Show guided steps"
              aria-pressed={useStepEditor}
            >
              Steps
            </button>
            <button
              className={`cv-btn cv-btn--ghost cv-btn--sm ${!useStepEditor ? 'cv-btn--selected' : ''}`}
              onClick={() => setUseStepEditor(false)}
              title="Show full form"
              aria-pressed={!useStepEditor}
            >
              Full form
            </button>
          </div>
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
                <button
                  className="cv-import-menu__item"
                  onClick={() => {
                    setShowImportMenu(false);
                    onImportLinkedIn();
                  }}
                >
                  <span>🔗</span> From LinkedIn
                </button>
                <button
                  className="cv-import-menu__item"
                  onClick={() => {
                    setShowImportMenu(false);
                    onImportCV();
                  }}
                >
                  <span>📄</span> From existing CV
                </button>
              </div>
            )}
          </div>
          <button
            className="cv-btn cv-btn--ghost cv-btn--sm"
            onClick={onOpenLibrary}
            title="Browse content library"
          >
            📚 Library
          </button>
          <button
            className="cv-btn cv-btn--ghost cv-btn--sm"
            onClick={onOpenCoverLetter}
            title="Generate a cover letter"
          >
            ✉️ Cover
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
  );
}
