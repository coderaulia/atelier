import { useState } from 'react';
import { generateCVAI } from '../../lib/api';
import { usePlan } from '../../hooks/usePlan';
import type { CVData } from './types';
import type { CoverLetterData } from './coverLetterTypes';

interface Props {
  cvData: CVData;
  value: CoverLetterData;
  onChange: (data: CoverLetterData) => void;
  onClose: () => void;
  onToast: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

function buildCVContext(cvData: CVData): string {
  const experience = cvData.experience
    .filter((e) => e.role || e.company || e.description)
    .slice(0, 3)
    .map((e) => `${e.role} at ${e.company}: ${e.description}`)
    .join('\n');

  const skills = cvData.skills.map((s) => s.name).filter(Boolean).join(', ');

  return [
    `Name: ${cvData.personal.fullName}`,
    `Current title: ${cvData.personal.title}`,
    `Summary: ${cvData.summary}`,
    `Skills: ${skills}`,
    `Experience:\n${experience}`,
  ].join('\n');
}

export default function CoverLetterEditor({ cvData, value, onChange, onClose, onToast }: Props) {
  const [loading, setLoading] = useState(false);
  const { isPro } = usePlan();

  const set = (key: keyof CoverLetterData) => (fieldValue: string) =>
    onChange({ ...value, [key]: fieldValue });

  const generate = async () => {
    if (!isPro) {
      onToast('Upgrade to Pro to generate cover letters with AI.', 'warning');
      return;
    }

    if (!value.companyName || !value.position) {
      onToast('Add company and position before generating.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const context = `Generate a concise, tailored cover letter.\n\nTarget role: ${value.position}\nCompany: ${value.companyName}\nHiring manager: ${value.hiringManager || 'Hiring Manager'}\n\nCV context:\n${buildCVContext(cvData)}\n\nUse warm professional tone, 3-4 paragraphs, no placeholders, no markdown.`;
      const { result } = await generateCVAI({ action: 'cover_letter', context });
      onChange({ ...value, body: result });
      onToast('Cover letter generated.', 'info');
    } catch (err: any) {
      onToast(err.message ?? 'Failed to generate cover letter.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    const letter = `${value.hiringManager || 'Hiring Manager'}\n${value.companyName}\n\nDear ${value.hiringManager || 'Hiring Manager'},\n\n${value.body}\n\nSincerely,\n${cvData.personal.fullName || 'Your Name'}`;
    await navigator.clipboard.writeText(letter);
    onToast('Cover letter copied to clipboard.', 'info');
  };

  return (
    <div className="cv-cover-letter">
      <div className="cv-cover-letter__header">
        <div>
          <h2>Cover Letter Generator</h2>
          <p>Turn your CV into a targeted cover letter for each role.</p>
        </div>
        <button className="cv-btn cv-btn--ghost cv-btn--sm" onClick={onClose}>×</button>
      </div>

      <div className="cv-cover-letter__grid">
        <div className="cv-cover-letter__form">
          <label>
            <span>Company</span>
            <input value={value.companyName} onChange={(e) => set('companyName')(e.target.value)} placeholder="Acme Inc." />
          </label>
          <label>
            <span>Position</span>
            <input value={value.position} onChange={(e) => set('position')(e.target.value)} placeholder="Senior Product Designer" />
          </label>
          <label>
            <span>Hiring Manager (optional)</span>
            <input value={value.hiringManager} onChange={(e) => set('hiringManager')(e.target.value)} placeholder="Jordan Lee" />
          </label>
          <button className="cv-btn cv-btn--primary" onClick={generate} disabled={loading}>
            {loading ? 'Generating…' : '✨ Generate with AI'}
          </button>
          <button className="cv-btn cv-btn--secondary" onClick={copy} disabled={!value.body}>
            Copy letter
          </button>
        </div>

        <div className="cv-cover-letter__preview">
          <textarea
            value={value.body}
            onChange={(e) => set('body')(e.target.value)}
            placeholder="Generated cover letter will appear here. You can edit it before copying."
            rows={18}
          />
        </div>
      </div>
    </div>
  );
}
