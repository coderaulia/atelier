// ---- Curated content library for CV bullet suggestions ----
// Organised by role, industry, seniority, and skill category.
// Each phrase uses strong action verbs and is ready to customise with metrics.

export interface ContentPhrase {
  id: string;
  text: string;
  category: string;
}

export interface ContentLibraryEntry {
  key: string;
  label: string;
  phrases: ContentPhrase[];
}

// ---- Tech roles ----
const TECH_ENTRY: ContentLibraryEntry[] = [
  {
    key: 'engineer',
    label: 'Software Engineer',
    phrases: [
      { id: 'se-01', text: 'Architected and delivered a microservices-based platform handling X requests/day, reducing p99 latency by Y%', category: 'architecture' },
      { id: 'se-02', text: 'Designed and implemented RESTful APIs serving X clients, reducing integration time for new partners by Y%', category: 'backend' },
      { id: 'se-03', text: 'Led migration of legacy monolith to distributed microservices, cutting deployment time from X hours to Y minutes', category: 'architecture' },
      { id: 'se-04', text: 'Built automated CI/CD pipeline using GitHub Actions, increasing deployment frequency from weekly to daily', category: 'devops' },
      { id: 'se-05', text: 'Wrote X unit/integration tests achieving Y% code coverage, reducing regression bugs by Z%', category: 'qa' },
      { id: 'se-06', text: 'Optimised database queries reducing page load time by X% and improving Lighthouse scores from Y to Z', category: 'performance' },
      { id: 'se-07', text: 'Mentored X junior engineers through structured code reviews, pair programming, and weekly knowledge-sharing sessions', category: 'leadership' },
      { id: 'se-08', text: 'Collaborated with product and design teams to ship X features across Y releases within quarterly roadmap', category: 'collaboration' },
    ],
  },
  {
    key: 'frontend',
    label: 'Frontend Engineer',
    phrases: [
      { id: 'fe-01', text: 'Rebuilt legacy UI in React/TypeScript, improving FCP by X% and Core Web Vitals across Y product pages', category: 'performance' },
      { id: 'fe-02', text: 'Created a reusable component library used by X teams, reducing UI development time by Y%', category: 'architecture' },
      { id: 'fe-03', text: 'Implemented accessible UI patterns achieving WCAG 2.1 AA compliance across all user-facing screens', category: 'accessibility' },
      { id: 'fe-04', text: 'Optimised bundle size by X% through code splitting, lazy loading, and tree-shaking', category: 'performance' },
      { id: 'fe-05', text: 'Built interactive data visualisations used by X daily active users, processing Y records in real time', category: 'visualisation' },
      { id: 'fe-06', text: 'Led frontend architecture for a greenfield SaaS product, establishing coding standards and review processes', category: 'leadership' },
    ],
  },
  {
    key: 'fullstack',
    label: 'Full Stack Developer',
    phrases: [
      { id: 'fs-01', text: 'Developed end-to-end features across React frontend and Node.js backend, delivering X user-facing capabilities in Y sprints', category: 'fullstack' },
      { id: 'fs-02', text: 'Designed and implemented authentication and authorisation system supporting X roles with granular permission controls', category: 'security' },
      { id: 'fs-03', text: 'Built real-time collaboration features using WebSockets, supporting X concurrent users with Yms latency', category: 'realtime' },
      { id: 'fs-04', text: 'Set up monitoring and alerting with Datadog/Sentry, reducing MTTR from X days to Y hours', category: 'devops' },
    ],
  },
];

