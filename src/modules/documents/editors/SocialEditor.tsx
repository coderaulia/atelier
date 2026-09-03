import React, { useState, useRef, Fragment } from 'react';
import { Field, TextInput, SectionTitle, ImageField } from '../utils';

function SocialMarkdownTextarea({ value, onChange, placeholder, rows }: any) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapText = (prefix: string, suffix: string = prefix, defaultPlaceholder = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || "";
    const selectedText = currentVal.substring(start, end);
    const textToWrap = selectedText || defaultPlaceholder;
    const replacement = `${prefix}${textToWrap}${suffix}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 0);
  };

  const insertNewline = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || "";
    const nextVal = currentVal.substring(0, start) + "\n" + currentVal.substring(end);
    onChange(nextVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapText('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapText('*', '*', 'italic text');
    }
  };

  return (
    <div className="social-md-textarea-wrap" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6,
          padding: '4px 8px',
          background: 'var(--shell-bg)',
          borderRadius: 6,
          border: '1px solid var(--shell-rule)',
        }}
      >
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--shell-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Markdown:
        </span>
        <button
          type="button"
          onClick={() => wrapText('**', '**', 'bold text')}
          style={{
            background: 'var(--shell-bg-2)',
            color: 'var(--shell-ink)',
            border: '1px solid var(--shell-rule)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Bold text (**text**) - Ctrl+B"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => wrapText('*', '*', 'italic text')}
          style={{
            background: 'var(--shell-bg-2)',
            color: 'var(--shell-ink)',
            border: '1px solid var(--shell-rule)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontStyle: 'italic',
            cursor: 'pointer',
          }}
          title="Italic text (*text*) - Ctrl+I"
        >
          I
        </button>
        <button
          type="button"
          onClick={insertNewline}
          style={{
            background: 'var(--shell-bg-2)',
            color: 'var(--shell-muted)',
            border: '1px solid var(--shell-rule)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
          }}
          title="Insert new line (↵)"
        >
          ↵ line
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--shell-muted)' }}>
          **bold** &amp; new lines
        </span>
      </div>

      <textarea
        ref={textareaRef}
        className="field__textarea"
        value={value || ""}
        placeholder={placeholder}
        rows={rows || 4}
        onChange={(e: any) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

export function SocialEditor({
  data,
  onChange,
  templates,
  activeId,
  setActiveId,
  recentId,
  setRecentId,
  defaults,
  onStepChange,
  isLocked,
}: any) {
  const [step, setStep] = useState("pick");
  const [search, setSearch] = useState("");
  const [filterKey, setFilterKey] = useState("all");

  const changeStep = (s: string) => {
    setStep(s);
    if (onStepChange) onStepChange(s);
    if (s === "edit") {
      document.querySelector(".editor__body")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeData = data[activeId] || (defaults && defaults[activeId]) || {};
  const setActive = (next: any) => onChange({ ...data, [activeId]: next });
  const set = (k: string, v: any) => setActive({ ...activeData, [k]: v });
  const active = (templates || []).find((t: any) => t.id === activeId);
  const fields = active ? active.fields : [];

  const TILE_W = 162;
  const catLabel: Record<string, string> = { square: "Instagram 1:1", vertical: "TikTok / Threads" };

  const allGroups: any[] = [];
  const seenAll = new Set<string>();
  (templates || []).forEach((t: any) => {
    const cat = t.category || "square";
    const kind = t.kind || "Single";
    const key = `${cat}·${kind}`;
    if (!seenAll.has(key)) {
      allGroups.push({ cat, kind, key, count: 0 });
      seenAll.add(key);
    }
    const group = allGroups.find((g: any) => g.key === key);
    if (group) group.count += 1;
  });

  const q = search.trim().toLowerCase();
  const filtered = (templates || []).filter((t: any) => {
    const matchSearch = !q || t.name.toLowerCase().includes(q);
    const matchFilter = filterKey === "all" || `${t.category || "square"}·${t.kind || "Single"}` === filterKey;
    return matchSearch && matchFilter;
  });

  const filteredGroups: any[] = [];
  const seenFiltered = new Set<string>();
  filtered.forEach((t: any) => {
    const cat = t.category || "square";
    const kind = t.kind || "Single";
    const key = `${cat}·${kind}`;
    if (!seenFiltered.has(key)) { filteredGroups.push({ cat, kind, key }); seenFiltered.add(key); }
  });

  const showGroupHeads = filteredGroups.length > 1;

  const renderTile = (t: any) => {
    const cat = t.category || "square";
    const tileData = data[t.id] || (defaults && defaults[t.id]) || {};
    const brand = (window as any).__brand || {};
    const firstSlide = t.slides({ data: tileData, brand })[0];
    const tplW = t.width || 1080;
    const tplH = t.height || 1080;
    const scale = TILE_W / tplW;
    const locked = isLocked ? isLocked(t) : false;
    return (
      <button
        key={t.id}
        className={"social-grid__tile " + (cat === "vertical" ? "social-grid__tile--vertical " : "") + (t.id === activeId ? "social-grid__tile--active " : "") + (t.id === recentId ? "social-grid__tile--recent" : "")}
        style={{ aspectRatio: `${tplW} / ${tplH}` }}
        onClick={() => {
          if (locked) { setActiveId(t.id); return; }
          setActiveId(t.id); if (setRecentId) setRecentId(t.id); changeStep("edit");
        }}
        title={locked ? `${t.name} — Pro only` : t.name}
      >
        {locked && <span className="social-grid__pro-badge">PRO</span>}
        {t.id === recentId && !locked && <span className="social-grid__recent-badge">Recent</span>}
        <div className="social-grid__tile-thumb" style={{ width: tplW, height: tplH, transform: `scale(${scale})` }}>
          {firstSlide}
        </div>
        <div className="social-grid__tile-label">
          <span>{t.name}</span>
          <span style={{ opacity: 0.6 }}>{t.kind}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="social-flow" data-step={step}>
      <div className="social-flow__track">

        {/* Panel 1: Pick */}
        <div className="social-flow__panel">
          <div className="social-search">
            <div className="social-search__input-wrap">
              <svg className="social-search__icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="social-search__input"
                type="text"
                placeholder="Search templates…"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />
              {search && (
                <button className="social-search__clear" onClick={() => setSearch("")}>×</button>
              )}
            </div>
            <div className="social-search__filters">
              <button
                className={"social-search__pill" + (filterKey === "all" ? " social-search__pill--active" : "")}
                onClick={() => setFilterKey("all")}
              >All <span className="social-search__pill-count">{(templates || []).length}</span></button>
              {allGroups.map((g: any) => (
                <button
                  key={g.key}
                  className={"social-search__pill" + (filterKey === g.key ? " social-search__pill--active" : "")}
                  onClick={() => setFilterKey(filterKey === g.key ? "all" : g.key)}
                >{catLabel[g.cat] || g.cat} · {g.kind} <span className="social-search__pill-count">{g.count}</span></button>
              ))}
            </div>
          </div>

          <div className="social-grid">
            {filtered.length === 0 ? (
              <div className="social-grid__empty">No templates match "{search}"</div>
            ) : filteredGroups.map(({ cat, kind, key }: any) => (
              <Fragment key={key}>
                {showGroupHeads && (
                  <div className="social-grid__group-head">
                    {catLabel[cat] || cat} · {kind}
                  </div>
                )}
                {filtered.filter((t: any) => (t.category || "square") === cat && (t.kind || "Single") === kind).map(renderTile)}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Panel 2: Edit */}
        <div className="social-flow__panel">
          <div className="social-active-head">
            <button className="social-back-btn" onClick={() => changeStep("pick")}>← Back</button>
            <div className="social-active-meta">
              <span className="social-active-kind">{active ? active.kind : ""}</span>
              <span className="social-active-name">{active ? active.name : ""}</span>
            </div>
          </div>
          <SectionTitle>Content</SectionTitle>
          {fields.map((f: any) => (
            <Fragment key={f.key}>
              {f.type === "image" ? (
                <ImageField label={f.label} hint={f.hint} value={activeData[f.key]} onChange={(v: any) => set(f.key, v)} />
              ) : f.type === "select" ? (
                <Field label={f.label} hint={f.hint}>
                  <select className="field__select" value={activeData[f.key] || ""} onChange={(e: any) => set(f.key, e.target.value)}>
                    {(f.options || []).map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label={f.label} hint={f.hint}>
                  {f.type === "textarea"
                    ? <SocialMarkdownTextarea value={activeData[f.key]} onChange={(v: any) => set(f.key, v)} placeholder={f.placeholder} />
                    : <TextInput value={activeData[f.key]} onChange={(v: any) => set(f.key, v)} placeholder={f.placeholder} />}
                </Field>
              )}
            </Fragment>
          ))}
        </div>

      </div>
    </div>
  );
}
