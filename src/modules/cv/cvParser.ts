import type { CVData, WorkExperience, Education, Skill } from './types';

// ---- Tiny UID ----
let _uid = 0;
const uid = () => `imp_${++_uid}_${Date.now()}`;

// ---- Section header patterns ----
const SECTION_PATTERNS: Record<string, RegExp[]> = {
  experience: [
    /^(?:work\s+)?experience$/i,
    /^(?:professional|relevant|employment)\s+(?:experience|history)$/i,
    /^(?:career|work)\s+(?:history|background)$/i,
  ],
  education: [
    /^education(?:al\s+background)?$/i,
    /^(?:academic|qualification)s?$/i,
  ],
  skills: [
    /^(?:core\s+)?(?:technical\s+)?skills$/i,
    /^(?:key\s+)?(?:competenc|expertise|technolog)(?:ies|y|s)$/i,
    /^(?:tools|programming\s+languages)$/i,
  ],
  summary: [
    /^(?:professional\s+)?summary$/i,
    /^(?:career\s+)?(?:overview|profile|objective|statement)$/i,
    /^(?:about|about\s+me)$/i,
    /^personal\s+statement$/i,
  ],
  certifications: [
    /^certification?s?$/i,
    /^licenses?\s*(?:&|and)\s*certifications?$/i,
    /^professional\s+development$/i,
  ],
};

// ---- Contact info patterns ----
const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w+/;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i;
const GITHUB_RE = /github\.com\/[\w-]+/i;
const WEBSITE_RE = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|dev|io|org|net|id|co)[\/\w.-]*/i;

// ---- Work experience parsing ----
const DATE_RE = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*[\s.]*(?:\d{4})?|\d{1,2}\/\d{4}|\d{4})/gi;

// ---- Detect section for a line ----
function detectSection(line: string): string | null {
  for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
    if (patterns.some((p) => p.test(line.trim()))) return section;
  }
  return null;
}

// ---- Parse contact info ----
function extractPersonal(text: string): CVData['personal'] {
  const email = text.match(EMAIL_RE)?.[0] || '';
  const phone = text.match(PHONE_RE)?.[0] || '';
  const linkedin = text.match(LINKEDIN_RE)?.[0] || '';
  const github = text.match(GITHUB_RE)?.[0] || '';

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let fullName = '';
  let title = '';

  // First non-empty line that's short and mostly alpha → name
  for (const line of lines) {
    if (line.length < 50 && /^[A-Za-z\s.'-]+$/.test(line) && !line.match(/@|http|skills|experience|education|summary/i)) {
      fullName = line;
      break;
    }
  }

  // Line after name that's short → title
  const nameIdx = lines.findIndex((l) => l === fullName);
  if (nameIdx >= 0 && nameIdx + 1 < lines.length) {
    const next = lines[nameIdx + 1];
    if (next.length < 80 && !next.match(/@|http|skills|experience/i) && next.split(/\s+/).length <= 8) {
      title = next;
    }
  }

  // Website (not linkedin/github)
  let website = '';
  const websiteMatch = text.match(WEBSITE_RE);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
    website = websiteMatch[0].replace(/^https?:\/\//, '');
  }

  return { fullName, title, email, phone, location: '', website, linkedin, github };
}

// ---- Extract work experience entries ----
function extractExperience(lines: string[], startIdx: number): WorkExperience[] {
  const results: WorkExperience[] = [];
  let currentEntry: Partial<WorkExperience> | null = null;
  let descLines: string[] = [];

  const finalizeEntry = () => {
    if (currentEntry) {
      results.push({
        id: uid(),
        company: currentEntry.company || '',
        role: currentEntry.role || '',
        location: currentEntry.location || '',
        startDate: currentEntry.startDate || '',
        endDate: currentEntry.endDate || '',
        current: !!currentEntry.current,
        description: descLines.join('\n'),
      });
    }
    currentEntry = null;
    descLines = [];
  };

  // Find where the section ends
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (detectSection(lines[i]) && lines[i] !== lines[startIdx]) {
      endIdx = i;
      break;
    }
  }

  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line) continue;

    // Line with dates is likely a job header (e.g., "Jan 2021 – Dec 2023" or "2020-2023")
    const dates = line.match(DATE_RE) || [];
    const isJobHeader = dates.length >= 1 && line.length < 150;

    if (isJobHeader) {
      // Check if this line also has role/company (common: "Software Engineer | Google | 2020-2023")
      const parts = line.split(/[|–—]/).map((p) => p.trim());

      if (parts.length >= 3) {
        // Format: Role | Company | Dates (or Company | Role | Dates)
        finalizeEntry();
        currentEntry = {};
        // Determine which part is role vs company based on heuristics
        for (const part of parts) {
          if (part.match(DATE_RE)) {
            const dateStr = part.trim();
            const allDates = dateStr.match(DATE_RE) || [];
            if (allDates.length >= 2) {
              currentEntry.startDate = allDates[0]!.trim();
              currentEntry.endDate = allDates[1]!.trim();
              currentEntry.current = /present|current|now/i.test(dateStr);
            } else if (allDates.length === 1) {
              currentEntry.startDate = allDates[0].trim();
            }
          } else if (part.match(/present|current|now/i)) {
            currentEntry.current = true;
          } else if (!currentEntry.role) {
            currentEntry.role = part;
          } else if (!currentEntry.company) {
            currentEntry.company = part;
          }
        }
      } else {
        finalizeEntry();
        currentEntry = { startDate: dates[0]?.trim() };
        // Remaining text after dates could be role or company
        const remaining = line.replace(DATE_RE, '').replace(/[–—|,]/g, '').trim();
        if (remaining) {
          currentEntry.role = remaining;
        }
        // Check if end date is present
        if (dates.length >= 2) {
          currentEntry.endDate = dates[1].trim();
          if (line.match(/present|current|now/i)) {
            currentEntry.current = true;
          }
        }
      }
    } else if (line.match(/^\s*[-•*●◦→]\s*/)) {
      // Bullet point → description
      descLines.push(line.replace(/^\s*[-•*●◦→]\s*/, ''));
    } else if (currentEntry && !currentEntry.company) {
      // Could be company name
      currentEntry.company = line;
    } else if (currentEntry && currentEntry.role && !currentEntry.location && line.length < 60) {
      currentEntry.location = line;
    } else if (currentEntry) {
      // Continuation of description
      descLines.push(line);
    } else {
      // Not clearly a job entry header, but could be a title line followed by dates
      // Check next line for dates
      if (i + 1 < endIdx && lines[i + 1]?.match(DATE_RE)) {
        finalizeEntry();
        currentEntry = { role: line };
      }
    }
  }

  finalizeEntry();
  return results;
}

