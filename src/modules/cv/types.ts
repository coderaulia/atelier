export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatar?: string; // base64 data URL
  photo?: string; // base64 data URL for regional mode
  dateOfBirth?: string;
  maritalStatus?: string;
  religion?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // markdown bullets
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credentialId?: string;
  url?: string;
}

// ---- Guided Start ----
export interface CVStartupConfig {
  targetRole: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  industry: 'tech' | 'finance' | 'creative' | 'healthcare' | 'education' | 'other';
}

// ---- Custom Sections ----
export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
  order: number;
}

// ---- Regional Mode ----
export type CVRegionalMode = 'international' | 'indonesia';

export interface CVRegionalConfig {
  id: CVRegionalMode;
  label: string;
  showPhoto: boolean;
  showDob: boolean;
  showMaritalStatus: boolean;
  showReligion: boolean;
  sectionOrder: string[];
  description: string;
}

export const CV_REGIONAL_CONFIGS: CVRegionalConfig[] = [
  {
    id: 'international',
    label: 'International',
    showPhoto: false,
    showDob: false,
    showMaritalStatus: false,
    showReligion: false,
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'certifications'],
    description: 'ATS-optimized, Western-style CV. No photo, no personal details.',
  },
  {
    id: 'indonesia',
    label: 'Indonesia',
    showPhoto: true,
    showDob: true,
    showMaritalStatus: true,
    showReligion: true,
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'certifications'],
    description: 'Indonesia-style CV with photo, DOB, marital status, religion.',
  },
]

export interface CVData {
  personal: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
}

export type CVTemplate =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'ats'
  | 'executive'
  | 'creative';

export interface CVTemplateConfig {
  id: CVTemplate;
  name: string;
  description: string;
  pro: boolean;
  accent: string;
}

export const CV_TEMPLATES: CVTemplateConfig[] = [
  { id: 'classic',   name: 'Classic',       description: 'Timeless two-column layout', pro: false, accent: '#1a1a2e' },
  { id: 'modern',    name: 'Modern',        description: 'Clean sidebar with color accent', pro: false, accent: '#0f3460' },
  { id: 'minimal',   name: 'Minimal',       description: 'Pure typography, zero noise', pro: false, accent: '#2d2d2d' },
  { id: 'ats',       name: 'ATS-Optimized', description: 'Parsed perfectly by applicant tracking systems', pro: true, accent: '#1c4532' },
  { id: 'executive', name: 'Executive',     description: 'Authoritative layout for senior roles', pro: true, accent: '#1a1a2e' },
  { id: 'creative',  name: 'Creative',      description: 'Bold visual design for creative fields', pro: true, accent: '#6b21a8' },
];

export const DEFAULT_CV: CVData = {
  personal: {
    fullName: 'Alexandra Chen',
    title: 'Senior Product Designer',
    email: 'alex@example.com',
    phone: '+1 (555) 000-1234',
    location: 'San Francisco, CA',
    website: 'alexchen.design',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
  },
  summary:
    'Design leader with 8+ years crafting digital products at scale. Passionate about systems thinking, data-informed design decisions, and shipping fast. Led 0→1 launches for fintech and consumer apps serving millions.',
  experience: [
    {
      id: 'exp1',
      company: 'Stripe',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description:
        '- Led redesign of onboarding funnel, reducing drop-off by 34%\n- Built and maintained design system serving 12 product teams\n- Managed design sprint process across 3 time zones',
    },
    {
      id: 'exp2',
      company: 'Figma',
      role: 'Product Designer',
      location: 'San Francisco, CA',
      startDate: '2019-01',
      endDate: '2021-02',
      current: false,
      description:
        '- Shipped collaborative cursor feature used by 4M+ daily users\n- Partnered with engineering to define component API contracts\n- Conducted 40+ usability studies per quarter',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Carnegie Mellon University',
      degree: 'Master of Design',
      field: 'Human-Computer Interaction',
      location: 'Pittsburgh, PA',
      startDate: '2016-08',
      endDate: '2018-05',
      current: false,
      gpa: '3.9',
    },
  ],
  skills: [
    { id: 'sk1', name: 'Figma', level: 'expert', category: 'Design Tools' },
    { id: 'sk2', name: 'Prototyping', level: 'expert', category: 'Design' },
    { id: 'sk3', name: 'User Research', level: 'advanced', category: 'Research' },
    { id: 'sk4', name: 'React', level: 'intermediate', category: 'Engineering' },
    { id: 'sk5', name: 'TypeScript', level: 'intermediate', category: 'Engineering' },
    { id: 'sk6', name: 'Design Systems', level: 'expert', category: 'Design' },
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'Google UX Design Certificate',
      issuer: 'Coursera / Google',
      date: '2020-06',
      credentialId: 'GUX-2020-CHEN',
    },
  ],
};

