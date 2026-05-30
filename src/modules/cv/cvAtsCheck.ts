import type { CVData } from './types';

// ---- Issue severity ----
export type LintSeverity = 'error' | 'warning' | 'info' | 'tip';

export interface LintIssue {
  id: string;
  section: string;
  severity: LintSeverity;
  message: string;
  suggestion?: string;
}

export interface ATSScore {
  overall: number;       // 0–100
  sections: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    formatting: number;
  };
  issues: LintIssue[];
  keywordMatches: { keyword: string; found: boolean; count: number }[];
}

// ---- Weak verbs to flag ----
const WEAK_VERBS = [
  'responsible for', 'helped with', 'assisted with', 'was part of',
  'participated in', 'worked on', 'involved in', 'contributed to',
  'handled', 'managed', 'did', 'made', 'took care of', 'was in charge of',
  'supported', 'maintained', 'familiar with',
];

// ---- Strong verb replacements ----
const STRONG_VERBS: Record<string, string> = {
  'responsible for': 'Led / Owned',
  'helped with': 'Contributed to',
  'assisted with': 'Facilitated / Supported',
  'was part of': 'Collaborated on',
  'participated in': 'Engaged in',
  'worked on': 'Developed / Built',
  'involved in': 'Contributed to',
  'contributed to': 'Enhanced / Improved',
  'handled': 'Managed / Directed',
  'managed': 'Oversaw / Directed',
  'did': '',
  'made': 'Created / Built',
  'took care of': 'Maintained / Managed',
  'was in charge of': 'Led / Directed',
  'supported': 'Facilitated / Strengthened',
  'maintained': 'Sustained / Optimized',
  'familiar with': '',
};

// ---- Section linting ----
function lintPersonal(data: CVData): LintIssue[] {
  const issues: LintIssue[] = [];
  const p = data.personal;

  if (!p.fullName) issues.push({ id: 'p-name', section: 'personal', severity: 'error', message: 'Missing full name.' });
  if (!p.email) issues.push({ id: 'p-email', section: 'personal', severity: 'error', message: 'Missing email address.' });
  if (!p.phone) issues.push({ id: 'p-phone', section: 'personal', severity: 'warning', message: 'Missing phone number.' });
  if (!p.location) issues.push({ id: 'p-loc', section: 'personal', severity: 'warning', message: 'Missing location.' });
  if (!p.linkedin) issues.push({ id: 'p-linkedin', section: 'personal', severity: 'info', message: 'Add LinkedIn profile URL.', suggestion: 'ATS systems and recruiters often check LinkedIn.' });

  return issues;
}

function lintSummary(text: string): LintIssue[] {
  const issues: LintIssue[] = [];

  if (!text) {
    issues.push({ id: 'sum-empty', section: 'summary', severity: 'warning', message: 'Professional summary is empty.', suggestion: 'Add 2–4 sentences highlighting your experience and key strengths.' });
    return issues;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    issues.push({ id: 'sum-short', section: 'summary', severity: 'warning', message: `Summary is very short (${wordCount} words).`, suggestion: 'Aim for 30–60 words (2–4 sentences).' });
  }
  if (wordCount > 80) {
    issues.push({ id: 'sum-long', section: 'summary', severity: 'info', message: `Summary is long (${wordCount} words).`, suggestion: 'Keep it concise — 30–60 words is ideal for ATS.' });
  }

  // Check for personal pronouns (ATS-unfriendly)
  if (text.match(/\b(I|my|me|mine)\b/i)) {
    issues.push({ id: 'sum-pronouns', section: 'summary', severity: 'tip', message: 'Summary contains personal pronouns (I, my, me).', suggestion: 'ATS-optimized summaries use third person or omit pronouns.' });
  }

  // Check for filler words
  const fillers = ['passionate', 'dynamic', 'results-driven', 'hard-working', 'team player'];
  const found = fillers.filter((f) => text.toLowerCase().includes(f));
  if (found.length > 0) {
    issues.push({ id: 'sum-fillers', section: 'summary', severity: 'tip', message: `Contains buzzwords: ${found.join(', ')}.`, suggestion: 'Replace generic buzzwords with specific achievements.' });
  }

  return issues;
}

