export const DEFAULT_BRAND = {
  studioName: "North & Quill",
  fullName: "Maren Aksel",
  handle: "@northquill",
  email: "hello@northquill.studio",
  studioAddress: "Studio 4, Old Loom Works\n221 Baker St, Brooklyn NY 11201",
  payment: "Bank: First Union\nAccount: 0021-4499-823\nRouting: 021000089\nor — Wise / PayPal: hello@northquill.studio",
  taxId: "EIN 88-1234567",
  logo: "",
  logoLight: "",
  logoAvatar: "",
  logoEnabled: true,
};

export const DEFAULT_AGREEMENT = {
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

export const DEFAULT_INVOICE = {
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

export const DEFAULT_PROPOSAL = {
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

export const DEFAULT_PRD = {
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

export const DEFAULT_RETAINER = {
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

export const DEFAULT_RECEIPT = {
  receiptNo: "REC-2026-001",
  clientName: "Atlas & Bell, Inc.",
  paymentDate: "2026-05-20",
  itemDescription: "Brand identity — Phase 01 deposit",
  amount: 9600,
  currency: "USD",
  paymentMethod: "Bank transfer",
  notes: "Thank you for your payment. This receipt confirms funds received in full.",
};

export const DEFAULT_ONBOARDING = {
  clientName: "Atlas & Bell, Inc.",
  projectName: "Brand Identity",
  startDate: "2026-06-01",
  deliverables: "Primary logo & monogram\nType system\nColor palette\nBrand guidelines PDF\nStationery set",
  assetsNeeded: "Brand brief / positioning deck\nExisting logo files (if any)\nFont licenses in use\nHigh-res photography",
  communicationChannel: "Slack (shared workspace)",
  meetingSchedule: "Weekly check-ins, Tuesdays 10am EST",
  pointOfContact: "Maren Aksel — hello@northquill.studio",
};

export const DEFAULT_SCOPEGUARD = {
  projectName: "Brand Identity",
  clientName: "Atlas & Bell, Inc.",
  includedRevisions: "2",
  whatIsRevision: "A revision is a set of consolidated feedback on the same deliverable, submitted in a single round. Minor text and colour adjustments within the same creative direction are included.",
  whatIsOutOfScope: "A new creative direction after one has been approved\nChanges to deliverables not listed in the original agreement\nAdditional file formats not specified at project start\nFeedback submitted after the review window closes",
  additionalRevisionRate: 180,
  currency: "USD",
};

export const DEFAULT_HANDOVER = {
  projectName: "Brand Identity",
  clientName: "Atlas & Bell, Inc.",
  handoverDate: "2026-07-15",
  deliverablesList: "Logo suite (primary, monogram, wordmark)\nColor palette & type system\nBrand guidelines PDF\nStationery files (business card, letterhead)\nSocial media templates (10 Figma files)",
  fileLocations: "**Figma:** figma.com/file/XXXXXXXXX\n**Google Drive:** drive.google.com/XXXXXXXXX\nFinal exports: /Final Assets folder",
  credentialsHandedOver: "**Figma:** file ownership transferred to client workspace\n**Font licenses:** certificates in /Licenses folder",
  nextStepsForClient: "Download all assets from the shared Drive folder\nTransfer Figma file to your team workspace\nReview brand guidelines with your marketing team\nReach out with questions within 30 days",
  studioSignOffName: "Maren Aksel",
};

export const DEFAULT_QUOTE = {
  serviceDescription: "Brand Identity Design",
  hours: 40,
  hourlyRate: 180,
  currency: "USD",
  discountPct: 0,
  taxPct: 0,
};

export const DEFAULT_SOCIAL: Record<string, any> = {
  quote: { label: "A Better Future", quote: "The secret to social media success? Authenticity & consistency.", role: "Director", attribution: "Maren Aksel" },
  stat: { kicker: "By the numbers", italicLead: "Why do most posts fail?", stat: "91%", statLabel: "of posts get zero meaningful engagement." },
  announce: { label: "A Better Future", headlineA: "The Startup Formula", headlineB: "Strategy, Execution, Growth." },
  steps: { kicker: "Method", headline: "MY STEP-BY-STEP PROCESS FOR CREATING HIGH-PERFORMING", circled: "POSTS", pillLeft: "Strategy", pillRight: "Digital", note: "Let us handle your content so you can focus on growth." },
  ba: { before: "A blank page and a deadline.", beforeNote: "Where most projects start.", after: "A document that earns the deal.", afterNote: "What good work looks like." },
  manifesto: { kicker: "Manifesto", lead: "Tech that", italic: "just works.", tail: "You should not have to worry about how it works. You just need it to perform." },
  framework: { title: "The LMMS Method", subtitle: "How we run client projects,", steps: "Listen — hear the actual ask, not the requested one.\nMap — name every constraint, on paper.\nMake — propose the smallest version that ships.\nShip — ship before it's perfect; iterate in daylight." },
  story: { coverLead: "How we doubled close-rate", coverItalic: "in a quarter.", slides: "The Problem — You're getting views but no conversions. Here's why.\nThe Shift — Treat the document as part of the product, not an afterthought.\nThe Result — Clients sign faster. Briefs come back warmer. Work compounds." },
  tipscarousel: { kicker: "Field Notes", subtitle: "What I've learned shipping freelance work for the better part of a decade.", tips: "Write the email before the spec.\nPrice the outcome, not the hour.\nNever pitch what you can't deliver.\nDocument decisions, not opinions.\nShip the smallest useful thing." },
  booking: { label: "Now Booking", lead: "Two spots open for", window: "Q3", subtext: "Brand and product work. Four-to-six-week engagements. Friendly intake, written deliverables, no agency overhead.", ctaText: "Inquire via DM" },
  linkbio: { label: "New Essay", kicker: "On documents", headlineA: "Why your proposal is", headlineB: "your portfolio.", subtext: "A short piece on the small things that build trust before the work has even started.", url: "northquill.studio/essays" },
  launch: { kicker: "Launching", category: "A document generator", productName: "Atelier", tagline: "A document generator built for working freelancers.", date: "May · 2026", ctaText: "Get early access" },
  mistakes: { kicker: "Hard Lessons", subtitle: "So you don't have to learn them the hard way.", mistakes: "Underpricing your work — I thought low rates would win clients. They attracted bad ones.\nNot writing things down — Verbal agreements disappear. Every project needs a brief.\nTaking every project — Busyness isn't the same as success. Pick your work carefully." },
  miniguide: { kicker: "Mini Guide", topic: "Ship Faster", intro: "", steps: "Write the goal first — Before you open any tool, write the end state in one sentence.\nMap your constraints — List every real limitation: time, budget, scope, and patience.\nDesign the smallest version — Resist over-engineering on the first pass.\nShip and learn — Real feedback beats internal debate every time." },
  breaking: { category: "Industry", date: "May · 2026", kicker: "Breaking", headline: "Freelance rates hit a 10-year high.", subline: "And clients are still paying.", body: "New data from the Freelance Forward index shows median project rates up 18% year-on-year." },
  digest: { period: "This Week In", topic: "Design", items: "The freelance market grew by 12% this quarter.\nAI tools cut design revision cycles by up to 40%.\nRemote-first studios now outbid agencies on 3 of 4 new projects." },
  photopost: { image: "", tag: "Field Notes", caption: "The desk at 6am is the best version of the desk." },
  showcase: { image: "", client: "Atlas & Bell", projectType: "Brand", year: "2026", tagline: "A new identity for a platform that finally looks like it belongs." },
  hottake: { kicker: "Hot Take", lead: "You don't need another tool.", body: "You need to ", italic: "finish one", tail: " of the seven tabs already open." },
  toplist: { kicker: "Field Notes", title: "Top ", titleAccent: "rules", subtitle: "from a freelance decade.", items: "Listen before you build.\nWrite the email first.\nDocument as you go.\nPrice the outcome.\nShip in daylight." },
  question: { kicker: "Question of the Week", question: "Are you a freelancer", questionAccent: "or a hobbyist?", answer: "The difference is not how good you are. It's whether someone is paying you to be that good before next Tuesday." },
  statv: { kicker: "By the Numbers", italicLead: "An uncomfortable truth", stat: "73%", statLabel: "of solo freelancers undercharge by at least 30%.", source: "Survey of 1,200 — 2026" },
  threads: { kicker: "From the Feed", body: "the hardest part of freelancing isn't the work. it's deciding the work is finished and sending the invoice.", italicLine: "yes, this is a personal attack.", time: "2h", replies: "184", reposts: "62", likes: "1.2k" },
  tutorial: { kicker: "Tutorial", duration: "60 sec", what: "rebrand a", whatItalic: "small studio", steps: "Audit existing brand touchpoints.\nMap the customer journey.\nWrite the headline first.\nDesign in low-fi.\nShip and iterate.", ctaText: "Watch full" },
  portfolio: { kicker: "Case Study", refNo: "No. 014", role: "Brand · Identity · Web", year: "2026", client: "Atlas & Bell", titleItalic: "a new brand for a B2B platform.", image: "" },
  /* New CTA Defaults */
  waitlist: { kicker: "Early Access", spotsLeft: "4 spots left", headline: "The new way to build freelance proposals", subtext: "Join 350+ designers & founders in private beta testing. Instant access upon invitation.", ctaText: "Join the waitlist →" },
  leadmagnet: { category: "Free Resource", deliverableType: "PDF + Notion Sheet", title: "The 2026 Freelance Rate & Pricing Guide", benefits: "Real pricing benchmarks for 2026\nClient outreach & follow-up scripts\nScope negotiation checklist\nContract clause cheatsheet", ctaText: "Download free copy →" },
  dmkeyword: { kicker: "Free Drop", headline: "Want my Notion Client Onboarding Portal?", keyword: "ONBOARD", resourceName: "the Notion template link" },

  /* New Social Proof Defaults */
  metricproof: { kicker: "Client Results", metric: "+240%", metricLabel: "Increase in closed deal size in 60 days", summary: "Complete repositioning and brand identity overhaul for an enterprise B2B consultancy.", clientName: "Sarah Jenkins", clientRole: "Managing Director · Apex" },
  tweetreview: { kicker: "Client Feedback", review: "Vanaila Studio completely transformed our documents. Our conversion rate on proposals jumped from 22% to 68% in two weeks.", clientName: "Alex Rivera", handle: "@alexrivera_", clientTitle: "Founder" },
  casestudy: { kicker: "Case Study", client: "Luminary Media", industry: "Design & Tech · 2026", problem: "Low proposal response rate & inconsistent brand assets", solution: "Custom document template system & editorial style guide", outcome: "3.5x higher contract close rate & $95k in new client revenue" },

  /* New Single Defaults */
  checklist: { kicker: "Audit Checklist", title: "5 Things to check before sending an invoice", items: "PO or written approval attached\nPayment due date and bank details clear\nItemized deliverables breakdown\nLate fee terms clearly stated\nDirect contact for accounts payable", note: "Save this post for your next project" },
  opinion: { kicker: "Reality Check", mythTitle: "Myth", myth: "Work 80 hours a week, lower your rates to compete, and take every client you can find.", truthTitle: "Reality", truth: "Pick one high-value niche, price on business outcomes, and say no to 80% of inquiries." },
  pillars: { kicker: "Core Principles", headline: "The 3 Pillars of High-Earning Freelancers", pillar1Title: "Positioning", pillar1Body: "Specialist over generalist. Solve an expensive problem.", pillar2Title: "Packaging", pillar2Body: "Fixed deliverables, clear scopes, zero hourly billing.", pillar3Title: "Pipeline", pillar3Body: "Always cultivate relationships before you need work." },

  /* New Photo Team Onboarding Defaults */
  team1: { kicker: "Welcome to the Team", image: "", name: "Elena Rostova", position: "Lead Brand Designer", department: "Brand Studio · London", bio: "Joining our studio to lead brand identity and digital design systems.", bg: "" },
  team2: { kicker: "New Joiners", headline: "Welcoming two new leads to the studio", image1: "", name1: "Marcus Vance", position1: "Creative Director", image2: "", name2: "Aria Chen", position2: "Senior Engineer", bg: "" },
  team3: { kicker: "Meet the Crew", headline: "Meet the new faces at the studio", image1: "", name1: "Sophia Ray", position1: "Design Lead", image2: "", name2: "Liam Thorne", position2: "Staff Engineer", image3: "", name3: "Maya Patel", position3: "Product Strategist", bg: "" },

  pricing: { packageName: "Brand Starter", price: 1500, currency: "USD", features: "Logo + brand mark\nColor palette & type system\nBrand guidelines (12 pages)\n2 revision rounds\nSource files included", ctaText: "DM to get started →", bg: "" },
  testimonial: { quote: "Working with this studio changed how I think about proposals entirely. We closed our next deal the same week.", clientName: "Priya Bell", clientTitle: "Co-Founder · Atlas & Bell", clientPhoto: "" },
  casestudycarousel: { projectName: "Brand Identity", clientName: "Atlas & Bell", problem: "Their existing mark read as a 2019 SaaS startup — not the 2026 platform they'd become.", image1: "", solution: "A full identity system: logo, type, colour, and a 32-page guidelines document the team can extend without us.", image2: "", result: "Closed their Series B within 90 days of launch. The new brand was cited in three investor decks.", image3: "" },
};