export function generateCVFromStartupConfig(config: CVStartupConfig): CVData {
  const role = config.targetRole || 'Professional';
  const isEntry = config.experienceLevel === 'entry';
  const isExecutive = config.experienceLevel === 'executive';
  const isSenior = config.experienceLevel === 'senior' || isExecutive;

  const industrySkills: Record<CVStartupConfig['industry'], string[]> = {
    tech: ['JavaScript', 'TypeScript', 'React', 'API Design', 'Agile Delivery', 'Problem Solving'],
    finance: ['Financial Analysis', 'Forecasting', 'Excel', 'Risk Assessment', 'Reporting', 'Stakeholder Management'],
    creative: ['Brand Strategy', 'Visual Design', 'Figma', 'Creative Direction', 'Typography', 'Client Presentation'],
    healthcare: ['Patient Care', 'Compliance', 'Documentation', 'Process Improvement', 'Team Coordination', 'Quality Standards'],
    education: ['Curriculum Design', 'Student Assessment', 'Lesson Planning', 'Classroom Management', 'Communication', 'Learning Technology'],
    other: ['Communication', 'Project Coordination', 'Problem Solving', 'Research', 'Reporting', 'Stakeholder Management'],
  };

  const summary = isEntry
    ? `Motivated ${role} candidate with strong foundation in ${config.industry} and hands-on project experience. Eager to apply analytical thinking, collaboration, and continuous learning to deliver measurable results.`
    : isExecutive
      ? `Executive ${role} with 10+ years leading teams, strategy, and cross-functional initiatives in ${config.industry}. Known for building high-performing organizations, improving operational performance, and delivering measurable business outcomes.`
      : isSenior
        ? `Senior ${role} with 5+ years driving complex initiatives in ${config.industry}. Experienced in leading cross-functional work, improving processes, and delivering measurable impact across teams.`
        : `${role} with 3+ years of experience in ${config.industry}. Skilled at translating goals into practical execution, collaborating across teams, and delivering reliable results.`;

  return {
    personal: {
      fullName: 'Your Name',
      title: role,
      email: 'you@example.com',
      phone: '+62 812 0000 0000',
      location: 'Jakarta, Indonesia',
      website: '',
      linkedin: 'linkedin.com/in/yourname',
      github: config.industry === 'tech' ? 'github.com/yourname' : '',
    },
    summary,
    experience: isEntry
      ? []
      : [
          {
            id: 'exp1',
            company: 'Company Name',
            role,
            location: 'Jakarta, Indonesia',
            startDate: '2021-01',
            endDate: '',
            current: true,
            description: isExecutive
              ? '- Led cross-functional organization to deliver strategic initiatives across multiple business units\n- Improved operational performance by [X]% through process redesign and stakeholder alignment\n- Managed team of [X] leaders and [X] total contributors across [regions/functions]'
              : '- Delivered [project/result] that improved [metric] by [X]%\n- Collaborated with [teams/stakeholders] to launch [initiative] on time\n- Reduced [cost/time/errors] by [X]% through [method/process/tool]',
          },
        ],
    education: [
      {
        id: 'edu1',
        institution: 'University Name',
        degree: isEntry ? 'Bachelor of Science' : 'Degree',
        field: config.industry === 'tech' ? 'Computer Science' : 'Field of Study',
        location: 'City, Country',
        startDate: isEntry ? '2020-08' : '2014-08',
        endDate: isEntry ? '2024-05' : '2018-05',
        current: false,
        gpa: isEntry ? '3.7' : '',
        description: isEntry ? 'Relevant coursework, honors, or campus leadership.' : '',
      },
    ],
    skills: industrySkills[config.industry].map((skill, index) => ({
      id: `sk${index + 1}`,
      name: skill,
      level: index < 3 ? 'advanced' : 'intermediate',
      category: config.industry === 'tech' ? 'Technical' : 'Professional',
    })),
    certifications: [],
  };
}

