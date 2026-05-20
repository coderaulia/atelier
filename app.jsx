// Main app
const { useState, useEffect, useRef, useMemo } = React;

/* ---------- Default content ---------- */
const DEFAULT_BRAND = {
  studioName: "North & Quill",
  fullName: "Maren Aksel",
  handle: "@northquill",
  email: "hello@northquill.studio",
  studioAddress: "Studio 4, Old Loom Works\n221 Baker St, Brooklyn NY 11201",
  payment: "Bank: First Union\nAccount: 0021-4499-823\nRouting: 021000089\nor — Wise / PayPal: hello@northquill.studio",
  taxId: "EIN 88-1234567",
  logo: "",
  logoEnabled: true,
};

const DEFAULT_AGREEMENT = {
  title: "Brand identity for Atlas & Bell",
  clientName: "Atlas & Bell, Inc.",
  clientAddress: "44 Pine Street, 6th Floor\nNew York, NY 10005",
  date: "2026-05-20",
  refNo: "AG-2026-014",
  scope: "**North & Quill** ('the Studio') will design a full brand identity system for **Atlas & Bell** ('the Client'), including logo, type system, color, and a 32-page brand guidelines document.\n\nThe work is undertaken in good faith and limited to the deliverables listed below.",
  deliverables: "1. Primary logo, wordmark and monogram\n2. Type system (display + body)\n3. Color palette with usage rules\n4. Brand guidelines PDF (≤ 32 pages)\n5. One round of stationery (business card, letterhead)",
  compensation: "**Total fee:** $24,000 USD, billed in three installments:\n- 40% on signing of this agreement\n- 30% at midpoint review\n- 30% on final delivery\n\nPayment terms: Net 14 from invoice date.",
  timeline: "Engagement runs **eight weeks** from kickoff. Two formal review rounds are included; additional rounds billed at $180/hour.",
  legal: "All work-in-progress and source files remain property of the Studio until the final invoice is paid in full. Upon payment, full transfer of usage rights for the listed deliverables is granted to the Client.\n\nEither party may terminate this agreement with 14 days' written notice; work completed to that point is invoiced pro-rata.",
  signatoryName: "Maren Aksel",
  clientSignatory: "Priya Bell",
};

const DEFAULT_INVOICE = {
  clientName: "Atlas & Bell, Inc.",
  clientAddress: "44 Pine Street, 6th Floor\nNew York, NY 10005",
  invoiceNo: "INV-2026-014",
  projectRef: "Brand identity",
  issuedAt: "2026-05-20",
  dueAt: "2026-06-03",
  currency: "USD",
  items: [
    { desc: "Brand identity — Phase 02 (midpoint)", qty: 1, rate: 7200 },
    { desc: "Brand guidelines layout — initial pass", qty: 1, rate: 2400 },
    { desc: "Project management — May", qty: 6, rate: 180 },
  ],
  taxPct: 0,
  discountPct: 0,
  notes: "**Payable by bank transfer or Wise.** Late payments accrue 1.5% interest per month.\n\nThank you — *N&Q*.",
};

