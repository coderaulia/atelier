import { useState } from 'react';
import { ROLE_GROUPS, GENERAL_PHRASES, LEADERSHIP, type ContentPhrase } from './cvPhraseLibrary';

interface Props {
  onInsert: (phrase: string) => void;
  onClose: () => void;
}

export default function CVContentLibrary({ onInsert, onClose }: Props) {
  const [activeGroup, setActiveGroup] = useState<string>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getPhrases = (): ContentPhrase[] => {
    if (activeGroup === 'general') return GENERAL_PHRASES;
    if (activeGroup === 'leadership') return LEADERSHIP;
    const found = ROLE_GROUPS.flatMap((g) => g.entries).find((e) => e.key === activeGroup);
    return found?.phrases ?? [];
  };

  const handleInsert = (phrase: ContentPhrase) => {
    onInsert(phrase.text);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="cv-library">
      <div className="cv-library__header">
        <span className="cv-library__title">Content Library</span>
        <button className="cv-btn cv-btn--ghost cv-btn--sm" onClick={onClose}>×</button>
      </div>

      <div className="cv-library__tabs">
        <button
          className={`cv-library__tab ${activeGroup === 'general' ? 'cv-library__tab--active' : ''}`}
          onClick={() => setActiveGroup('general')}
        >
          General
        </button>
        <button
          className={`cv-library__tab ${activeGroup === 'leadership' ? 'cv-library__tab--active' : ''}`}
          onClick={() => setActiveGroup('leadership')}
        >
          Leadership
        </button>
        {ROLE_GROUPS.map((group) =>
          group.entries.map((entry) => (
            <button
              key={entry.key}
              className={`cv-library__tab ${activeGroup === entry.key ? 'cv-library__tab--active' : ''}`}
              onClick={() => setActiveGroup(entry.key)}
            >
              {entry.label}
            </button>
          ))
        )}
      </div>

      <div className="cv-library__phrases">
        {getPhrases().map((phrase) => (
          <div
            key={phrase.id}
            className="cv-library__phrase"
            onClick={() => handleInsert(phrase)}
          >
            <div className="cv-library__phrase-text">{phrase.text}</div>
            <div className="cv-library__phrase-meta">
              <span className="cv-library__phrase-cat">{phrase.category}</span>
              {copiedId === phrase.id && <span className="cv-library__phrase-copied">✓ Inserted</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
