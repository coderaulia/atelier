import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Icon, useLocalStorage, exportPrint, exportImage, copyImage,
  Field, TextInput, Textarea, ImageField,
} from './utils';
import {
  AgreementEditor, InvoiceEditor, ProposalEditor, PRDEditor,
  RetainerEditor, ReceiptEditor, OnboardingEditor, ScopeGuardEditor,
  HandoverEditor, SocialEditor,
} from './editors';
import { DocTemplates } from './doc-templates';
import { QuoteCalculatorPanel, QuotePreview } from './quote-calculator';
import {
  useTweaks, TweaksPanel, TweakSection, TweakColor, TweakSelect, TweakRadio,
} from './tweaks-panel';
import { SocialTemplates } from '../social/social-templates';
import { TikTokTemplates } from '../social/tiktok-templates';
import {
  DEFAULT_BRAND, DEFAULT_AGREEMENT, DEFAULT_INVOICE, DEFAULT_PROPOSAL,
  DEFAULT_PRD, DEFAULT_RETAINER, DEFAULT_RECEIPT, DEFAULT_ONBOARDING,
  DEFAULT_SCOPEGUARD, DEFAULT_HANDOVER, DEFAULT_QUOTE, DEFAULT_SOCIAL,
} from './defaults';
import { useToolLimit } from '../../hooks/useToolLimit';
import UpgradeModal from '../../components/UpgradeModal';

const AllSocialTemplates = [...SocialTemplates, ...TikTokTemplates];

const DOC_TYPES = [
  { id: "agreement",  name: "Agreement",   icon: Icon.doc,      Editor: AgreementEditor,      defaults: DEFAULT_AGREEMENT,  hasVariants: true },
  { id: "invoice",    name: "Invoice",     icon: Icon.receipt,  Editor: InvoiceEditor,        defaults: DEFAULT_INVOICE,    hasVariants: true },
  { id: "proposal",   name: "Proposal",   icon: Icon.proposal, Editor: ProposalEditor,       defaults: DEFAULT_PROPOSAL,   hasVariants: true },
  { id: "prd",        name: "PRD",         icon: Icon.prd,      Editor: PRDEditor,            defaults: DEFAULT_PRD,        hasVariants: true },
  { id: "retainer",   name: "Retainer",   icon: Icon.doc,      Editor: RetainerEditor,       defaults: DEFAULT_RETAINER,   hasVariants: true },
  { id: "receipt",    name: "Receipt",    icon: Icon.receipt,  Editor: ReceiptEditor,        defaults: DEFAULT_RECEIPT,    hasVariants: true },
  { id: "onboarding", name: "Onboarding", icon: Icon.proposal, Editor: OnboardingEditor,     defaults: DEFAULT_ONBOARDING, hasVariants: true },
  { id: "scopeguard", name: "Scope Guard",icon: Icon.prd,      Editor: ScopeGuardEditor,     defaults: DEFAULT_SCOPEGUARD, hasVariants: true },
  { id: "handover",   name: "Handover",   icon: Icon.doc,      Editor: HandoverEditor,       defaults: DEFAULT_HANDOVER,   hasVariants: true },
  { id: "social",     name: "Social",     icon: Icon.social,   Editor: SocialEditor,         defaults: DEFAULT_SOCIAL,     hasVariants: false },
  { id: "quote",      name: "Calculator", icon: Icon.calc,     Editor: QuoteCalculatorPanel, defaults: DEFAULT_QUOTE,      hasVariants: false, isTool: true },
] as const;

const VARIANTS = [
  { id: "classic",   name: "Classic" },
  { id: "modern",    name: "Modern" },
  { id: "editorial", name: "Editorial" },
];