const DEFAULT_PROPOSAL = {
  title: "A brand system for Atlas & Bell",
  clientName: "Atlas & Bell, Inc.",
  date: "2026-05-20",
  refNo: "P-2026-014",
  summary: "Atlas & Bell is preparing for a Series B and a wider European launch. This proposal outlines a focused **eight-week engagement** to design a brand system that earns trust from operators, investors and recruits — and that the in-house team can extend without us in the room.",
  understanding: "From our two intro calls, the brief is clear:\n\n- The current mark reads as a 2019 SaaS startup, not a 2026 platform.\n- The marketing team needs a system, not a logo — colour, type, tone and templates.\n- Europe is the next market; the system needs to feel at home in both London and New York.",
  approach: "We work in three phases:\n\n1. **Listen.** A short discovery: stakeholder calls, audit, competitive scan.\n2. **Make.** Two distinct directions explored to mid-fidelity, then one chosen and pushed to delivery.\n3. **Hand off.** Guidelines, templates and a working session with the team.\n\nWe write everything down. You will not be in the dark.",
  deliverables: "- Logo, monogram, wordmark\n- Type pairing & scale\n- Colour system (primary + extended)\n- 32-page brand guidelines (PDF + Figma)\n- Stationery — business cards, letterhead, email signature\n- Social templates — 10 hand-built Figma files",
  timeline: "**Weeks 1–2:** Discovery & audit\n**Weeks 3–4:** Two creative directions\n**Week 5:** Direction lock\n**Weeks 6–7:** Build out\n**Week 8:** Guidelines, hand-off, working session",
  investment: "Total fee: **$24,000 USD**, billed in three installments (40 / 30 / 30). Includes two formal review rounds.\n\nThis proposal is valid for **21 days**.",
  about: "**North & Quill** is a small studio of two, working with founder-led companies on the documents that surround the product. Recent clients include Ferro Health, Mirth, and the Boring Bank.\n\nThe lead on this engagement would be **Maren Aksel**, founder.",
};

const DEFAULT_PRD = {
  title: "Onboarding 2.0",
  tagline: "A guided first-run experience that drops new accounts into a useful state inside 90 seconds.",
  author: "Maren Aksel",
  status: "In Review",
  date: "2026-05-20",
  release: "Q3 2026",
  problem: "Today, new accounts land on a blank dashboard. Day-7 retention sits at **31%**, and qualitative reads suggest the gap is *'I don't know what to do next.'*\n\nWe lose users before they've seen the product do anything for them.",
  goals: "**Goals**\n- Lift day-7 retention to 45%+\n- Get every new account to a first 'aha' moment in < 90 seconds\n- Reduce 'how do I start' support tickets by 60%\n\n**Non-goals**\n- Redesigning the dashboard itself\n- Adding new integrations\n- Mobile (this release)",
  stories: "- As a **new user**, I can describe my use case in three taps and get a workspace pre-populated for that case.\n- As an **invited teammate**, I see only the steps relevant to my role.\n- As a **returning user mid-setup**, I can pick up where I left off without restarting.",
  solution: "A three-step setup flow, served as a modal on first login.\n\n1. **Pick a path.** Three preset use-cases (Consultancy, Studio, Solo).\n2. **Seed.** We import sample clients, items and templates for the chosen path.\n3. **Send.** The user creates and sends their first real document inside the flow.\n\nProgress persists on the account; if the user bounces, we resume on next login.",
  metrics: "- **Primary:** Day-7 retention\n- **Secondary:** Time-to-first-document, completion rate of the 3-step flow\n- **Guardrail:** Day-1 task-completion rate (must not regress)",
  risks: "- Risk: paths feel too narrow. *Mitigation:* let users skip to a blank state at any point.\n- Open: do we localise sample data on day one, or follow with EN-only?\n- Open: does the existing event pipeline have the resolution we need for the new metrics?",
};

const DEFAULT_RETAINER = {
  clientName: "Atlas & Bell, Inc.",
  studioName: "North & Quill",
  monthlyFee: 4500,
  currency: "USD",
  scope: "Monthly design retainer covering: UI design sprints, marketing assets, ad creative, and one brand refresh touchpoint per quarter.",
  revisionLimit: "2 revision rounds per deliverable",
  paymentDueDay: "1st of each month",
  startDate: "2026-06-01",
  contractDuration: "3 months, auto-renewing",
  governingLaw: "New York, USA",
};

const DEFAULT_RECEIPT = {
  receiptNo: "REC-2026-001",
  clientName: "Atlas & Bell, Inc.",
  paymentDate: "2026-05-20",
  itemDescription: "Brand identity — Phase 01 deposit",
  amount: 9600,
  currency: "USD",
  paymentMethod: "Bank transfer",
  notes: "Thank you for your payment. This receipt confirms funds received in full.",
};