const TECH_MID: ContentLibraryEntry[] = [
  {
    key: 'senior-engineer',
    label: 'Senior Engineer',
    phrases: [
      { id: 'se-s-01', text: 'Drove technical strategy across X teams, aligning architecture decisions with business goals and reducing tech debt by Y%', category: 'strategy' },
      { id: 'se-s-02', text: 'Established engineering best practices including RFC process, incident response playbook, and performance budgets', category: 'process' },
      { id: 'se-s-03', text: 'Led cross-team initiative migrating X services to cloud infrastructure, reducing infrastructure costs by Y%', category: 'cloud' },
      { id: 'se-s-04', text: 'Designed and ran on-call rotation for X teams, achieving Y% reduction in page volume through systematic improvements', category: 'reliability' },
    ],
  },
  {
    key: 'tech-lead',
    label: 'Tech Lead',
    phrases: [
      { id: 'tl-01', text: 'Led a team of X engineers across Y locations, delivering Z projects on schedule with zero critical production incidents', category: 'leadership' },
      { id: 'tl-02', text: 'Championed engineering culture of psychological safety, resulting in X% improvement in team satisfaction scores', category: 'culture' },
      { id: 'tl-03', text: 'Negotiated technical requirements across X stakeholders, translating business needs into actionable engineering roadmaps', category: 'communication' },
      { id: 'tl-04', text: 'Reduced onboarding time for new engineers from X weeks to Y days through improved documentation and mentorship structure', category: 'mentorship' },
    ],
  },
];

// ---- Finance ----
const FINANCE_ENTRY: ContentLibraryEntry[] = [
  {
    key: 'finance-analyst',
    label: 'Financial Analyst',
    phrases: [
      { id: 'fa-01', text: 'Built financial models projecting X% revenue growth, used by leadership for strategic planning and board reporting', category: 'modelling' },
      { id: 'fa-02', text: 'Analysed X years of operational data to identify Y cost-saving opportunities, delivering $Z in annual savings', category: 'analysis' },
      { id: 'fa-03', text: 'Automated monthly reporting dashboards in Tableau/Power BI, reducing manual work by X hours per close cycle', category: 'automation' },
      { id: 'fa-04', text: 'Conducted variance analysis across X departments, identifying Y discrepancies and recommending Z corrective actions', category: 'analysis' },
    ],
  },
];

// ---- Marketing / Creative ----
const MARKETING_ENTRY: ContentLibraryEntry[] = [
  {
    key: 'marketing-mgr',
    label: 'Marketing Manager',
    phrases: [
      { id: 'mk-01', text: 'Developed and executed multi-channel campaigns across X channels, generating Y leads with Z% conversion rate', category: 'campaign' },
      { id: 'mk-02', text: 'Managed $X monthly ad budget across Google/Meta/LinkedIn, achieving Y% ROAS and Z% lower CPA quarter-over-quarter', category: 'paid' },
      { id: 'mk-03', text: 'Grew organic traffic by X% through SEO strategy including content hub, technical audits, and link-building programme', category: 'seo' },
      { id: 'mk-04', text: 'Launched X product marketing initiatives resulting in Y% increase in product-qualified leads within Z months', category: 'product' },
    ],
  },
];

// ---- Healthcare ----
const HEALTHCARE_ENTRY: ContentLibraryEntry[] = [
  {
    key: 'healthcare',
    label: 'Healthcare Professional',
    phrases: [
      { id: 'hc-01', text: 'Managed caseload of X patients daily, maintaining Y% satisfaction scores and Z% compliance with clinical protocols', category: 'clinical' },
      { id: 'hc-02', text: 'Led quality improvement initiative that reduced readmission rates by X% over Y months across Z patient groups', category: 'quality' },
      { id: 'hc-03', text: 'Implemented electronic health record system upgrade, training X staff and achieving Y% adoption within Z weeks', category: 'ehr' },
    ],
  },
];

// ---- Education ----
const EDUCATION_ENTRY: ContentLibraryEntry[] = [
  {
    key: 'educator',
    label: 'Educator',
    phrases: [
      { id: 'ed-01', text: 'Designed and delivered curriculum for X students across Y grade levels, achieving Z% improvement in standardised scores', category: 'curriculum' },
      { id: 'ed-02', text: 'Integrated technology tools including [tools] into classroom instruction, increasing student engagement by X%', category: 'edtech' },
      { id: 'ed-03', text: 'Led professional development workshops for X fellow educators on [topic], rated Y/5 by participants', category: 'leadership' },
    ],
  },
];

