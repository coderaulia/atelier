// Hybrid editors per document type
// Exports: AgreementEditor, InvoiceEditor, ProposalEditor, PRDEditor, SocialEditor

const { useState: _useState } = React;

/* ---------- AGREEMENT ---------- */
function AgreementEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Parties &amp; Scope</SectionTitle>
      <Field label="Project / Engagement title">
        <TextInput value={data.title} onChange={v => set("title", v)} placeholder="Brand identity engagement" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={v => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={v => set("clientAddress", v)} placeholder="221 Baker St, Suite 4&#10;Brooklyn, NY 11201" />
      </Field>
      <div className="field__row">
        <Field label="Agreement date">
          <TextInput type="date" value={data.date} onChange={v => set("date", v)} />
        </Field>
        <Field label="Reference no.">
          <TextInput value={data.refNo} onChange={v => set("refNo", v)} placeholder="AG-2026-014" />
        </Field>
      </div>

      <SectionTitle>Terms</SectionTitle>
      <Field label="Scope of work (markdown)" hint="Use ## for sections, ** for emphasis.">
        <Textarea value={data.scope} onChange={v => set("scope", v)} />
      </Field>
      <Field label="Deliverables (markdown)">
        <Textarea value={data.deliverables} onChange={v => set("deliverables", v)} />
      </Field>
      <Field label="Compensation &amp; payment (markdown)">
        <Textarea value={data.compensation} onChange={v => set("compensation", v)} />
      </Field>
      <Field label="Timeline (markdown)">
        <Textarea value={data.timeline} onChange={v => set("timeline", v)} />
      </Field>
      <Field label="Legal &amp; misc (markdown)">
        <Textarea value={data.legal} onChange={v => set("legal", v)} />
      </Field>

      <SectionTitle>Signatures</SectionTitle>
      <div className="field__row">
        <Field label="Your signatory">
          <TextInput value={data.signatoryName} onChange={v => set("signatoryName", v)} />
        </Field>
        <Field label="Client signatory">
          <TextInput value={data.clientSignatory} onChange={v => set("clientSignatory", v)} />
        </Field>
      </div>
    </>
  );
}

/* ---------- INVOICE ---------- */
function InvoiceEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const setItem = (i, k, v) => {
    const items = [...data.items];
    items[i] = { ...items[i], [k]: v };
    set("items", items);
  };
  const addItem = () => set("items", [...data.items, { desc: "", qty: 1, rate: 0 }]);
  const delItem = (i) => set("items", data.items.filter((_, j) => j !== i));

  return (
    <>
      <SectionTitle>Invoice header</SectionTitle>
      <Field label="Bill to (client name)">
        <TextInput value={data.clientName} onChange={v => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={v => set("clientAddress", v)} rows={3} />
      </Field>
      <div className="field__row">
        <Field label="Invoice no.">
          <TextInput value={data.invoiceNo} onChange={v => set("invoiceNo", v)} placeholder="INV-2026-014" />
        </Field>
        <Field label="Project ref">
          <TextInput value={data.projectRef} onChange={v => set("projectRef", v)} />
        </Field>
      </div>
      <div className="field__row">
        <Field label="Issued">
          <TextInput type="date" value={data.issuedAt} onChange={v => set("issuedAt", v)} />
        </Field>
        <Field label="Due">
          <TextInput type="date" value={data.dueAt} onChange={v => set("dueAt", v)} />
        </Field>
      </div>
      <Field label="Currency">
        <select className="field__select" value={data.currency} onChange={e => set("currency", e.target.value)}>
          <option>USD</option><option>EUR</option><option>GBP</option><option>IDR</option><option>SGD</option><option>AUD</option><option>CAD</option><option>JPY</option>
        </select>
      </Field>

      <SectionTitle>Line items</SectionTitle>
      <div className="lineitems">
        {data.items.map((it, i) => (
          <div className="lineitem" key={i}>
            <input className="field__input" value={it.desc} placeholder="Description" onChange={e => setItem(i, "desc", e.target.value)} />
            <input className="field__input" type="number" value={it.qty} onChange={e => setItem(i, "qty", e.target.value)} />
            <input className="field__input" type="number" value={it.rate} onChange={e => setItem(i, "rate", e.target.value)} />
            <button className="lineitem__del" onClick={() => delItem(i)}>{Icon.trash}</button>
          </div>
        ))}
        <button className="btn-add" onClick={addItem}>+ Add line item</button>
      </div>

      <SectionTitle>Adjustments</SectionTitle>
      <div className="field__row">
        <Field label="Tax %">
          <TextInput type="number" value={data.taxPct} onChange={v => set("taxPct", v)} />
        </Field>
        <Field label="Discount %">
          <TextInput type="number" value={data.discountPct} onChange={v => set("discountPct", v)} />
        </Field>
      </div>

      <SectionTitle>Notes</SectionTitle>
      <Field label="Payment notes (markdown)">
        <Textarea value={data.notes} onChange={v => set("notes", v)} />
      </Field>
    </>
  );
}