const DEFAULT_ONBOARDING = {
  clientName: "Atlas & Bell, Inc.",
  projectName: "Brand Identity",
  startDate: "2026-06-01",
  deliverables: "Primary logo & monogram\nType system\nColor palette\nBrand guidelines PDF\nStationery set",
  assetsNeeded: "Brand brief / positioning deck\nExisting logo files (if any)\nFont licenses in use\nHigh-res photography",
  communicationChannel: "Slack (shared workspace)",
  meetingSchedule: "Weekly check-ins, Tuesdays 10am EST",
  pointOfContact: "Maren Aksel — hello@northquill.studio",
};

const DEFAULT_SCOPEGUARD = {
  projectName: "Brand Identity",
  clientName: "Atlas & Bell, Inc.",
  includedRevisions: "2",
  whatIsRevision: "A revision is a set of consolidated feedback on the same deliverable, submitted in a single round. Minor text and colour adjustments within the same creative direction are included.",
  whatIsOutOfScope: "A new creative direction after one has been approved\nChanges to deliverables not listed in the original agreement\nAdditional file formats not specified at project start\nFeedback submitted after the review window closes",
  additionalRevisionRate: 180,
  currency: "USD",
};

const DEFAULT_HANDOVER = {
  projectName: "Brand Identity",
  clientName: "Atlas & Bell, Inc.",
  handoverDate: "2026-07-15",
  deliverablesList: "Logo suite (primary, monogram, wordmark)\nColor palette & type system\nBrand guidelines PDF\nStationery files (business card, letterhead)\nSocial media templates (10 Figma files)",
  fileLocations: "**Figma:** figma.com/file/XXXXXXXXX\n**Google Drive:** drive.google.com/XXXXXXXXX\nFinal exports: /Final Assets folder",
  credentialsHandedOver: "**Figma:** file ownership transferred to client workspace\n**Font licenses:** certificates in /Licenses folder",
  nextStepsForClient: "Download all assets from the shared Drive folder\nTransfer Figma file to your team workspace\nReview brand guidelines with your marketing team\nReach out with questions within 30 days",
  studioSignOffName: "Maren Aksel",
};

const DEFAULT_QUOTE = {
  serviceDescription: "Brand Identity Design",
  hours: 40,
  hourlyRate: 180,
  currency: "USD",
  discountPct: 0,
  taxPct: 0,
};