/* ---------- Social Preview ---------- */
function SocialPreview({ template, data, brand, zoom }: any) {
  if (!template) return null;
  const slides = template.slides({ data, brand });
  const isCarousel = slides.length > 1;
  const fileBase = template.name.toLowerCase().replace(/\s+/g, "-");

  const dlSlide = async (i: number, fmt: string) => {
    await exportImage(`#social-target-${i}`, `${fileBase}-${String(i + 1).padStart(2, "0")}`, fmt);
  };

  return (
    <div className="social-stage">
      {slides.map((slide: any, i: number) => (
        <div className="slide-wrap" key={i}>
          {isCarousel && <div className="slide-wrap__num">Slide {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</div>}
          {isCarousel && (
            <div className="slide-wrap__chrome">
              <button className="slide-wrap__btn" onClick={() => dlSlide(i, "png")} title="Download this slide as PNG">{Icon.image} PNG</button>
              <button className="slide-wrap__btn" onClick={() => dlSlide(i, "jpg")} title="Download this slide as JPG">{Icon.download} JPG</button>
            </div>
          )}
          <div id={`social-target-${i}`} style={{ transform: `scale(${zoom})`, transformOrigin: "top center", boxShadow: "0 24px 70px -24px rgba(0,0,0,0.4)" }}>
            {slide}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Settings Modal ---------- */
function SettingsModal({ brand, setBrand, onClose }: any) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = (k: string, v: any) => setBrand({ ...brand, [k]: v });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e: any) => e.stopPropagation()}>
        <div className="modal__head">
          <span className="modal__title">Studio settings</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <div style={{ fontSize: 12, color: "var(--shell-muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Used as the "from" details on every document. Stored locally on this device.
          </div>
          <Field label="Studio / Business name">
            <TextInput value={brand.studioName} onChange={(v: any) => set("studioName", v)} />
          </Field>
          <Field label="Your full name">
            <TextInput value={brand.fullName} onChange={(v: any) => set("fullName", v)} />
          </Field>
          <div className="field__row">
            <Field label="Social handle">
              <TextInput value={brand.handle} onChange={(v: any) => set("handle", v)} />
            </Field>
            <Field label="Email">
              <TextInput value={brand.email} onChange={(v: any) => set("email", v)} />
            </Field>
          </div>
          <Field label="Studio address">
            <Textarea value={brand.studioAddress} onChange={(v: any) => set("studioAddress", v)} />
          </Field>
          <Field label="Payment details (markdown)">
            <Textarea value={brand.payment} onChange={(v: any) => set("payment", v)} />
          </Field>
          <Field label="Tax ID / Business no.">
            <TextInput value={brand.taxId} onChange={(v: any) => set("taxId", v)} />
          </Field>

          <div style={{ borderTop: "1px solid var(--shell-rule)", paddingTop: 20, marginTop: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--shell-muted)", marginBottom: 14 }}>
              Brand Identity
            </div>
            <ImageField
              label="Company logo (Dark / Default version)"
              hint="Used on light backgrounds. SVG, PNG or JPG format."
              value={brand.logo}
              onChange={(v: any) => set("logo", v)}
            />
            <ImageField
              label="Company logo (Light / White version)"
              hint="Used on dark backgrounds. SVG, PNG or JPG format."
              value={brand.logoLight}
              onChange={(v: any) => set("logoLight", v)}
            />
            <ImageField
              label="Social profile picture / Avatar"
              hint="Used for social feed templates. Square format recommended."
              value={brand.logoAvatar}
              onChange={(v: any) => set("logoAvatar", v)}
            />
            {(brand.logo || brand.logoLight || brand.logoAvatar) && (
              <Field label="Show logo on templates">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={brand.logoEnabled !== false}
                    onChange={(e: any) => set("logoEnabled", e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--shell-muted)" }}>
                    {brand.logoEnabled !== false ? "Enabled — showing on all templates" : "Disabled"}
                  </span>
                </label>
              </Field>
            )}
            <div style={{ borderTop: "1px solid var(--shell-rule)", paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--shell-muted)", marginBottom: 14 }}>
                Backup &amp; Restore
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    const keys = ["dg.data.v2", "dg.brand.v2", "dg.drafts.v3", "dg.variant.v2", "dg.socialTemplateId.v2"];
                    const backup: Record<string, any> = {};
                    keys.forEach(k => {
                      try {
                        const val = localStorage.getItem(k);
                        if (val) backup[k] = JSON.parse(val);
                      } catch (e) {}
                    });
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `atelier-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ flex: 1, background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  📥 Export Backup
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt: any) => {
                        try {
                          const data = JSON.parse(evt.target.result);
                          const ALLOWED_KEYS = ["dg.data.v2", "dg.brand.v2", "dg.drafts.v3", "dg.variant.v2", "dg.socialTemplateId.v2"];
                          if (confirm("This will overwrite your current settings, drafts, and content. Proceed?")) {
                            Object.entries(data).forEach(([k, v]) => {
                              if (ALLOWED_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v));
                            });
                            window.location.reload();
                          }
                        } catch (err) {
                          alert("Invalid backup file format.");
                        }
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                  style={{ flex: 1, background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  📤 Import Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main app ---------- */
export default function DocumentTool() {
  const TWEAK_DEFAULTS = { accent: "#1c4532", fontHeader: "serif", fontBody: "sans", paper: "letter" };
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-soft", t.accent + "1a");
    const headerMap: Record<string, string> = {
      serif:   '"Source Serif 4", Georgia, serif',
      display: '"Instrument Serif", Georgia, serif',
      sans:    '"Manrope", -apple-system, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, Menlo, monospace',
    };
    document.documentElement.style.setProperty("--font-display", headerMap[t.fontHeader] || headerMap.serif);
    document.documentElement.style.setProperty("--font-serif", t.fontHeader === "display" ? headerMap.display : headerMap.serif);
    const bodyMap: Record<string, string> = {
      serif: '"Source Serif 4", Georgia, serif',
      sans:  '"Manrope", -apple-system, sans-serif',
      mono:  '"JetBrains Mono", ui-monospace, Menlo, monospace',
    };
    document.documentElement.style.setProperty("--font-sans", bodyMap[t.fontBody] || bodyMap.sans);
  }, [t.accent, t.fontHeader, t.fontBody]);

  const [docType, setDocType] = useLocalStorage("dg.docType.v2", "agreement");
  const [variant, setVariant] = useLocalStorage("dg.variant.v2", "classic");
  const [docData, setDocData] = useLocalStorage("dg.data.v2", {
    agreement:  DEFAULT_AGREEMENT,
    invoice:    DEFAULT_INVOICE,
    proposal:   DEFAULT_PROPOSAL,
    prd:        DEFAULT_PRD,
    retainer:   DEFAULT_RETAINER,
    receipt:    DEFAULT_RECEIPT,
    onboarding: DEFAULT_ONBOARDING,
    scopeguard: DEFAULT_SCOPEGUARD,
    handover:   DEFAULT_HANDOVER,
    social:     DEFAULT_SOCIAL,
    quote:      DEFAULT_QUOTE,
  });
  const [socialTemplateId, setSocialTemplateId] = useLocalStorage("dg.socialTemplateId.v2", "quote");
  const [brand, setBrand] = useLocalStorage("dg.brand.v2", DEFAULT_BRAND);
  const [recentSocialTemplateId, setRecentSocialTemplateId] = useLocalStorage("dg.recentSocialTemplateId.v2", socialTemplateId);
  const [drafts, setDrafts] = useLocalStorage("dg.drafts.v3", [] as any[]);
  const [activeDraftId, setActiveDraftId] = useLocalStorage("dg.activeDraftId.v3", "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [socialStep, setSocialStep] = useState("pick");
  const [socialPickerKey, setSocialPickerKey] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [copyState, setCopyState] = useState("idle");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { canUse, increment } = useToolLimit("documents");

  useEffect(() => {
    if (docType === "social") setSocialStep("pick");
  }, [docType]);

  useEffect(() => {
    const exists = drafts.some((d: any) => d.id === activeDraftId && d.docType === docType);
    if (!exists) setActiveDraftId("");
  }, [docType]);

  const stageRef = useRef<HTMLDivElement>(null);
  const fitPreview = () => {
    const stage = stageRef.current;
    if (!stage) return;
    let tW = 8.5 * 96, tH = 11 * 96;
    if (docType === "social") {
      const tpl = AllSocialTemplates.find((s: any) => s.id === socialTemplateId);
      tW = (tpl && (tpl as any).width) || 1080;
      tH = (tpl && (tpl as any).height) || 1080;
    }
    const padding = 80;
    const fitW = (stage.clientWidth - padding) / tW;
    const fitH = (stage.clientHeight - padding) / tH;
    const fit = Math.max(0.15, Math.min(0.9, Math.min(fitW, fitH)));
    setZoom(Number(fit.toFixed(2)));
  };
  useEffect(() => { fitPreview(); }, [docType, socialTemplateId]);

  useEffect(() => { (window as any).__brand = brand; }, [brand]);

  const cfg = DOC_TYPES.find(d => d.id === docType) as any;
  const activeDraft = activeDraftId ? (drafts as any[]).find((d: any) => d.id === activeDraftId && d.docType === docType) : null;
  const data = activeDraft ? activeDraft.data : ((docData as any)[docType] || cfg.defaults);
  const setData = (next: any) => {
    if (activeDraft) {
      setDrafts((drafts as any[]).map((d: any) => d.id === activeDraftId ? { ...d, data: next, lastModified: Date.now() } : d));
    } else {
      setDocData({ ...(docData as any), [docType]: next });
    }
  };

  const socialActiveData = docType === "social"
    ? (data[socialTemplateId] || ((DEFAULT_SOCIAL as any)[socialTemplateId] || {}))
    : null;

  const ActiveSocial = docType === "social" ? AllSocialTemplates.find((s: any) => s.id === socialTemplateId) : null;
  const socialSlides = ActiveSocial ? (ActiveSocial as any).slides({ data: socialActiveData || {}, brand }) : [];

  const paperClass = `paper paper--${t.paper}`;
  const TplComponent = docType !== "social" ? ((DocTemplates as any)[docType] || {})[variant] : null;
  const exportTarget = docType === "social" ? "#social-target-0" : "#paper-target";
  const isToolMode = cfg && cfg.isTool;

  const filename = useMemo(() => {
    if (docType === "invoice")  return `${((data as any).invoiceNo || "invoice").replace(/\s+/g, "-")}`;
    if (docType === "receipt")  return `${((data as any).receiptNo || "receipt").replace(/\s+/g, "-")}`;
    if (docType === "quote")    return "quick-quote";
    if (docType === "social") {
      const tpl = AllSocialTemplates.find((s: any) => s.id === socialTemplateId);
      return `${((tpl as any)?.name || "social").toLowerCase().replace(/\s+/g, "-")}`;
    }
    const slug = ((data as any).title || (data as any).projectName || (data as any).clientName || (data as any).refNo || "doc")
      .toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    return `${docType}-${slug}`;
  }, [docType, data, socialTemplateId]);

  const handlePrint = () => {
    if (!canUse) { setShowUpgrade(true); return; }
    exportPrint(exportTarget);
    increment();
  };

  const handleImage = async (fmt: string) => {
    if (!canUse) { setShowUpgrade(true); return; }
    await exportImage(exportTarget, filename, fmt);
    increment();
  };

  const handleCopyImage = async () => {
    if (!canUse) { setShowUpgrade(true); return; }
    setCopyState("copying");
    try {
      await copyImage(exportTarget);
      setCopyState("copied");
      increment();
      setTimeout(() => setCopyState("idle"), 1600);
    } catch (err) {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const showSocialPicker = () => {
    setDocType("social");
    setSocialStep("pick");
    setSocialPickerKey((k: number) => k + 1);
  };

  const downloadAllSlides = async (fmt: string) => {
    if (!canUse) { setShowUpgrade(true); return; }
    for (let i = 0; i < socialSlides.length; i++) {
      await exportImage(`#social-target-${i}`, `${filename}-${String(i + 1).padStart(2, "0")}`, fmt);
      await new Promise(r => setTimeout(r, 300));
    }
    increment();
  };

  return (
    <div className="app">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark"></span>
          <span className="sidebar__brand-name">Atelier</span>
          <span className="sidebar__brand-tag">v 0.1</span>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__heading">Documents</div>
          {DOC_TYPES.filter((d: any) => d.id !== "social" && !d.isTool).map((d: any) => (
            <button
              key={d.id}
              className={"sidebar__item " + (docType === d.id ? "sidebar__item--active" : "")}
              onClick={() => setDocType(d.id)}
            >
              <span className="sidebar__item-icon">{d.icon}</span>
              <span>{d.name}</span>
              {d.hasVariants && <span className="sidebar__item-count">{String(VARIANTS.length).padStart(2, "0")}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar__group">
          <div className="sidebar__heading">Social</div>
          <button
            className={"sidebar__item " + (docType === "social" ? "sidebar__item--active" : "")}
            onClick={showSocialPicker}
          >
            <span className="sidebar__item-icon">{Icon.social}</span>
            <span>Social media</span>
            <span className="sidebar__item-count">{AllSocialTemplates.length}</span>
          </button>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__heading">Tools</div>
          {DOC_TYPES.filter((d: any) => d.isTool).map((d: any) => (
            <button
              key={d.id}
              className={"sidebar__item " + (docType === d.id ? "sidebar__item--active" : "")}
              onClick={() => setDocType(d.id)}
            >
              <span className="sidebar__item-icon">{d.icon}</span>
              <span>{d.name}</span>
            </button>
          ))}
        </div>

        <div className="sidebar__footer">
          <span className="sidebar__avatar">{((brand as any).fullName || "M A").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase()}</span>
          <div className="sidebar__user">
            <div className="sidebar__user-name">{(brand as any).fullName || "—"}</div>
            <div className="sidebar__user-tag">{(brand as any).handle || "—"}</div>
          </div>
          <button className="sidebar__settings-btn" onClick={() => setSettingsOpen(true)}>{Icon.gear}</button>
        </div>
        <div className="sidebar__attribution">
          <a href="https://vanaila.com" target="_blank" rel="noopener noreferrer" className="sidebar__attribution-link">
            Vanaila Digital · Open source
          </a>
        </div>
      </aside>

      {/* ===== Editor ===== */}
      <section className="editor">
        <div className="editor__head">
          <div className="editor__crumb">
            {docType === "social"
              ? (socialStep === "pick" ? "Social · Browse" : `Social · ${(ActiveSocial as any)?.kind || "Single"}`)
              : cfg.isTool
              ? "Tools"
              : `${cfg.name} · ${VARIANTS.find(v => v.id === variant)?.name}`}
          </div>
          <h1 className="editor__title">
            {docType === "social"
              ? (socialStep === "pick" ? "Choose a template" : ((ActiveSocial as any)?.name || "Template"))
              : cfg.isTool
              ? cfg.name
              : ((data as any).title || (data as any).projectName || (data as any).clientName || cfg.name)}
          </h1>
          {!cfg.isTool && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
              <select
                value={activeDraftId || ""}
                onChange={(e: any) => setActiveDraftId(e.target.value)}
                style={{ flex: 1, background: "var(--shell-field-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer" }}
              >
                <option value="">Current local draft</option>
                {(drafts as any[])
                  .filter((d: any) => d.docType === docType)
                  .map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
              </select>
              <button
                onClick={() => {
                  const name = prompt("Enter draft name:", `Draft ${(drafts as any[]).filter((d: any) => d.docType === docType).length + 1}`);
                  if (!name) return;
                  const newId = "draft_" + Date.now();
                  const newDraft = { id: newId, name, docType, lastModified: Date.now(), data: JSON.parse(JSON.stringify(data)) };
                  setDrafts([...(drafts as any[]), newDraft]);
                  setActiveDraftId(newId);
                }}
                title="Save current as new draft"
                style={{ background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                ＋ New
              </button>
              {activeDraftId && (
                <>
                  <button
                    onClick={() => {
                      const activeD = (drafts as any[]).find((d: any) => d.id === activeDraftId);
                      if (!activeD) return;
                      const name = prompt("Rename draft:", activeD.name);
                      if (!name) return;
                      setDrafts((drafts as any[]).map((d: any) => d.id === activeDraftId ? { ...d, name } : d));
                    }}
                    title="Rename draft"
                    style={{ background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => {
                      const activeD = (drafts as any[]).find((d: any) => d.id === activeDraftId);
                      if (!activeD) return;
                      if (!confirm(`Are you sure you want to delete "${activeD.name}"?`)) return;
                      setDrafts((drafts as any[]).filter((d: any) => d.id !== activeDraftId));
                      setActiveDraftId("");
                    }}
                    title="Delete draft"
                    style={{ background: "var(--shell-btn-bg)", color: "var(--vc-red)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          )}
          {cfg.hasVariants && !cfg.isTool && (
            <div className="editor__variants">
              {VARIANTS.map(v => (
                <button
                  key={v.id}
                  className={"variant-pill " + (variant === v.id ? "variant-pill--active" : "")}
                  onClick={() => setVariant(v.id)}
                >{v.name}</button>
              ))}
            </div>
          )}
        </div>
        <div className="editor__body">
          {docType === "agreement"  && <AgreementEditor  data={data} onChange={setData} />}
          {docType === "invoice"    && <InvoiceEditor    data={data} onChange={setData} />}
          {docType === "proposal"   && <ProposalEditor   data={data} onChange={setData} />}
          {docType === "prd"        && <PRDEditor        data={data} onChange={setData} />}
          {docType === "retainer"   && <RetainerEditor   data={data} onChange={setData} />}
          {docType === "receipt"    && <ReceiptEditor    data={data} onChange={setData} />}
          {docType === "onboarding" && <OnboardingEditor data={data} onChange={setData} />}
          {docType === "scopeguard" && <ScopeGuardEditor data={data} onChange={setData} />}
          {docType === "handover"   && <HandoverEditor   data={data} onChange={setData} />}
          {docType === "quote"      && <QuoteCalculatorPanel data={data} onChange={setData} />}
          {docType === "social" && (
            <SocialEditor
              key={socialPickerKey}
              data={data}
              onChange={setData}
              templates={AllSocialTemplates}
              activeId={socialTemplateId}
              setActiveId={setSocialTemplateId}
              recentId={recentSocialTemplateId}
              setRecentId={setRecentSocialTemplateId}
              defaults={DEFAULT_SOCIAL}
              onStepChange={setSocialStep}
            />
          )}
        </div>
      </section>

      {/* ===== Preview ===== */}
      <section className="preview">
        <div className="preview__bar">
          <span className="preview__bar-title">Preview</span>
          <span className="preview__bar-meta">
            {isToolMode
              ? "Quick estimate"
              : docType === "social"
              ? `${(ActiveSocial as any)?.width || 1080} × ${(ActiveSocial as any)?.height || 1080} · ${(ActiveSocial as any)?.kind}`
              : `${t.paper === "a4" ? "A4" : "Letter"} · 8.5×11 in`}
          </span>
          <div className="preview__bar-spacer"></div>

          {!isToolMode && (
            <div className="zoom-group">
              <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}>{Icon.zoomOut}</button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button className="zoom-btn zoom-btn--fit" onClick={fitPreview}>Fit</button>
              <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.min(1.4, z + 0.1))}>{Icon.zoomIn}</button>
            </div>
          )}

          {isToolMode ? null : docType !== "social" ? (
            <button className="export-btn" onClick={handlePrint}>{Icon.print} Export PDF</button>
          ) : socialSlides.length > 1 ? (
            <>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--shell-muted)" }}>
                Hover a slide to download
              </span>
              <button className="export-btn export-btn--ghost" onClick={() => downloadAllSlides("png")}>{Icon.image} All · PNG</button>
              <button className="export-btn" onClick={() => downloadAllSlides("jpg")}>{Icon.download} All · JPG</button>
            </>
          ) : (
            <>
              <button className="export-btn export-btn--ghost" onClick={handleCopyImage}>{Icon.copy} {copyState === "copied" ? "Copied" : copyState === "error" ? "Failed" : "Copy"}</button>
              <button className="export-btn export-btn--ghost" onClick={() => handleImage("png")}>{Icon.image} PNG</button>
              <button className="export-btn" onClick={() => handleImage("jpg")}>{Icon.download} JPG</button>
            </>
          )}
        </div>

        <div className="preview__stage" ref={stageRef}>
          {isToolMode ? (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40, width: "100%", height: "100%" }}>
              <QuotePreview data={data} />
            </div>
          ) : docType !== "social" ? (
            <div className="paper-wrap" style={{ transform: `scale(${zoom})` }}>
              <div id="paper-target" className={paperClass}>
                {TplComponent && <TplComponent data={data} brand={brand} />}
              </div>
            </div>
          ) : (
            <SocialPreview template={ActiveSocial} data={socialActiveData || {}} brand={brand} zoom={zoom} />
          )}
        </div>
      </section>

      {settingsOpen && <SettingsModal brand={brand} setBrand={setBrand} onClose={() => setSettingsOpen(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#1c4532", "#7a3422", "#3a3a64", "#2a3441", "#1f2937", "#4a3a1a"]}
          onChange={(v: string) => setTweak("accent", v)}
        />
        <TweakSection label="Typography" />
        <TweakSelect
          label="Headers"
          value={t.fontHeader}
          options={[
            { value: "serif", label: "Serif" },
            { value: "display", label: "Display italic" },
            { value: "sans", label: "Sans" },
            { value: "mono", label: "Mono" },
          ]}
          onChange={(v: string) => setTweak("fontHeader", v)}
        />
        <TweakSelect
          label="Body"
          value={t.fontBody}
          options={[
            { value: "sans", label: "Sans" },
            { value: "serif", label: "Serif" },
            { value: "mono", label: "Mono" },
          ]}
          onChange={(v: string) => setTweak("fontBody", v)}
        />
        <TweakSection label="Page" />
        <TweakRadio
          label="Paper size"
          value={t.paper}
          options={["letter", "a4"]}
          onChange={(v: string) => setTweak("paper", v)}
        />
      </TweaksPanel>
    </div>
  );
}