/* ---------- PROPOSAL ---------- */
function ProposalEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Cover</SectionTitle>
      <Field label="Proposal title">
        <TextInput value={data.title} onChange={v => set("title", v)} placeholder="A brand system for Atlas & Bell" />
      </Field>
      <Field label="Prepared for">
        <TextInput value={data.clientName} onChange={v => set("clientName", v)} />
      </Field>
      <div className="field__row">
        <Field label="Date">
          <TextInput type="date" value={data.date} onChange={v => set("date", v)} />
        </Field>
        <Field label="Reference">
          <TextInput value={data.refNo} onChange={v => set("refNo", v)} placeholder="P-2026-014" />
        </Field>
      </div>

      <SectionTitle>Content (markdown)</SectionTitle>
      <Field label="Executive summary">
        <Textarea value={data.summary} onChange={v => set("summary", v)} />
      </Field>
      <Field label="Understanding the brief">
        <Textarea value={data.understanding} onChange={v => set("understanding", v)} />
      </Field>
      <Field label="Approach &amp; methodology">
        <Textarea value={data.approach} onChange={v => set("approach", v)} />
      </Field>
      <Field label="Deliverables">
        <Textarea value={data.deliverables} onChange={v => set("deliverables", v)} />
      </Field>
      <Field label="Timeline">
        <Textarea value={data.timeline} onChange={v => set("timeline", v)} />
      </Field>
      <Field label="Investment &amp; terms">
        <Textarea value={data.investment} onChange={v => set("investment", v)} />
      </Field>
      <Field label="About / Why us">
        <Textarea value={data.about} onChange={v => set("about", v)} />
      </Field>
    </>
  );
}

/* ---------- PRD ---------- */
function PRDEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Document info</SectionTitle>
      <Field label="Feature / Product name">
        <TextInput value={data.title} onChange={v => set("title", v)} placeholder="Onboarding 2.0" />
      </Field>
      <Field label="One-line summary">
        <TextInput value={data.tagline} onChange={v => set("tagline", v)} placeholder="A guided first-run experience for new accounts." />
      </Field>
      <div className="field__row">
        <Field label="Author">
          <TextInput value={data.author} onChange={v => set("author", v)} />
        </Field>
        <Field label="Status">
          <select className="field__select" value={data.status} onChange={e => set("status", e.target.value)}>
            <option>Draft</option><option>In Review</option><option>Approved</option><option>Shipped</option>
          </select>
        </Field>
      </div>
      <div className="field__row">
        <Field label="Updated">
          <TextInput type="date" value={data.date} onChange={v => set("date", v)} />
        </Field>
        <Field label="Target release">
          <TextInput value={data.release} onChange={v => set("release", v)} placeholder="Q3 2026" />
        </Field>
      </div>

      <SectionTitle>Body (markdown)</SectionTitle>
      <Field label="Problem">
        <Textarea value={data.problem} onChange={v => set("problem", v)} />
      </Field>
      <Field label="Goals &amp; non-goals">
        <Textarea value={data.goals} onChange={v => set("goals", v)} />
      </Field>
      <Field label="User stories">
        <Textarea value={data.stories} onChange={v => set("stories", v)} />
      </Field>
      <Field label="Solution / Requirements">
        <Textarea value={data.solution} onChange={v => set("solution", v)} />
      </Field>
      <Field label="Success metrics">
        <Textarea value={data.metrics} onChange={v => set("metrics", v)} />
      </Field>
      <Field label="Risks &amp; open questions">
        <Textarea value={data.risks} onChange={v => set("risks", v)} />
      </Field>
    </>
  );
}