const DEFAULT_SOCIAL = {
  quote: {
    label: "A Better Future",
    quote: "The secret to social media success? Authenticity & consistency.",
    role: "Director",
    attribution: "Maren Aksel",
  },
  stat: {
    kicker: "By the numbers",
    italicLead: "Why do most posts fail?",
    stat: "91%",
    statLabel: "of posts get zero meaningful engagement.",
  },
  announce: {
    label: "A Better Future",
    headlineA: "The Startup Formula",
    headlineB: "Strategy, Execution, Growth.",
  },
  steps: {
    kicker: "Method",
    headline: "MY STEP-BY-STEP PROCESS FOR CREATING HIGH-PERFORMING",
    circled: "POSTS",
    pillLeft: "Strategy",
    pillRight: "Digital",
    note: "Let us handle your content so you can focus on growth.",
  },
  ba: {
    before: "A blank page and a deadline.",
    beforeNote: "Where most projects start.",
    after: "A document that earns the deal.",
    afterNote: "What good work looks like.",
  },
  manifesto: {
    kicker: "Manifesto",
    lead: "Tech that",
    italic: "just works.",
    tail: "You should not have to worry about how it works. You just need it to perform.",
  },
  framework: {
    title: "The LMMS Method",
    subtitle: "How we run client projects,",
    steps: "Listen — hear the actual ask, not the requested one.\nMap — name every constraint, on paper.\nMake — propose the smallest version that ships.\nShip — ship before it's perfect; iterate in daylight.",
  },
  story: {
    coverLead: "How we doubled close-rate",
    coverItalic: "in a quarter.",
    slides: "The Problem — You're getting views but no conversions. Here's why.\nThe Shift — Treat the document as part of the product, not an afterthought.\nThe Result — Clients sign faster. Briefs come back warmer. Work compounds.",
  },
  tipscarousel: {
    kicker: "Field Notes",
    subtitle: "What I've learned shipping freelance work for the better part of a decade.",
    tips: "Write the email before the spec.\nPrice the outcome, not the hour.\nNever pitch what you can't deliver.\nDocument decisions, not opinions.\nShip the smallest useful thing.",
  },
  booking: {
    label: "Now Booking",
    lead: "Two spots open for",
    window: "Q3",
    subtext: "Brand and product work. Four-to-six-week engagements. Friendly intake, written deliverables, no agency overhead.",
    ctaText: "Inquire via DM",
  },
  linkbio: {
    label: "New Essay",
    kicker: "On documents",
    headlineA: "Why your proposal is",
    headlineB: "your portfolio.",
    subtext: "A short piece on the small things that build trust before the work has even started.",
    url: "northquill.studio/essays",
  },
  launch: {
    kicker: "Launching",
    category: "A document generator",
    productName: "Atelier",
    tagline: "A document generator built for working freelancers.",
    date: "May · 2026",
    ctaText: "Get early access",
  },
  mistakes: {
    kicker: "Hard Lessons",
    subtitle: "So you don't have to learn them the hard way.",
    mistakes: "Underpricing your work — I thought low rates would win clients. They attracted bad ones.\nNot writing things down — Verbal agreements disappear. Every project needs a brief.\nTaking every project — Busyness isn't the same as success. Pick your work carefully.",
  },
  miniguide: {
    kicker: "Mini Guide",
    topic: "Ship Faster",
    intro: "",
    steps: "Write the goal first — Before you open any tool, write the end state in one sentence.\nMap your constraints — List every real limitation: time, budget, scope, and patience.\nDesign the smallest version — Resist over-engineering on the first pass.\nShip and learn — Real feedback beats internal debate every time.",
  },
  breaking: {
    category: "Industry",
    date: "May · 2026",
    kicker: "Breaking",
    headline: "Freelance rates hit a 10-year high.",
    subline: "And clients are still paying.",
    body: "New data from the Freelance Forward index shows median project rates up 18% year-on-year.",
  },
  digest: {
    period: "This Week In",
    topic: "Design",
    items: "The freelance market grew by 12% this quarter.\nAI tools cut design revision cycles by up to 40%.\nRemote-first studios now outbid agencies on 3 of 4 new projects.",
  },
  photopost: {
    image: "",
    tag: "Field Notes",
    caption: "The desk at 6am is the best version of the desk.",
  },
  showcase: {
    image: "",
    client: "Atlas & Bell",
    projectType: "Brand",
    year: "2026",
    tagline: "A new identity for a platform that finally looks like it belongs.",
  },
  // --- Vertical (TikTok / Threads) ---
  hottake: {
    kicker: "Hot Take",
    lead: "You don't need another tool.",
    body: "You need to ",
    italic: "finish one",
    tail: " of the seven tabs already open.",
  },
  toplist: {
    kicker: "Field Notes",
    title: "Top ",
    titleAccent: "rules",
    subtitle: "from a freelance decade.",
    items: "Listen before you build.\nWrite the email first.\nDocument as you go.\nPrice the outcome.\nShip in daylight.",
  },
  question: {
    kicker: "Question of the Week",
    question: "Are you a freelancer",
    questionAccent: "or a hobbyist?",
    answer: "The difference is not how good you are. It's whether someone is paying you to be that good before next Tuesday.",
  },
  statv: {
    kicker: "By the Numbers",
    italicLead: "An uncomfortable truth",
    stat: "73%",
    statLabel: "of solo freelancers undercharge by at least 30%.",
    source: "Survey of 1,200 — 2026",
  },
  threads: {
    kicker: "From the Feed",
    body: "the hardest part of freelancing isn't the work. it's deciding the work is finished and sending the invoice.",
    italicLine: "yes, this is a personal attack.",
    time: "2h",
    replies: "184",
    reposts: "62",
    likes: "1.2k",
  },
  tutorial: {
    kicker: "Tutorial",
    duration: "60 sec",
    what: "rebrand a",
    whatItalic: "small studio",
    steps: "Audit existing brand touchpoints.\nMap the customer journey.\nWrite the headline first.\nDesign in low-fi.\nShip and iterate.",
    ctaText: "Watch full",
  },
  portfolio: {
    kicker: "Case Study",
    refNo: "No. 014",
    role: "Brand · Identity · Web",
    year: "2026",
    client: "Atlas & Bell",
    titleItalic: "a new brand for a B2B platform.",
    image: "",
  },
  casestudy: {
    client: "Atlas & Bell",
    year: "2026",
    stat: "+312%",
    statLabel: "increase in qualified leads in the first 90 days post-launch.",
    tag1: "Brand",
    tag2: "Web",
    tag3: "8 weeks",
    image: "",
  },
  pov: {
    scene: "It's Friday at 4pm. The invoice clears. You ",
    action: "close the laptop",
    tail: " and start the weekend.",
    endTag: "— the dream",
  },
  schedule: {
    kicker: "Weekly Schedule",
    title: "How I run a",
    titleItalic: "calm week.",
    items: "MON — Client calls + check-ins\nTUE — Deep work block 1\nWED — Deep work block 2\nTHU — Reviews + revisions\nFRI — Ship + invoice\nSAT — Read + walk\nSUN — Plan the week",
  },
  // New social templates
  pricing: {
    packageName: "Brand Starter",
    price: 1500,
    currency: "USD",
    features: "Logo + brand mark\nColor palette & type system\nBrand guidelines (12 pages)\n2 revision rounds\nSource files included",
    ctaText: "DM to get started →",
    bg: "",
  },
  testimonial: {
    quote: "Working with this studio changed how I think about proposals entirely. We closed our next deal the same week.",
    clientName: "Priya Bell",
    clientTitle: "Co-Founder · Atlas & Bell",
    clientPhoto: "",
  },
  casestudycarousel: {
    projectName: "Brand Identity",
    clientName: "Atlas & Bell",
    problem: "Their existing mark read as a 2019 SaaS startup — not the 2026 platform they'd become.",
    image1: "",
    solution: "A full identity system: logo, type, colour, and a 32-page guidelines document the team can extend without us.",
    image2: "",
    result: "Closed their Series B within 90 days of launch. The new brand was cited in three investor decks.",
    image3: "",
  },
};