// ---- Skill-specific phrases ----
const SKILL_PHRASES: ContentPhrase[] = [
  { id: 'sk-general-01', text: 'Leveraged [skill/technology] to [achieve specific outcome], resulting in [quantifiable result]', category: 'general' },
  { id: 'sk-general-02', text: 'Optimised [process/system] using [tool/methodology], achieving X% improvement in [metric]', category: 'general' },
  { id: 'sk-general-03', text: 'Collaborated with cross-functional teams including [team1], [team2], and [team3] to [accomplish goal]', category: 'collaboration' },
  { id: 'sk-general-04', text: 'Trained and mentored X team members on [skill/tool], improving team throughput by Y%', category: 'mentorship' },
  { id: 'sk-soft-01', text: 'Facilitated conflict resolution between X stakeholders, achieving consensus on [decision] within Y days', category: 'soft-skills' },
  { id: 'sk-soft-02', text: 'Presented [findings/proposal] to X executive stakeholders, securing buy-in and Y budget allocation', category: 'communication' },
  { id: 'sk-soft-03', text: 'Prioritised competing requests across X teams using [framework], ensuring Y% on-time delivery', category: 'organisation' },
  { id: 'sk-soft-04', text: 'Adapted to rapidly shifting priorities by restructuring team workflow, maintaining Z% delivery velocity', category: 'adaptability' },
];

// ---- Leadership ----
const LEADERSHIP_PHRASES: ContentPhrase[] = [
  { id: 'ld-01', text: 'Built and led a team of X direct reports, achieving Y% retention and Z% promotion rate within the organisation', category: 'team-building' },
  { id: 'ld-02', text: 'Set quarterly OKRs for X department, consistently achieving/exceeding Y% of key results', category: 'strategy' },
  { id: 'ld-03', text: 'Established performance review framework with X dimensions, improving feedback quality score by Y%', category: 'performance' },
  { id: 'ld-04', text: 'Managed $X budget across Y initiatives, delivering Z% of planned outcomes within constraints', category: 'budget' },
];

// ---- Master library ----
export function getAllPhrases(): ContentPhrase[] {
  const all: ContentPhrase[] = [];
  for (const group of [...TECH_ENTRY, ...TECH_MID, ...FINANCE_ENTRY, ...MARKETING_ENTRY, ...HEALTHCARE_ENTRY, ...EDUCATION_ENTRY]) {
    all.push(...group.phrases);
  }
  all.push(...SKILL_PHRASES, ...LEADERSHIP_PHRASES);
  return all;
}

export function getPhrasesByRole(roleKey: string): ContentPhrase[] {
  const found = [...TECH_ENTRY, ...TECH_MID, ...FINANCE_ENTRY, ...MARKETING_ENTRY, ...HEALTHCARE_ENTRY, ...EDUCATION_ENTRY]
    .find((g) => g.key === roleKey);
  return found?.phrases ?? [];
}

export function getPhrasesByCategory(category: string): ContentPhrase[] {
  return getAllPhrases().filter((p) => p.category === category);
}

// ---- Role groups for UI ----
export const ROLE_GROUPS: { label: string; entries: ContentLibraryEntry[] }[] = [
  { label: 'Tech — Entry/Mid', entries: TECH_ENTRY },
  { label: 'Tech — Senior/Lead', entries: TECH_MID },
  { label: 'Finance', entries: FINANCE_ENTRY },
  { label: 'Marketing / Creative', entries: MARKETING_ENTRY },
  { label: 'Healthcare', entries: HEALTHCARE_ENTRY },
  { label: 'Education', entries: EDUCATION_ENTRY },
];

export const GENERAL_PHRASES = SKILL_PHRASES;
export const LEADERSHIP = LEADERSHIP_PHRASES;
