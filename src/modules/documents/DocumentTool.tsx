import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Icon, useLocalStorage, exportPrint, exportImage, copyImage,
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
import { toRegistryTemplate, type RuntimeTemplateDef } from '../social/RuntimeTemplate';
import { getPublishedSocialTemplates, type SocialTemplateRow } from '../../lib/api';
import {
  DEFAULT_BRAND, DEFAULT_AGREEMENT, DEFAULT_INVOICE, DEFAULT_PROPOSAL,
  DEFAULT_PRD, DEFAULT_RETAINER, DEFAULT_RECEIPT, DEFAULT_ONBOARDING,
  DEFAULT_SCOPEGUARD, DEFAULT_HANDOVER, DEFAULT_QUOTE, DEFAULT_SOCIAL,
} from './defaults';
import { useToolLimit } from '../../hooks/useToolLimit';
import { useAuth } from '../../hooks/useAuth';
import { hasGlobalMetadata, metadataFingerprint, metadataToBrand } from '../../lib/globalMetadata';
import UpgradeModal from '../../components/UpgradeModal';
import { usePlan } from '../../hooks/usePlan';
import { parseCSV, autoMapHeaders, constructRowData, convertPngToPdf, DOCUMENT_FIELDS } from './bulk-utils';

const BuiltInSocialTemplates = [...SocialTemplates, ...TikTokTemplates];

// Convert a stored template row into a registry-compatible template object.
function rowToRegistry(row: SocialTemplateRow) {
  let fields: RuntimeTemplateDef['fields'] = [];
  let slides: string[] | undefined;
  try { fields = JSON.parse(row.fields_json || '[]'); } catch { fields = []; }
  try { slides = row.slides_json ? JSON.parse(row.slides_json) : undefined; } catch { slides = undefined; }
  const def: RuntimeTemplateDef = {
    id: row.id, name: row.name, kind: row.kind, category: row.category ?? undefined,
    width: row.width, height: row.height, fields, html: row.html, css: row.css,
    slides, is_pro: !!row.is_pro, __runtime: true,
  };
  return toRegistryTemplate(def);
}

// Hook: built-in templates plus any published runtime templates from the API.
function useAllSocialTemplates() {
  const [runtime, setRuntime] = useState<any[]>([]);
  useEffect(() => {
    let alive = true;
    getPublishedSocialTemplates()
      .then((res) => { if (alive) setRuntime((res.templates || []).map(rowToRegistry)); })
      .catch(() => { /* built-ins always work offline; ignore feed errors */ });
    return () => { alive = false; };
  }, []);
  return useMemo(() => [...BuiltInSocialTemplates, ...runtime], [runtime]);
}

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

const GLOBAL_METADATA_SYNC_KEY = "dg.globalMetadataFingerprint.v1";

import { SocialPreview } from './SocialPreview';
import { DocumentSettingsModal as SettingsModal } from './DocumentSettingsModal';
import { BulkCSVPanel } from './BulkCSVPanel';
import { DocumentSidebar } from './DocumentSidebar';
import { DocumentHistory } from './DocumentHistory';
import { useDocumentStore } from './useDocumentStore';

type DocumentToolMode = 'full' | 'documents' | 'social';