/* ---------- Doc type registry ---------- */
const DOC_TYPES = [
  { id: "agreement",  name: "Agreement",  icon: Icon.doc,      Editor: AgreementEditor,  defaults: DEFAULT_AGREEMENT,  hasVariants: true },
  { id: "invoice",    name: "Invoice",    icon: Icon.receipt,  Editor: InvoiceEditor,    defaults: DEFAULT_INVOICE,    hasVariants: true },
  { id: "proposal",   name: "Proposal",  icon: Icon.proposal, Editor: ProposalEditor,   defaults: DEFAULT_PROPOSAL,   hasVariants: true },
  { id: "prd",        name: "PRD",        icon: Icon.prd,      Editor: PRDEditor,        defaults: DEFAULT_PRD,        hasVariants: true },
  { id: "retainer",   name: "Retainer",  icon: Icon.doc,      Editor: RetainerEditor,   defaults: DEFAULT_RETAINER,   hasVariants: true },
  { id: "receipt",    name: "Receipt",   icon: Icon.receipt,  Editor: ReceiptEditor,    defaults: DEFAULT_RECEIPT,    hasVariants: true },
  { id: "onboarding", name: "Onboarding",icon: Icon.proposal, Editor: OnboardingEditor, defaults: DEFAULT_ONBOARDING, hasVariants: true },
  { id: "scopeguard", name: "Scope Guard",icon: Icon.prd,     Editor: ScopeGuardEditor, defaults: DEFAULT_SCOPEGUARD, hasVariants: true },
  { id: "handover",   name: "Handover",  icon: Icon.doc,      Editor: HandoverEditor,   defaults: DEFAULT_HANDOVER,   hasVariants: true },
  { id: "social",     name: "Social",    icon: Icon.social,   Editor: SocialEditor,     defaults: DEFAULT_SOCIAL,     hasVariants: false },
  { id: "quote",      name: "Calculator",icon: Icon.calc,     Editor: QuoteCalculatorPanel, defaults: DEFAULT_QUOTE,  hasVariants: false, isTool: true },
];

