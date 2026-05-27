import { useState, Fragment } from 'react';
import { Field, TextInput, Textarea, SectionTitle, ImageField } from './utils';

/* ---------- AGREEMENT ---------- */
export function AgreementEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Parties &amp; Scope</SectionTitle>
      <Field label="Project / Engagement title">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="Brand identity engagement" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={(v: any) => set("clientAddress", v)} placeholder="221 Baker St, Suite 4&#10;Brooklyn, NY 11201" />
      </Field>
      <div className="field__row">
        <Field label="Agreement date">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Reference no.">
          <TextInput value={data.refNo} onChange={(v: any) => set("refNo", v)} placeholder="AG-2026-014" />
        </Field>
      </div>

      <SectionTitle>Terms</SectionTitle>
      <Field label="Scope of work (markdown)" hint="Use ## for sections, ** for emphasis.">
        <Textarea value={data.scope} onChange={(v: any) => set("scope", v)} />
      </Field>
      <Field label="Deliverables (markdown)">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Compensation &amp; payment (markdown)">
        <Textarea value={data.compensation} onChange={(v: any) => set("compensation", v)} />
      </Field>
      <Field label="Timeline (markdown)">
        <Textarea value={data.timeline} onChange={(v: any) => set("timeline", v)} />
      </Field>
      <Field label="Legal &amp; misc (markdown)">
        <Textarea value={data.legal} onChange={(v: any) => set("legal", v)} />
      </Field>

      <SectionTitle>Signatures</SectionTitle>
      <div className="field__row">
        <Field label="Your signatory">
          <TextInput value={data.signatoryName} onChange={(v: any) => set("signatoryName", v)} />
        </Field>
        <Field label="Client signatory">
          <TextInput value={data.clientSignatory} onChange={(v: any) => set("clientSignatory", v)} />
        </Field>
      </div>
    </>
  );
}

/* ---------- INVOICE ---------- */
export function InvoiceEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const setItem = (i: number, k: string, v: any) => {
    const items = [...data.items];
    items[i] = { ...items[i], [k]: v };
    set("items", items);
  };
  const addItem = () => set("items", [...data.items, { desc: "", qty: 1, rate: 0 }]);
  const delItem = (i: number) => set("items", data.items.filter((_: any, j: number) => j !== i));

  return (
    <>
      <SectionTitle>Invoice header</SectionTitle>
      <Field label="Bill to (client name)">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={(v: any) => set("clientAddress", v)} rows={3} />
      </Field>
      <div className="field__row">
        <Field label="Invoice no.">
          <TextInput value={data.invoiceNo} onChange={(v: any) => set("invoiceNo", v)} placeholder="INV-2026-014" />
        </Field>
        <Field label="Project ref">
          <TextInput value={data.projectRef} onChange={(v: any) => set("projectRef", v)} />
        </Field>
      </div>
      <div className="field__row">
        <Field label="Issued">
          <TextInput type="date" value={data.issuedAt} onChange={(v: any) => set("issuedAt", v)} />
        </Field>
        <Field label="Due">
          <TextInput type="date" value={data.dueAt} onChange={(v: any) => set("dueAt", v)} />
        </Field>
      </div>
      <Field label="Currency">
        <select className="field__select" value={data.currency} onChange={(e: any) => set("currency", e.target.value)}>
          <option>USD</option><option>EUR</option><option>GBP</option><option>IDR</option><option>SGD</option><option>AUD</option><option>CAD</option><option>JPY</option>
        </select>
      </Field>

      <SectionTitle>Line items</SectionTitle>
      <div className="lineitems">
        {data.items.map((it: any, i: number) => (
          <div className="lineitem" key={i}>
            <input className="field__input" value={it.desc} placeholder="Description" onChange={(e: any) => setItem(i, "desc", e.target.value)} />
            <input className="field__input" type="number" value={it.qty} onChange={(e: any) => setItem(i, "qty", e.target.value)} />
            <input className="field__input" type="number" value={it.rate} onChange={(e: any) => setItem(i, "rate", e.target.value)} />
            <button className="lineitem__del" onClick={() => delItem(i)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14h10l1-14"/>
              </svg>
            </button>
          </div>
        ))}
        <button className="btn-add" onClick={addItem}>+ Add line item</button>
      </div>

      <SectionTitle>Adjustments</SectionTitle>
      <div className="field__row">
        <Field label="Tax %">
          <TextInput type="number" value={data.taxPct} onChange={(v: any) => set("taxPct", v)} />
        </Field>
        <Field label="Discount %">
          <TextInput type="number" value={data.discountPct} onChange={(v: any) => set("discountPct", v)} />
        </Field>
      </div>

      <SectionTitle>Notes</SectionTitle>
      <Field label="Payment notes (markdown)">
        <Textarea value={data.notes} onChange={(v: any) => set("notes", v)} />
      </Field>
    </>
  );
}