/* ---------- Main app ---------- */
export default function DocumentTool({ mode = 'full' }: { mode?: DocumentToolMode }) {
  const { user } = useAuth();
  const AllSocialTemplates = useAllSocialTemplates();
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
  const [pinnedDocTypes, setPinnedDocTypes] = useLocalStorage("dg.pinnedDocTypes.v1", ["agreement", "invoice", "proposal"]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useLocalStorage("dg.editorMaximized.v2", false);

  const togglePin = (id: string) => {
    setPinnedDocTypes((prev: string[]) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(id) ? list.filter((p: string) => p !== id) : [...list, id];
    });
  };
  const [socialStep, setSocialStep] = useState("pick");
  const [socialPickerKey, setSocialPickerKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [zoom, setZoom] = useState(0.5);
  const [copyState, setCopyState] = useState("idle");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'bulk'>('editor');
  const docStore = useDocumentStore(docType);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('type');
      if (p && DOC_TYPES.some((d: any) => d.id === p)) {
        setDocType(p);
      }
    } catch {}
  }, []);

  const handleSaveDocument = async (status: 'draft' | 'final' = 'draft') => {
    setSaving(true);
    try {
      await docStore.save(docType, data, variant, status);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      alert(e?.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [bulkExportFormat, setBulkExportFormat] = useState<'png' | 'pdf'>('pdf');
  const [bulkQueue, setBulkQueue] = useState<{ id: string; name: string; data: any; status: 'pending' | 'processing' | 'done' | 'error'; url?: string }[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgressIndex, setBulkProgressIndex] = useState(-1);
  const { plan } = usePlan();

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) { alert("CSV must have headers and at least one row."); return; }
      const headers = rows[0].map(h => h.trim());
      const dataRows = rows.slice(1);
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      const fields = DOCUMENT_FIELDS[docType] || [];
      setMappings(autoMapHeaders(headers, fields));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startBulkGeneration = async () => {
    if (csvRows.length === 0) return;
    let itemsToProcess = [...csvRows];
    if (plan !== 'pro') {
      if (csvRows.length > 3) {
        itemsToProcess = csvRows.slice(0, 3);
        alert("Free plan limited to 3 items per bulk run. Upgrade to Pro for unlimited.");
      }
    }
    const newQueue = itemsToProcess.map((row, idx) => {
      const rowData = constructRowData(row, csvHeaders, mappings, docType, cfg.defaults);
      const fileName = `${docType}-${rowData.invoiceNo || rowData.title || rowData.clientName || idx}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      return { id: `item-${idx}`, name: fileName, data: rowData, status: 'pending' as const };
    });
    setBulkQueue(newQueue);
    setBulkProcessing(true);
    setBulkProgressIndex(0);
  };

  useEffect(() => {
    if (!bulkProcessing || bulkProgressIndex < 0 || bulkProgressIndex >= bulkQueue.length) {
      if (bulkProcessing && bulkProgressIndex === bulkQueue.length) {
        (async () => {
          const { default: JSZip } = await import('jszip');
          const zip = new JSZip();
          for (const item of bulkQueue) {
            if (item.status === 'done' && item.url) {
              const res = await fetch(item.url);
              const blob = await res.blob();
              zip.file(`${item.name}.${bulkExportFormat === 'pdf' ? 'pdf' : 'png'}`, blob);
            }
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `bulk-${docType}-${new Date().toISOString().slice(0, 10)}.zip`;
          a.click();
          URL.revokeObjectURL(url);
          setBulkProcessing(false);
        })();
      }
      return;
    }

    let isMounted = true;
    const processItem = async () => {
      setBulkQueue(prev => prev.map((q, idx) => idx === bulkProgressIndex ? { ...q, status: 'processing' } : q));
      try {
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const { captureImage } = await import('./utils');
        const dataUrl = await captureImage("#bulk-paper-target", "png");
        if (!dataUrl) throw new Error("Capture failed");

        let fileBlob: Blob;
        if (bulkExportFormat === 'pdf') {
          fileBlob = await convertPngToPdf(dataUrl, t.paper as any);
        } else {
          const res = await fetch(dataUrl);
          fileBlob = await res.blob();
        }

        const objectUrl = URL.createObjectURL(fileBlob);
        if (isMounted) {
          setBulkQueue(prev => prev.map((q, idx) => idx === bulkProgressIndex ? { ...q, status: 'done', url: objectUrl } : q));
          increment();
          setBulkProgressIndex(prev => prev + 1);
        }
      } catch (err) {
        if (isMounted) {
          setBulkQueue(prev => prev.map((q, idx) => idx === bulkProgressIndex ? { ...q, status: 'error' } : q));
          setBulkProgressIndex(prev => prev + 1);
        }
      }
    };
    processItem();
    return () => { isMounted = false; };
  }, [bulkProgressIndex, bulkProcessing]);

  const isDocumentsDemo = mode === 'documents';
  const isSocialDemo = mode === 'social';
  const isMarketingDemo = mode !== 'full';

  const toolId = mode === "social" ? "social-generator" : "document-generator";
  const { canUse, increment } = useToolLimit(toolId);

  useEffect(() => {
    if (!hasGlobalMetadata(user?.global_metadata)) return;
    const fingerprint = metadataFingerprint(user?.global_metadata);
    if (localStorage.getItem(GLOBAL_METADATA_SYNC_KEY) === fingerprint) return;
    setBrand((current: any) => ({
      ...current,
      ...metadataToBrand(user?.global_metadata, user),
    }));
    localStorage.setItem(GLOBAL_METADATA_SYNC_KEY, fingerprint);
  }, [setBrand, user]);

  useEffect(() => {
    if (isDocumentsDemo && (docType === "social" || docType === "quote")) setDocType("agreement");
    if (isSocialDemo && docType !== "social") {
      setDocType("social");
      setSocialStep("pick");
    }
  }, [isDocumentsDemo, isSocialDemo, docType, setDocType]);

  useEffect(() => {
    if (docType === "social") setSocialStep("pick");
  }, [docType]);

  useEffect(() => {
    const exists = drafts.some((d: any) => d.id === activeDraftId && d.docType === docType);
    if (!exists) setActiveDraftId("");
  }, [docType]);

  const stageRef = useRef<HTMLDivElement>(null);
  const fitPreview = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let tW = 8.5 * 96, tH = 11 * 96;
    if (docType === "social") {
      const tpl = AllSocialTemplates.find((s: any) => s.id === socialTemplateId);
      tW = (tpl && (tpl as any).width) || 1080;
      tH = (tpl && (tpl as any).height) || 1080;
    }
    const isSmall = stage.clientWidth < 640;
    const padding = isSmall ? 20 : 64;
    const fitW = (stage.clientWidth - padding) / tW;
    const fitH = (stage.clientHeight - padding) / tH;
    const fit = Math.max(0.12, Math.min(0.95, Math.min(fitW, fitH)));
    setZoom(Number(fit.toFixed(2)));
  }, [docType, socialTemplateId, AllSocialTemplates]);

  useEffect(() => {
    fitPreview();
    const handleResize = () => { fitPreview(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitPreview]);

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

  // Pro-gated templates: block selection for non-Pro users and surface the
  // upgrade modal instead of silently letting them author an unusable design.
  const isTemplateLocked = (tpl: any) => !!tpl?.isPro && plan !== 'pro';
  const selectSocialTemplate = (nextId: string) => {
    const tpl = AllSocialTemplates.find((s: any) => s.id === nextId);
    if (isTemplateLocked(tpl)) { setShowUpgrade(true); return; }
    setSocialTemplateId(nextId);
  };

  // Backstop: if a Pro template is somehow active (e.g. plan downgraded after
  // it was persisted to localStorage), block export rather than emit it.
  const activeSocialLocked = docType === "social" && isTemplateLocked(ActiveSocial);

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
    if (activeSocialLocked) { setShowUpgrade(true); return; }
    if (!canUse) { setShowUpgrade(true); return; }
    if (docType !== 'social' && !isToolMode) {
      handleSaveDocument('final').catch(() => {});
    }
    exportPrint(exportTarget);
    increment();
  };

  const handleImage = async (fmt: string) => {
    if (activeSocialLocked) { setShowUpgrade(true); return; }
    if (!canUse) { setShowUpgrade(true); return; }
    await exportImage(exportTarget, filename, fmt);
    increment();
  };

  const handleCopyImage = async () => {
    if (activeSocialLocked) { setShowUpgrade(true); return; }
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
    if (activeSocialLocked) { setShowUpgrade(true); return; }
    if (!canUse) { setShowUpgrade(true); return; }
    for (let i = 0; i < socialSlides.length; i++) {
      await exportImage(`#social-target-${i}`, `${filename}-${String(i + 1).padStart(2, "0")}`, fmt);
      await new Promise(r => setTimeout(r, 300));
    }
    increment();
  };

  return (
    <div className={`app app--mode-${mode} app--mobile-${mobileTab} ${docType === "social" && socialStep === "pick" ? "app--social-pick" : "app--social-edit"} ${isEditorMaximized ? "app--editor-maximized" : ""}`}>
      {/* ===== Sidebar ===== */}
      <DocumentSidebar
        docTypes={DOC_TYPES}
        currentDocType={docType}
        onSelectDocType={setDocType}
        variantsCount={VARIANTS.length}
        isSocialDemo={isSocialDemo}
        isDocumentsDemo={isDocumentsDemo}
        isMarketingDemo={isMarketingDemo}
        onSocialPick={showSocialPicker}
        socialCount={AllSocialTemplates.length}
        brand={brand}
        onOpenSettings={() => setSettingsOpen(true)}
        pinnedDocTypes={pinnedDocTypes}
        onTogglePin={togglePin}
      />

      {/* ===== Editor ===== */}
      <section className="editor">
        <div className="editor__head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
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
            </div>
            <button
              type="button"
              className={`editor-maximize-btn ${isEditorMaximized ? 'editor-maximize-btn--active' : ''}`}
              onClick={() => {
                setIsEditorMaximized((prev: boolean) => !prev);
                setTimeout(fitPreview, 80);
              }}
              title={isEditorMaximized ? "Restore preview size" : "Maximize editor (shrink preview)"}
              aria-label={isEditorMaximized ? "Restore preview" : "Maximize editor"}
            >
              {isEditorMaximized ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>
                  <span>Restore</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                  <span>Maximize</span>
                </>
              )}
            </button>
          </div>
          {/* Mobile View Switcher (Visible on mobile when editing) */}
          {(docType !== "social" || socialStep === "edit") && !cfg.isTool && (
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
              {activeTab === 'editor' && VARIANTS.map(v => (
                <button
                  key={v.id}
                  className={"variant-pill " + (variant === v.id ? "variant-pill--active" : "")}
                  onClick={() => setVariant(v.id)}
                >{v.name}</button>
              ))}
              {activeTab === 'bulk' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--shell-muted)' }}>Variant:</span>
                  <select
                    value={variant}
                    onChange={(e: any) => setVariant(e.target.value)}
                    style={{ background: "var(--shell-field-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: 'pointer' }}
                  >
                    {VARIANTS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="editor__body">
          {activeTab === 'history' ? (
            <DocumentHistory
              docType={docType}
              items={docStore.items}
              countsByCategory={docStore.countsByCategory}
              onCategoryChange={(cat) => {
                docStore.fetchItems(cat);
              }}
              isLoading={docStore.isLoading}
              onEdit={async (id, targetDocType) => {
                try {
                  const doc = await docStore.load(id);
                  if (targetDocType && targetDocType !== docType) {
                    setDocType(targetDocType);
                  } else if (doc.doc_type && doc.doc_type !== docType) {
                    setDocType(doc.doc_type);
                  }
                  setData(doc.data);
                  if (doc.variant) setVariant(doc.variant);
                  setActiveTab('editor');
                } catch {
                  alert("Failed to load document");
                }
              }}
              onDuplicate={async (id, targetDocType) => {
                try {
                  await docStore.duplicate(id, targetDocType || docType);
                } catch {
                  alert("Failed to duplicate document");
                }
              }}
              onDelete={async (id, targetDocType) => {
                try {
                  await docStore.remove(id, targetDocType || docType);
                } catch {
                  alert("Failed to delete document");
                }
              }}
              onSearchChange={(q, cat) => docStore.fetchItems(cat || docType, undefined, q)}
              onStatusChange={(s, cat) => docStore.fetchItems(cat || docType, s === 'all' ? undefined : s, undefined)}
            />
          ) : activeTab === 'bulk' && !cfg.isTool && docType !== 'social' ? (
            <BulkCSVPanel
              docType={docType}
              csvHeaders={csvHeaders}
              csvRows={csvRows}
              mappings={mappings}
              setMappings={setMappings}
              handleBulkUpload={handleBulkUpload}
              bulkExportFormat={bulkExportFormat}
              setBulkExportFormat={setBulkExportFormat}
              startBulkGeneration={startBulkGeneration}
              bulkProcessing={bulkProcessing}
              bulkQueue={bulkQueue}
              bulkProgressIndex={bulkProgressIndex}
            />
          ) : (
            <div style={{ display: activeTab === 'editor' || cfg.isTool || docType === 'social' ? 'block' : 'none' }}>
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
                  setActiveId={selectSocialTemplate}
                  isLocked={isTemplateLocked}
                  recentId={recentSocialTemplateId}
                  setRecentId={setRecentSocialTemplateId}
                  defaults={DEFAULT_SOCIAL}
                  onStepChange={setSocialStep}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== Preview ===== */}
      <section className="preview">
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
              ? "Quick estimate"
              : docType === "social"
              ? `${(ActiveSocial as any)?.width || 1080} × ${(ActiveSocial as any)?.height || 1080} · ${(ActiveSocial as any)?.kind}`
              : `${t.paper === "a4" ? "A4" : "Letter"} · 8.5×11 in`}
          </span>
          <div className="preview__bar-spacer"></div>

          <button
            type="button"
            className={`preview-shrink-btn ${isEditorMaximized ? 'preview-shrink-btn--active' : ''}`}
            onClick={() => {
              setIsEditorMaximized((prev: boolean) => !prev);
              setTimeout(fitPreview, 80);
            }}
            title={isEditorMaximized ? "Expand preview size" : "Shrink preview (maximize editor)"}
            aria-label={isEditorMaximized ? "Expand preview" : "Shrink preview"}
          >
            {isEditorMaximized ? "⇥ Expand Preview" : "⇤ Shrink Preview"}
          </button>

          {!isToolMode && (
            <div className="zoom-group">
              <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}>{Icon.zoomOut}</button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button className="zoom-btn zoom-btn--fit" onClick={fitPreview}>Fit</button>
              <button className="zoom-btn" onClick={() => setZoom((z: number) => Math.min(1.4, z + 0.1))}>{Icon.zoomIn}</button>
            </div>
          )}

          {isToolMode ? null : docType !== "social" ? (
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
              <button className="export-btn" onClick={handlePrint}>{Icon.print} Export PDF</button>
            </div>
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

      {!isMarketingDemo && (
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
      )}
      <div
        id="bulk-render-target-container"
        style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: t.paper === 'a4' ? '210mm' : '8.5in', height: t.paper === 'a4' ? '297mm' : '11in', overflow: 'hidden', pointerEvents: 'none', zIndex: -999 }}
      >
        {bulkProgressIndex >= 0 && bulkProgressIndex < bulkQueue.length && TplComponent && (
          <div id="bulk-paper-target" className={paperClass} style={{ transform: 'none', boxShadow: 'none' }}>
            <TplComponent data={bulkQueue[bulkProgressIndex].data} brand={brand} />
          </div>
        )}
      </div>
    </div>
  );
}