const VARIANTS = [
  { id: "classic",   name: "Classic" },
  { id: "modern",    name: "Modern" },
  { id: "editorial", name: "Editorial" },
];

/* ---------- Combined social template list ---------- */
const AllSocialTemplates = [...SocialTemplates, ...(window.TikTokTemplates || [])];

/* ---------- App ---------- */

function App() {
  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#1c4532",
    "fontHeader": "serif",
    "fontBody": "sans",
    "paper": "letter"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweak side-effects to CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-soft", t.accent + "1a");
    const headerMap = {
      serif: '"Source Serif 4", Georgia, serif',
      display: '"Instrument Serif", Georgia, serif',
      sans: '"Manrope", -apple-system, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    };
    document.documentElement.style.setProperty("--font-display", headerMap[t.fontHeader] || headerMap.serif);
    document.documentElement.style.setProperty("--font-serif", t.fontHeader === "display" ? headerMap.display : headerMap.serif);
    const bodyMap = {
      serif: '"Source Serif 4", Georgia, serif',
      sans: '"Manrope", -apple-system, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    };
    document.documentElement.style.setProperty("--font-sans", bodyMap[t.fontBody] || bodyMap.sans);
  }, [t.accent, t.fontHeader, t.fontBody]);

  // State (v2 storage — schema changed when social templates were rebuilt)
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [socialStep, setSocialStep] = useState("pick");
  const [zoom, setZoom] = useState(0.5);

  // Reset to pick panel whenever switching to social
  useEffect(() => {
    if (docType === "social") setSocialStep("pick");
  }, [docType]);

  // Auto-fit zoom to preview width when doc or template changes
  const stageRef = useRef(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let tW = 8.5 * 96, tH = 11 * 96;
    if (docType === "social") {
      const tpl = AllSocialTemplates.find(s => s.id === socialTemplateId);
      tW = (tpl && tpl.width) || 1080;
      tH = (tpl && tpl.height) || 1080;
    }
    const padding = 80;
    const fitW = (stage.clientWidth - padding) / tW;
    const fitH = (stage.clientHeight - padding) / tH;
    const fit = Math.max(0.15, Math.min(0.9, Math.min(fitW, fitH)));
    setZoom(Number(fit.toFixed(2)));
  }, [docType, socialTemplateId]);

  // expose brand globally for social tile thumbnails to read
  useEffect(() => { window.__brand = brand; }, [brand]);

  const cfg = DOC_TYPES.find(d => d.id === docType);
  const data = docData[docType] || cfg.defaults;
  const setData = (next) => setDocData({ ...docData, [docType]: next });

  // For social: data is { [tplId]: {...fields} } — derive the active slice
  const socialActiveData = docType === "social"
    ? (data[socialTemplateId] || (DEFAULT_SOCIAL[socialTemplateId] || {}))
    : null;
  const setSocialActiveData = (next) => setData({ ...data, [socialTemplateId]: next });

  const ActiveSocial = docType === "social" ? AllSocialTemplates.find(s => s.id === socialTemplateId) : null;
  const socialSlides = ActiveSocial ? ActiveSocial.slides({ data: socialActiveData || {}, brand }) : [];

  // Paper class
  const paperClass = `paper paper--${t.paper}`;

  const TplComponent = docType !== "social"
    ? (DocTemplates[docType] || {})[variant]
    : null;

  // Compute target node for export (single post)
  const exportTarget = docType === "social" ? "#social-target-0" : "#paper-target";

  const isToolMode = cfg && cfg.isTool;

  // Calc filename
  const filename = useMemo(() => {
    if (docType === "invoice")   return `${(data.invoiceNo  || "invoice").replace(/\s+/g, "-")}`;
    if (docType === "receipt")   return `${(data.receiptNo  || "receipt").replace(/\s+/g, "-")}`;
    if (docType === "quote")     return "quick-quote";
    if (docType === "social") {
      const tpl = SocialTemplates.find(s => s.id === socialTemplateId);
      return `${(tpl?.name || "social").toLowerCase().replace(/\s+/g, "-")}`;
    }
    const slug = (data.title || data.projectName || data.clientName || data.refNo || "doc")
      .toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    return `${docType}-${slug}`;
  }, [docType, data, socialTemplateId]);

  const handlePrint = () => exportPrint(exportTarget);
  const handleImage = (fmt) => exportImage(exportTarget, filename, fmt);

  // Download all carousel slides sequentially as individual files
  const downloadAllSlides = async (fmt) => {
    for (let i = 0; i < socialSlides.length; i++) {
      await exportImage(`#social-target-${i}`, `${filename}-${String(i + 1).padStart(2, "0")}`, fmt);
      // small delay to avoid the browser batching downloads
      await new Promise(r => setTimeout(r, 300));
    }
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
          {DOC_TYPES.filter(d => d.id !== "social" && !d.isTool).map(d => (
            <button
              key={d.id}
              className={"sidebar__item " + (docType === d.id ? "sidebar__item--active" : "")}
              onClick={() => setDocType(d.id)}
            >
              <span className="sidebar__item-icon">{d.icon}</span>
              <span>{d.name}</span>
              {d.hasVariants && <span className="sidebar__item-count">03</span>}
            </button>
          ))}
        </div>

        <div className="sidebar__group">
          <div className="sidebar__heading">Social</div>
          <button
            className={"sidebar__item " + (docType === "social" ? "sidebar__item--active" : "")}
            onClick={() => setDocType("social")}
          >
            <span className="sidebar__item-icon">{Icon.social}</span>
            <span>Social media</span>
            <span className="sidebar__item-count">{AllSocialTemplates.length}</span>
          </button>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__heading">Tools</div>
          {DOC_TYPES.filter(d => d.isTool).map(d => (
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
          <span className="sidebar__avatar">{(brand.fullName || "M A").split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase()}</span>
          <div className="sidebar__user">
            <div className="sidebar__user-name">{brand.fullName || "—"}</div>
            <div className="sidebar__user-tag">{brand.handle || "—"}</div>
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
              ? (socialStep === "pick" ? "Social · Browse" : `Social · ${ActiveSocial?.kind || "Single"}`)
              : cfg.isTool
              ? "Tools"
              : `${cfg.name} · ${VARIANTS.find(v => v.id === variant)?.name}`}
          </div>
          <h1 className="editor__title">
            {docType === "social"
              ? (socialStep === "pick" ? "Choose a template" : (ActiveSocial?.name || "Template"))
              : cfg.isTool
              ? cfg.name
              : (data.title || data.projectName || data.clientName || cfg.name)}
          </h1>
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
          {docType === "social"    && (
            <SocialEditor
              data={data}
              onChange={setData}
              templates={AllSocialTemplates}
              activeId={socialTemplateId}
              setActiveId={setSocialTemplateId}
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
              ? `${ActiveSocial?.width || 1080} × ${ActiveSocial?.height || 1080} · ${ActiveSocial?.kind}`
              : `${t.paper === "a4" ? "A4" : "Letter"} · 8.5×11 in`}
          </span>
          <div className="preview__bar-spacer"></div>

          {!isToolMode && (
            <div className="zoom-group">
              <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>{Icon.zoomOut}</button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button className="zoom-btn" onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}>{Icon.zoomIn}</button>
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

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#1c4532", "#7a3422", "#3a3a64", "#2a3441", "#1f2937", "#4a3a1a"]}
          onChange={v => setTweak("accent", v)}
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
          onChange={v => setTweak("fontHeader", v)}
        />
        <TweakSelect
          label="Body"
          value={t.fontBody}
          options={[
            { value: "sans", label: "Sans" },
            { value: "serif", label: "Serif" },
            { value: "mono", label: "Mono" },
          ]}
          onChange={v => setTweak("fontBody", v)}
        />
        <TweakSection label="Page" />
        <TweakRadio
          label="Paper size"
          value={t.paper}
          options={["letter", "a4"]}
          onChange={v => setTweak("paper", v)}
        />
      </TweaksPanel>
    </div>
  );
}

/* ---------- Social Preview ---------- */
function SocialPreview({ template, data, brand, zoom }) {
  if (!template) return null;
  const slides = template.slides({ data, brand });
  const isCarousel = slides.length > 1;
  const fileBase = template.name.toLowerCase().replace(/\s+/g, "-");

  const dlSlide = async (i, fmt) => {
    await exportImage(`#social-target-${i}`, `${fileBase}-${String(i + 1).padStart(2, "0")}`, fmt);
  };

  return (
    <div className="social-stage">
      {slides.map((slide, i) => (
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
function SettingsModal({ brand, setBrand, onClose }) {
  const set = (k, v) => setBrand({ ...brand, [k]: v });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <span className="modal__title">Studio settings</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <div style={{ fontSize: 12, color: "var(--shell-muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Used as the "from" details on every document. Stored locally on this device.
          </div>
          <Field label="Studio / Business name">
            <TextInput value={brand.studioName} onChange={v => set("studioName", v)} />
          </Field>
          <Field label="Your full name">
            <TextInput value={brand.fullName} onChange={v => set("fullName", v)} />
          </Field>
          <div className="field__row">
            <Field label="Social handle">
              <TextInput value={brand.handle} onChange={v => set("handle", v)} />
            </Field>
            <Field label="Email">
              <TextInput value={brand.email} onChange={v => set("email", v)} />
            </Field>
          </div>
          <Field label="Studio address">
            <Textarea value={brand.studioAddress} onChange={v => set("studioAddress", v)} />
          </Field>
          <Field label="Payment details (markdown)">
            <Textarea value={brand.payment} onChange={v => set("payment", v)} />
          </Field>
          <Field label="Tax ID / Business no.">
            <TextInput value={brand.taxId} onChange={v => set("taxId", v)} />
          </Field>

          <div style={{ borderTop: "1px solid var(--shell-rule)", paddingTop: 20, marginTop: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--shell-muted)", marginBottom: 14 }}>
              Brand Identity
            </div>
            <ImageField
              label="Company logo"
              hint="SVG, PNG or JPG. Use a version that works on both light and dark backgrounds."
              value={brand.logo}
              onChange={v => set("logo", v)}
            />
            {brand.logo && (
              <Field label="Show logo on templates">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={brand.logoEnabled !== false}
                    onChange={e => set("logoEnabled", e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--shell-muted)" }}>
                    {brand.logoEnabled !== false ? "Enabled — showing on all templates" : "Disabled"}
                  </span>
                </label>
              </Field>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mount ---------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
