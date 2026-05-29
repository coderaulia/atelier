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