/* ---------- PROPOSAL ---------- */
export function ProposalEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Cover</SectionTitle>
      <Field label="Proposal title">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="A brand system for Atlas & Bell" />
      </Field>
      <Field label="Prepared for">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} />
      </Field>
      <div className="field__row">
        <Field label="Date">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Reference">
          <TextInput value={data.refNo} onChange={(v: any) => set("refNo", v)} placeholder="P-2026-014" />
        </Field>
      </div>

      <SectionTitle>Content (markdown)</SectionTitle>
      <Field label="Executive summary">
        <Textarea value={data.summary} onChange={(v: any) => set("summary", v)} />
      </Field>
      <Field label="Understanding the brief">
        <Textarea value={data.understanding} onChange={(v: any) => set("understanding", v)} />
      </Field>
      <Field label="Approach &amp; methodology">
        <Textarea value={data.approach} onChange={(v: any) => set("approach", v)} />
      </Field>
      <Field label="Deliverables">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Timeline">
        <Textarea value={data.timeline} onChange={(v: any) => set("timeline", v)} />
      </Field>
      <Field label="Investment &amp; terms">
        <Textarea value={data.investment} onChange={(v: any) => set("investment", v)} />
      </Field>
      <Field label="About / Why us">
        <Textarea value={data.about} onChange={(v: any) => set("about", v)} />
      </Field>
    </>
  );
}

/* ---------- PRD ---------- */
export function PRDEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Document info</SectionTitle>
      <Field label="Feature / Product name">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="Onboarding 2.0" />
      </Field>
      <Field label="One-line summary">
        <TextInput value={data.tagline} onChange={(v: any) => set("tagline", v)} placeholder="A guided first-run experience for new accounts." />
      </Field>
      <div className="field__row">
        <Field label="Author">
          <TextInput value={data.author} onChange={(v: any) => set("author", v)} />
        </Field>
        <Field label="Status">
          <select className="field__select" value={data.status} onChange={(e: any) => set("status", e.target.value)}>
            <option>Draft</option><option>In Review</option><option>Approved</option><option>Shipped</option>
          </select>
        </Field>
      </div>
      <div className="field__row">
        <Field label="Updated">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Target release">
          <TextInput value={data.release} onChange={(v: any) => set("release", v)} placeholder="Q3 2026" />
        </Field>
      </div>

      <SectionTitle>Body (markdown)</SectionTitle>
      <Field label="Problem">
        <Textarea value={data.problem} onChange={(v: any) => set("problem", v)} />
      </Field>
      <Field label="Goals &amp; non-goals">
        <Textarea value={data.goals} onChange={(v: any) => set("goals", v)} />
      </Field>
      <Field label="User stories">
        <Textarea value={data.stories} onChange={(v: any) => set("stories", v)} />
      </Field>
      <Field label="Solution / Requirements">
        <Textarea value={data.solution} onChange={(v: any) => set("solution", v)} />
      </Field>
      <Field label="Success metrics">
        <Textarea value={data.metrics} onChange={(v: any) => set("metrics", v)} />
      </Field>
      <Field label="Risks &amp; open questions">
        <Textarea value={data.risks} onChange={(v: any) => set("risks", v)} />
      </Field>
    </>
  );
}

