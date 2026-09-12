import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocalStorage } from './utils';
import {
  AgreementEditor, InvoiceEditor, ProposalEditor, PRDEditor,
  RetainerEditor, ReceiptEditor, OnboardingEditor, ScopeGuardEditor,
  HandoverEditor, SocialEditor,
} from './editors';
import { DocTemplates } from './doc-templates';
import { QuoteCalculatorPanel } from './quote-calculator';
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
import { BulkCSVPanel } from './BulkCSVPanel';
import { DocumentSidebar } from './DocumentSidebar';
import { DocumentHistory } from './DocumentHistory';
import { useDocumentStore } from './useDocumentStore';
import { DocumentSettingsModal as SettingsModal } from './DocumentSettingsModal';
import { Icon } from './utils';
import { useBulkCSV } from './hooks/useBulkCSV';
import { useDocumentExport } from './hooks/useDocumentExport';
import { DocumentTopBar } from './components/DocumentTopBar';
import { DocumentPreviewBar } from './components/DocumentPreviewBar';
import { DocumentCanvas } from './components/DocumentCanvas';

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

  const { plan } = usePlan();
  const toolId = mode === "social" ? "social-generator" : "document-generator";
  const { canUse, increment } = useToolLimit(toolId);

  const bulkCSV = useBulkCSV({
    docType,
    defaults: cfg?.defaults,
    paper: t.paper,
    plan,
    increment,
  });

  const isDocumentsDemo = mode === 'documents';
  const isSocialDemo = mode === 'social';
  const isMarketingDemo = mode !== 'full';

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

  const socialActiveData = docType === "social"
    ? (data[socialTemplateId] || ((DEFAULT_SOCIAL as any)[socialTemplateId] || {}))
    : null;

  const ActiveSocial = docType === "social" ? AllSocialTemplates.find((s: any) => s.id === socialTemplateId) : null;
  const socialSlides = ActiveSocial ? (ActiveSocial as any).slides({ data: socialActiveData || {}, brand }) : [];

  const isTemplateLocked = (tpl: any) => !!tpl?.isPro && plan !== 'pro';
  const selectSocialTemplate = (nextId: string) => {
    const tpl = AllSocialTemplates.find((s: any) => s.id === nextId);
    if (isTemplateLocked(tpl)) { setShowUpgrade(true); return; }
    setSocialTemplateId(nextId);
  };

  const activeSocialLocked = docType === "social" && isTemplateLocked(ActiveSocial);
  const paperClass = `paper paper--${t.paper}`;
  const TplComponent = docType !== "social" ? ((DocTemplates as any)[docType] || {})[variant] : null;
  const exportTarget = docType === "social" ? "#social-target-0" : "#paper-target";
  const isToolMode = cfg && cfg.isTool;

  const docExport = useDocumentExport({
    docType,
    data,
    socialTemplateId,
    AllSocialTemplates,
    activeSocialLocked,
    canUse,
    setShowUpgrade,
    increment,
    handleSaveDocument,
    isToolMode,
    paper: t.paper,
    socialSlides,
    exportTarget,
  });

  const showSocialPicker = () => {
    setDocType("social");
    setSocialStep("pick");
    setSocialPickerKey((k: number) => k + 1);
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
        <DocumentTopBar
          docType={docType}
          socialStep={socialStep}
          ActiveSocial={ActiveSocial}
          cfg={cfg}
          variant={variant}
          setVariant={setVariant}
          isEditorMaximized={isEditorMaximized}
          setIsEditorMaximized={setIsEditorMaximized}
          fitPreview={fitPreview}
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
          activeDraftId={activeDraftId}
          setActiveDraftId={setActiveDraftId}
          drafts={drafts}
          setDrafts={setDrafts}
          data={data}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          docStore={docStore}
          variants={VARIANTS}
        />
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
              csvHeaders={bulkCSV.csvHeaders}
              csvRows={bulkCSV.csvRows}
              mappings={bulkCSV.mappings}
              setMappings={bulkCSV.setMappings}
              handleBulkUpload={bulkCSV.handleBulkUpload}
              bulkExportFormat={bulkCSV.bulkExportFormat}
              setBulkExportFormat={bulkCSV.setBulkExportFormat}
              startBulkGeneration={bulkCSV.startBulkGeneration}
              bulkProcessing={bulkCSV.bulkProcessing}
              bulkQueue={bulkCSV.bulkQueue}
              bulkProgressIndex={bulkCSV.bulkProgressIndex}
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
        <DocumentPreviewBar
          isToolMode={Boolean(isToolMode)}
          docType={docType}
          ActiveSocial={ActiveSocial}
          paper={t.paper}
          isEditorMaximized={isEditorMaximized}
          setIsEditorMaximized={setIsEditorMaximized}
          fitPreview={fitPreview}
          setMobileTab={setMobileTab}
          zoom={zoom}
          setZoom={setZoom}
          saving={saving}
          saveSuccess={saveSuccess}
          handleSaveDocument={handleSaveDocument}
          handleImage={docExport.handleImage}
          handleExportPDF={docExport.handleExportPDF}
          exportingPdf={docExport.exportingPdf}
          socialSlides={socialSlides}
          downloadAllSlides={docExport.downloadAllSlides}
          handleCopyImage={docExport.handleCopyImage}
          copyState={docExport.copyState}
        />

        <DocumentCanvas
          stageRef={stageRef}
          isToolMode={Boolean(isToolMode)}
          docType={docType}
          data={data}
          zoom={zoom}
          paperClass={paperClass}
          TplComponent={TplComponent}
          brand={brand}
          ActiveSocial={ActiveSocial}
          socialActiveData={socialActiveData}
          bulkProgressIndex={bulkCSV.bulkProgressIndex}
          bulkQueue={bulkCSV.bulkQueue}
          paper={t.paper}
        />
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
    </div>
  );
}