// ---- Extract education entries ----
function extractEducation(lines: string[], startIdx: number): Education[] {
  const results: Education[] = [];
  let currentEntry: Partial<Education> | null = null;

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (detectSection(lines[i]) && lines[i] !== lines[startIdx]) {
      endIdx = i;
      break;
    }
  }

  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line) continue;

    const dates = line.match(DATE_RE) || [];
    const isEduHeader = dates.length >= 1 && line.length < 150;

    if (isEduHeader || line.match(/(?:Bachelor|Master|Ph\.?D|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Associate|Diploma)/i)) {
      if (currentEntry) {
        results.push({
          id: uid(),
          institution: currentEntry.institution || '',
          degree: currentEntry.degree || '',
          field: currentEntry.field || '',
          location: currentEntry.location || '',
          startDate: currentEntry.startDate || '',
          endDate: currentEntry.endDate || '',
          current: false,
          gpa: currentEntry.gpa || '',
          description: currentEntry.description || '',
        });
      }

      currentEntry = {};

      // Try to extract degree info
      const degreeMatch = line.match(/((?:Bachelor|Master|Ph\.?D|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Associate|Diploma)[^,\n]*)/i);
      if (degreeMatch) {
        currentEntry.degree = degreeMatch[1].trim();
        // Field might follow after comma
        const afterDegree = line.split(',')[1]?.trim();
        if (afterDegree && !afterDegree.match(DATE_RE)) {
          currentEntry.field = afterDegree;
        }
      }

      if (dates.length >= 2) {
        currentEntry.startDate = dates[0]!.trim();
        currentEntry.endDate = dates[1]!.trim();
      } else if (dates.length === 1) {
        currentEntry.startDate = dates[0].trim();
      }
    } else if (currentEntry && !currentEntry.institution) {
      currentEntry.institution = line;
    } else if (currentEntry) {
      // Accumulate description
      currentEntry.description = (currentEntry.description || '') + line + '\n';
    }
  }

  if (currentEntry) {
    results.push({
      id: uid(),
      institution: currentEntry.institution || '',
      degree: currentEntry.degree || '',
      field: currentEntry.field || '',
      location: currentEntry.location || '',
      startDate: currentEntry.startDate || '',
      endDate: currentEntry.endDate || '',
      current: false,
      gpa: currentEntry.gpa || '',
      description: currentEntry.description || '',
    });
  }

  return results;
}

// ---- Extract skills ----
function extractSkills(lines: string[], startIdx: number): Skill[] {
  const skills: Skill[] = [];

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (detectSection(lines[i]) && lines[i] !== lines[startIdx]) {
      endIdx = i;
      break;
    }
  }

  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line) continue;

    // Split by common delimiters
    const parts = line.split(/[,•·|;\/]+/);
    for (const part of parts) {
      const trimmed = part.replace(/^\s*[-•*●◦→]\s*/, '').trim();
      if (trimmed && trimmed.length < 40 && trimmed.length > 1) {
        skills.push({
          id: uid(),
          name: trimmed,
          category: 'Technical',
        });
      }
    }
  }

  return skills;
}

// ---- Extract summary ----
function extractSummary(lines: string[], startIdx: number): string {
  const summaryLines: string[] = [];

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (detectSection(lines[i]) && lines[i] !== lines[startIdx]) {
      endIdx = i;
      break;
    }
  }

  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (line) summaryLines.push(line);
  }

  return summaryLines.join(' ').trim();
}

// ---- Main parse function ----
export function parseCVText(text: string): Partial<CVData> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const result: Partial<CVData> = {
    personal: extractPersonal(text),
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  };

  // Find and process each section
  const sectionsProcessed = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const section = detectSection(lines[i]);
    if (!section || sectionsProcessed.has(section)) continue;
    sectionsProcessed.add(section);

    switch (section) {
      case 'summary':
        result.summary = extractSummary(lines, i);
        break;
      case 'experience':
        result.experience = extractExperience(lines, i);
        break;
      case 'education':
        result.education = extractEducation(lines, i);
        break;
      case 'skills':
        result.skills = extractSkills(lines, i);
        break;
    }
  }

  return result;
}

// ---- DOCX parsing via mammoth ----
export async function parseDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ---- Multi-page PDF text extraction ----
export async function extractPDFText(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const allText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);

    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();

    if (pageText) {
      allText.push(pageText);
    } else {
      // Fallback to OCR for scanned pages
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // @ts-ignore — pdfjs v5 types over-restrict render params
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const tesseract = await import('tesseract.js');
      const worker = await tesseract.createWorker('eng');
      const { data } = await worker.recognize(canvas);
      if (data.text?.trim()) allText.push(data.text.trim());
      await worker.terminate();
    }
  }

  return allText.join('\n\n');
}