function lintExperience(experiences: CVData['experience']): LintIssue[] {
  const issues: LintIssue[] = [];

  if (experiences.length === 0) {
    issues.push({ id: 'exp-empty', section: 'experience', severity: 'error', message: 'No work experience entries.' });
    return issues;
  }

  experiences.forEach((exp, idx) => {
    const prefix = `Experience #${idx + 1}`;

    if (!exp.role && !exp.company) {
      issues.push({ id: `exp-title-${idx}`, section: 'experience', severity: 'error', message: `${prefix}: Missing job title and company.` });
    } else if (!exp.role) {
      issues.push({ id: `exp-role-${idx}`, section: 'experience', severity: 'warning', message: `${prefix}: Missing job title.` });
    } else if (!exp.company) {
      issues.push({ id: `exp-company-${idx}`, section: 'experience', severity: 'warning', message: `${prefix}: Missing company name.` });
    }

    if (!exp.startDate) {
      issues.push({ id: `exp-dates-${idx}`, section: 'experience', severity: 'warning', message: `${prefix}: Missing start date.` });
    }

    // Check description quality
    const bullets = exp.description.split('\n').filter((l) => l.trim());
    if (bullets.length === 0) {
      issues.push({ id: `exp-desc-${idx}`, section: 'experience', severity: 'error', message: `${prefix}: No description or bullet points.` });
    } else {
      // Check for quantifiable achievements
      const hasNumbers = bullets.some((b) => /\d+%|\$[\d,.]+|\d+\+?\s*(?:users|customers|clients|teams|projects|employees|revenue|hours)/i.test(b));
      if (!hasNumbers && bullets.length >= 2) {
        issues.push({ id: `exp-quant-${idx}`, section: 'experience', severity: 'tip', message: `${prefix}: No quantifiable achievements.`, suggestion: 'Add numbers: "% increase", "$ saved", "X users served".' });
      }

      // Check for weak verbs
      const descLower = bullets.join(' ').toLowerCase();
      const weakFound = WEAK_VERBS.filter((v) => descLower.includes(v));
      weakFound.forEach((verb) => {
        const replacement = STRONG_VERBS[verb];
        issues.push({
          id: `exp-verb-${idx}-${verb}`,
          section: 'experience',
          severity: 'tip',
          message: `${prefix}: Weak verb phrase "${verb}".`,
          suggestion: replacement ? `Try: ${replacement}` : undefined,
        });
      });

      // Check for very short descriptions
      const totalChars = bullets.join('').length;
      if (totalChars < 80) {
        issues.push({ id: `exp-short-${idx}`, section: 'experience', severity: 'warning', message: `${prefix}: Description is very brief (${totalChars} chars).`, suggestion: 'Add 2–5 bullet points with specific achievements.' });
      }

      // Check bullet length
      bullets.forEach((b, bi) => {
        if (b.length > 200) {
          issues.push({ id: `exp-long-${idx}-${bi}`, section: 'experience', severity: 'info', message: `${prefix}, bullet #${bi + 1}: Very long (${b.length} chars).`, suggestion: 'Keep bullet points under 150 characters.' });
        }
      });
    }
  });

  // Limit to most recent 3 entries for detailed linting
  if (experiences.length > 3) {
    issues.push({ id: 'exp-many', section: 'experience', severity: 'info', message: `${experiences.length} experience entries.`, suggestion: 'Consider keeping only the most relevant 3–5 entries.' });
  }

  return issues;
}

function lintEducation(education: CVData['education']): LintIssue[] {
  const issues: LintIssue[] = [];

  education.forEach((edu, idx) => {
    const prefix = `Education #${idx + 1}`;

    if (!edu.institution && !edu.degree) {
      issues.push({ id: `edu-empty-${idx}`, section: 'education', severity: 'warning', message: `${prefix}: Missing institution and degree.` });
    } else if (!edu.institution) {
      issues.push({ id: `edu-inst-${idx}`, section: 'education', severity: 'warning', message: `${prefix}: Missing institution name.` });
    } else if (!edu.degree) {
      issues.push({ id: `edu-degree-${idx}`, section: 'education', severity: 'info', message: `${prefix}: Missing degree name.` });
    }

    if (!edu.startDate && !edu.endDate) {
      issues.push({ id: `edu-dates-${idx}`, section: 'education', severity: 'info', message: `${prefix}: No dates provided.` });
    }
  });

  return issues;
}