/* ---------- SOCIAL ---------- */
export function SocialEditor({ data, onChange, templates, activeId, setActiveId, recentId, setRecentId, defaults, onStepChange }: any) {
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
  const active = templates.find((t: any) => t.id === activeId);
  const fields = active ? active.fields : [];

  const TILE_W = 162;
  const catLabel: Record<string, string> = { square: "Instagram 1:1", vertical: "TikTok / Threads" };

  const allGroups: any[] = [];
  const seenAll = new Set<string>();
  templates.forEach((t: any) => {
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
  const filtered = templates.filter((t: any) => {
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
    return (
      <button
        key={t.id}
        className={"social-grid__tile " + (cat === "vertical" ? "social-grid__tile--vertical " : "") + (t.id === activeId ? "social-grid__tile--active " : "") + (t.id === recentId ? "social-grid__tile--recent" : "")}
        style={{ aspectRatio: `${tplW} / ${tplH}` }}
        onClick={() => { setActiveId(t.id); if (setRecentId) setRecentId(t.id); changeStep("edit"); }}
        title={t.name}
      >
        {t.id === recentId && <span className="social-grid__recent-badge">Recent</span>}
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
              >All <span className="social-search__pill-count">{templates.length}</span></button>
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
                    ? <Textarea value={activeData[f.key]} onChange={(v: any) => set(f.key, v)} placeholder={f.placeholder} />
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

/* ---------- RETAINER ---------- */
export function RetainerEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Parties</SectionTitle>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Studio name">
        <TextInput value={data.studioName} onChange={(v: any) => set("studioName", v)} placeholder="North & Quill" />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Monthly fee">
          <TextInput type="number" value={data.monthlyFee} onChange={(v: any) => set("monthlyFee", v)} placeholder="4500" />
        </Field>
      </div>

      <SectionTitle>Terms</SectionTitle>
      <Field label="Scope of work (markdown)">
        <Textarea value={data.scope} onChange={(v: any) => set("scope", v)} />
      </Field>
      <Field label="Revision limit">
        <TextInput value={data.revisionLimit} onChange={(v: any) => set("revisionLimit", v)} placeholder="2 revision rounds per deliverable" />
      </Field>
      <Field label="Payment due day">
        <TextInput value={data.paymentDueDay} onChange={(v: any) => set("paymentDueDay", v)} placeholder="1st of each month" />
      </Field>
      <div className="field__row">
        <Field label="Start date">
          <TextInput type="date" value={data.startDate} onChange={(v: any) => set("startDate", v)} />
        </Field>
        <Field label="Contract duration">
          <TextInput value={data.contractDuration} onChange={(v: any) => set("contractDuration", v)} placeholder="3 months, auto-renewing" />
        </Field>
      </div>
      <Field label="Governing law">
        <TextInput value={data.governingLaw} onChange={(v: any) => set("governingLaw", v)} placeholder="New York, USA" />
      </Field>
    </>
  );
}

/* ---------- RECEIPT ---------- */
export function ReceiptEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Receipt details</SectionTitle>
      <div className="field__row">
        <Field label="Receipt no.">
          <TextInput value={data.receiptNo} onChange={(v: any) => set("receiptNo", v)} placeholder="REC-2026-001" />
        </Field>
        <Field label="Payment date">
          <TextInput type="date" value={data.paymentDate} onChange={(v: any) => set("paymentDate", v)} />
        </Field>
      </div>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Item description">
        <TextInput value={data.itemDescription} onChange={(v: any) => set("itemDescription", v)} placeholder="Brand identity — Phase 01 deposit" />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Amount">
          <TextInput type="number" value={data.amount} onChange={(v: any) => set("amount", v)} placeholder="9600" />
        </Field>
      </div>
      <Field label="Payment method">
        <TextInput value={data.paymentMethod} onChange={(v: any) => set("paymentMethod", v)} placeholder="Bank transfer / Wise" />
      </Field>

      <SectionTitle>Notes</SectionTitle>
      <Field label="Notes (markdown)">
        <Textarea value={data.notes} onChange={(v: any) => set("notes", v)} />
      </Field>
    </>
  );
}

/* ---------- ONBOARDING ---------- */
export function OnboardingEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project info</SectionTitle>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Start date">
        <TextInput type="date" value={data.startDate} onChange={(v: any) => set("startDate", v)} />
      </Field>

      <SectionTitle>Checklist content</SectionTitle>
      <Field label="Deliverables" hint="One item per line — renders as a printable checklist.">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Assets needed from client" hint="One item per line.">
        <Textarea value={data.assetsNeeded} onChange={(v: any) => set("assetsNeeded", v)} />
      </Field>

      <SectionTitle>Communication</SectionTitle>
      <Field label="Communication channel">
        <TextInput value={data.communicationChannel} onChange={(v: any) => set("communicationChannel", v)} placeholder="Slack / WhatsApp / Email" />
      </Field>
      <Field label="Meeting schedule">
        <TextInput value={data.meetingSchedule} onChange={(v: any) => set("meetingSchedule", v)} placeholder="Weekly on Tuesdays, 10am EST" />
      </Field>
      <Field label="Point of contact">
        <TextInput value={data.pointOfContact} onChange={(v: any) => set("pointOfContact", v)} placeholder="Maren Aksel — hello@studio.com" />
      </Field>
    </>
  );
}