/* ---------- SOCIAL ---------- */
function SocialEditor({ data, onChange, templates, activeId, setActiveId, defaults, onStepChange }) {
  const [step, setStep] = _useState("pick");

  const changeStep = (s) => {
    setStep(s);
    if (onStepChange) onStepChange(s);
    if (s === "edit") {
      document.querySelector(".editor__body")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeData = data[activeId] || (defaults && defaults[activeId]) || {};
  const setActive = (next) => onChange({ ...data, [activeId]: next });
  const set = (k, v) => setActive({ ...activeData, [k]: v });
  const active = templates.find(t => t.id === activeId);
  const fields = active ? active.fields : [];

  const TILE_W = 162;
  const groups = [];
  const seen = new Set();
  templates.forEach(t => {
    const cat = t.category || "square";
    const kind = t.kind || "Single";
    const key = `${cat}·${kind}`;
    if (!seen.has(key)) { groups.push({ cat, kind, key }); seen.add(key); }
  });
  const catLabel = { square: "Instagram 1:1", vertical: "TikTok / Threads" };

  return (
    <div className="social-flow" data-step={step}>
      <div className="social-flow__track">

        {/* Panel 1: Pick */}
        <div className="social-flow__panel">
          <div className="social-grid">
            {groups.map(({ cat, kind, key }) => (
              <React.Fragment key={key}>
                <div className="social-grid__group-head">
                  {catLabel[cat] || cat} · {kind}
                </div>
                {templates.filter(t => (t.category || "square") === cat && (t.kind || "Single") === kind).map(t => {
                  const tileData = data[t.id] || (defaults && defaults[t.id]) || {};
                  const firstSlide = t.slides({ data: tileData, brand: window.__brand || {} })[0];
                  const tplW = t.width || 1080;
                  const tplH = t.height || 1080;
                  const scale = TILE_W / tplW;
                  return (
                    <button
                      key={t.id}
                      className={"social-grid__tile " + (cat === "vertical" ? "social-grid__tile--vertical " : "") + (t.id === activeId ? "social-grid__tile--active" : "")}
                      style={{ aspectRatio: `${tplW} / ${tplH}` }}
                      onClick={() => { setActiveId(t.id); changeStep("edit"); }}
                      title={t.name}
                    >
                      <div className="social-grid__tile-thumb" style={{ width: tplW, height: tplH, transform: `scale(${scale})` }}>
                        {firstSlide}
                      </div>
                      <div className="social-grid__tile-label">
                        <span>{t.name}</span>
                        <span style={{ opacity: 0.6 }}>{t.kind}</span>
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
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
          {fields.map(f => (
            <React.Fragment key={f.key}>
              {f.type === "image" ? (
                <ImageField label={f.label} hint={f.hint} value={activeData[f.key]} onChange={v => set(f.key, v)} />
              ) : (
                <Field label={f.label} hint={f.hint}>
                  {f.type === "textarea"
                    ? <Textarea value={activeData[f.key]} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
                    : <TextInput value={activeData[f.key]} onChange={v => set(f.key, v)} placeholder={f.placeholder} />}
                </Field>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
}

Object.assign(window, {
  AgreementEditor, InvoiceEditor, ProposalEditor, PRDEditor, SocialEditor,
});
