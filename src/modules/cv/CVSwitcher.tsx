import React, { useState, useRef, useEffect } from 'react';
import type { StoredCVRecord } from './types';

interface CVSwitcherProps {
  resumes: StoredCVRecord[];
  activeCV: StoredCVRecord;
  onSwitch: (id: string) => void;
  onCreateNew: (title?: string) => void;
  onDuplicate: (id?: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CVSwitcher({
  resumes,
  activeCV,
  onSwitch,
  onCreateNew,
  onDuplicate,
  onRename,
  onDelete,
}: CVSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
        setConfirmDeleteId(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (e: React.MouseEvent, cv: StoredCVRecord) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setEditingId(cv.id);
    setEditTitle(cv.title);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="cv-doc-switcher" ref={containerRef}>
      <button
        type="button"
        className={`cv-doc-switcher__trigger ${isOpen ? 'cv-doc-switcher__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Switch or manage saved CVs"
        aria-expanded={isOpen}
      >
        <span className="cv-doc-switcher__icon">📄</span>
        <span className="cv-doc-switcher__title" title={activeCV.title}>
          {activeCV.title}
        </span>
        <span className="cv-doc-switcher__caret">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="cv-doc-switcher__menu">
          <div className="cv-doc-switcher__header">
            <span className="cv-doc-switcher__header-title">
              Saved Resumes ({resumes.length})
            </span>
            <button
              type="button"
              className="cv-btn cv-btn--ghost cv-btn--sm"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              title="Create a new resume"
            >
              + New
            </button>
          </div>

          <div className="cv-doc-switcher__list">
            {resumes.map((cv) => {
              const isActive = cv.id === activeCV.id;
              const isEditing = cv.id === editingId;
              const isConfirmingDelete = cv.id === confirmDeleteId;

              if (isEditing) {
                return (
                  <form
                    key={cv.id}
                    className="cv-doc-switcher__item cv-doc-switcher__item--editing"
                    onSubmit={handleSaveRename}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      className="cv-doc-switcher__input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      placeholder="Resume title…"
                    />
                    <div className="cv-doc-switcher__edit-actions">
                      <button
                        type="submit"
                        className="cv-doc-action-btn cv-doc-action-btn--confirm"
                        title="Save title"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        className="cv-doc-action-btn"
                        onClick={handleCancelRename}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={cv.id}
                  className={`cv-doc-switcher__item ${isActive ? 'cv-doc-switcher__item--active' : ''}`}
                  onClick={() => {
                    if (!isActive) {
                      onSwitch(cv.id);
                    }
                    setIsOpen(false);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSwitch(cv.id);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="cv-doc-switcher__item-info">
                    <div className="cv-doc-switcher__item-top">
                      {isActive && <span className="cv-doc-switcher__active-dot" title="Active" />}
                      <span className="cv-doc-switcher__item-title">{cv.title}</span>
                    </div>
                    <div className="cv-doc-switcher__item-meta">
                      <span>{formatRelativeTime(cv.updatedAt)}</span>
                      <span className="cv-doc-switcher__bullet">•</span>
                      <span className="cv-doc-switcher__tag">{cv.template}</span>
                      {cv.regionalMode === 'indonesia' && (
                        <>
                          <span className="cv-doc-switcher__bullet">•</span>
                          <span className="cv-doc-switcher__tag">ID</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="cv-doc-switcher__item-actions" onClick={(e) => e.stopPropagation()}>
                    {isConfirmingDelete ? (
                      <div className="cv-doc-switcher__confirm-delete">
                        <span className="cv-doc-switcher__confirm-text">Delete?</span>
                        <button
                          type="button"
                          className="cv-doc-action-btn cv-doc-action-btn--delete"
                          onClick={(e) => handleDeleteClick(e, cv.id)}
                          title="Confirm delete"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="cv-doc-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          title="Cancel"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="cv-doc-action-btn"
                          onClick={(e) => handleStartRename(e, cv)}
                          title="Rename resume"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="cv-doc-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(cv.id);
                            setIsOpen(false);
                          }}
                          title="Duplicate resume"
                        >
                          📋
                        </button>
                        {resumes.length > 1 && (
                          <button
                            type="button"
                            className="cv-doc-action-btn cv-doc-action-btn--danger"
                            onClick={(e) => handleDeleteClick(e, cv.id)}
                            title="Delete resume"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cv-doc-switcher__footer">
            <button
              type="button"
              className="cv-btn cv-btn--ghost cv-btn--sm cv-doc-switcher__footer-btn"
              onClick={() => {
                onDuplicate(activeCV.id);
                setIsOpen(false);
              }}
            >
              <span>📋</span> Duplicate Active CV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