function lintSkills(skills: CVData['skills']): LintIssue[] {
  const issues: LintIssue[] = [];

  if (skills.length === 0) {
    issues.push({ id: 'skills-empty', section: 'skills', severity: 'warning', message: 'No skills listed.', suggestion: 'Add 8–15 relevant technical and soft skills.' });
    return issues;
  }

  if (skills.length < 5) {
    issues.push({ id: 'skills-few', section: 'skills', severity: 'info', message: `Only ${skills.length} skills listed.`, suggestion: 'Consider adding more relevant skills (aim for 8–15).' });
  }

  if (skills.length > 25) {
    issues.push({ id: 'skills-many', section: 'skills', severity: 'info', message: `${skills.length} skills listed.`, suggestion: 'Consider trimming to the most relevant 15–20.' });
  }

  // Check for unnamed skills
  skills.forEach((s, idx) => {
    if (!s.name) {
      issues.push({ id: `skills-unnamed-${idx}`, section: 'skills', severity: 'warning', message: `Skill #${idx + 1} has no name.` });
    }
  });

  return issues;
}

function lintFormatting(data: CVData): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check overall length
  const totalText = [
    data.summary,
    ...data.experience.map((e) => e.description),
    ...data.education.map((e) => e.description || ''),
  ].join(' ');

  const wordCount = totalText.split(/\s+/).filter(Boolean).length;

  if (wordCount > 1000) {
    issues.push({ id: 'fmt-long', section: 'formatting', severity: 'warning', message: `CV has ~${wordCount} words.`, suggestion: 'ATS-optimized CVs are 400–800 words. Consider trimming.' });
  }

  if (wordCount < 150 && wordCount > 0) {
    issues.push({ id: 'fmt-short', section: 'formatting', severity: 'info', message: `CV has only ~${wordCount} words.`, suggestion: 'Add more detail to reach 400–800 words.' });
  }

  return issues;
}

// ---- Main lint function ----
export function lintCV(data: CVData): LintIssue[] {
  return [
    ...lintPersonal(data),
    ...lintSummary(data.summary),
    ...lintExperience(data.experience),
    ...lintEducation(data.education),
    ...lintSkills(data.skills),
    ...lintFormatting(data),
  ];
}

// ---- ATS score calculator ----
export function calculateATSScore(data: CVData, jdKeywords?: string[]): ATSScore {
  const issues = lintCV(data);
  const keywordMatches: ATSScore['keywordMatches'] = [];

  // Score sections (0-100 each)
  const contactScore = data.personal.fullName && data.personal.email && data.personal.phone ? 100
    : data.personal.fullName && data.personal.email ? 70
    : data.personal.fullName ? 40 : 0;

  const summaryScore = !data.summary ? 0
    : data.summary.split(/\s+/).length < 15 ? 40
    : data.summary.split(/\s+/).length < 30 ? 70 : 100;

  const expIssues = issues.filter((i) => i.section === 'experience');
  const expScore = data.experience.length === 0 ? 0
    : Math.max(0, 100 - expIssues.filter((i) => i.severity === 'error').length * 30
    - expIssues.filter((i) => i.severity === 'warning').length * 15
    - expIssues.filter((i) => i.severity === 'tip').length * 5);

  const eduScore = data.education.length === 0 ? 50
    : Math.max(0, 100 - issues.filter((i) => i.section === 'education' && i.severity === 'warning').length * 20);

  const skillScore = data.skills.length === 0 ? 0
    : Math.min(100, data.skills.length * 8);

  // Formatting score
  const totalWords = [data.summary, ...data.experience.map((e) => e.description)].join(' ').split(/\s+/).filter(Boolean).length;
  const fmtScore = totalWords < 150 ? 30
    : totalWords < 400 ? 70
    : totalWords <= 1000 ? 100
    : 80;

  // Keyword matching
  if (jdKeywords && jdKeywords.length > 0) {
    const fullText = [
      data.summary,
      data.personal.title,
      ...data.experience.map((e) => `${e.role} ${e.description}`),
      ...data.skills.map((s) => s.name),
    ].join(' ').toLowerCase();

    for (const kw of jdKeywords) {
      const regex = new RegExp(`\\b${kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = fullText.match(regex);
      keywordMatches.push({
        keyword: kw,
        found: !!matches,
        count: matches?.length || 0,
      });
    }
  }

  // Overall weighted score
  const overall = Math.round(
    contactScore * 0.15 +
    summaryScore * 0.15 +
    expScore * 0.30 +
    eduScore * 0.10 +
    skillScore * 0.15 +
    fmtScore * 0.15
  );

  return {
    overall: Math.min(100, overall),
    sections: {
      contact: contactScore,
      summary: summaryScore,
      experience: expScore,
      education: eduScore,
      skills: skillScore,
      formatting: fmtScore,
    },
    issues,
    keywordMatches,
  };
}