/* ---------- SCOPE GUARD ---------- */
export function ScopeGuardEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project</SectionTitle>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>

      <SectionTitle>Revision terms</SectionTitle>
      <Field label="Included revisions">
        <TextInput type="number" value={data.includedRevisions} onChange={(v: any) => set("includedRevisions", v)} placeholder="2" />
      </Field>
      <Field label="What counts as a revision (markdown)">
        <Textarea value={data.whatIsRevision} onChange={(v: any) => set("whatIsRevision", v)} />
      </Field>
      <Field label="What is out of scope" hint="One item per line — renders as a list.">
        <Textarea value={data.whatIsOutOfScope} onChange={(v: any) => set("whatIsOutOfScope", v)} />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Additional revision rate">
          <TextInput type="number" value={data.additionalRevisionRate} onChange={(v: any) => set("additionalRevisionRate", v)} placeholder="180" />
        </Field>
      </div>
    </>
  );
}

/* ---------- HANDOVER ---------- */
export function HandoverEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project info</SectionTitle>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Handover date">
        <TextInput type="date" value={data.handoverDate} onChange={(v: any) => set("handoverDate", v)} />
      </Field>

      <SectionTitle>Handover content</SectionTitle>
      <Field label="Deliverables list" hint="One item per line — renders as a checklist.">
        <Textarea value={data.deliverablesList} onChange={(v: any) => set("deliverablesList", v)} />
      </Field>
      <Field label="File locations / links (markdown)">
        <Textarea value={data.fileLocations} onChange={(v: any) => set("fileLocations", v)} />
      </Field>
      <Field label="Credentials handed over (markdown)">
        <Textarea value={data.credentialsHandedOver} onChange={(v: any) => set("credentialsHandedOver", v)} />
      </Field>
      <Field label="Next steps for client" hint="One item per line — renders as a checklist.">
        <Textarea value={data.nextStepsForClient} onChange={(v: any) => set("nextStepsForClient", v)} />
      </Field>

      <SectionTitle>Sign-off</SectionTitle>
      <Field label="Studio sign-off name">
        <TextInput value={data.studioSignOffName} onChange={(v: any) => set("studioSignOffName", v)} placeholder="Maren Aksel" />
      </Field>
    </>
  );
}
