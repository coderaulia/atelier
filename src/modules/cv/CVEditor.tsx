import React from 'react';
import { CVData, CVRegionalMode, WorkExperience, Education, Skill, Certification } from './types';
import AIButton from './AIButton';

// ---- tiny uid ----
let _uid = 0;
const uid = () => `cv_${++_uid}_${Date.now()}`;

// ---- generic field helpers ----
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cv-field">
      <label className="cv-field__label">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="cv-input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder = '',
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="cv-textarea"
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ---- section heading with add button ----
function SectionHead({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div className="cv-section-head">
      <span className="cv-section-head__label">{label}</span>
      {onAdd && (
        <button className="cv-section-head__add" onClick={onAdd} title={`Add ${label}`}>
          +
        </button>
      )}
    </div>
  );
}

// ---- remove button ----
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="cv-remove-btn" onClick={onClick} title="Remove">
      ×
    </button>
  );
}

// -------- Personal Info --------
function PersonalSection({
  data,
  onChange,
  regionalMode = 'international',
}: {
  data: CVData['personal'];
  onChange: (p: CVData['personal']) => void;
  regionalMode?: CVRegionalMode;
}) {
  const set = (k: keyof CVData['personal']) => (v: string) =>
    onChange({ ...data, [k]: v });

  return (
    <div className="cv-section">
      <SectionHead label="Personal Info" />
      <Field label="Full Name">
        <Input value={data.fullName} onChange={set('fullName')} placeholder="Alexandra Chen" />
      </Field>
      <Field label="Job Title">
        <Input value={data.title} onChange={set('title')} placeholder="Senior Product Designer" />
      </Field>
      <div className="cv-row-2">
        <Field label="Email">
          <Input value={data.email} onChange={set('email')} placeholder="you@email.com" type="email" />
        </Field>
        <Field label="Phone">
          <Input value={data.phone} onChange={set('phone')} placeholder="+1 555 000-1234" />
        </Field>
      </div>
      <Field label="Location">
        <Input value={data.location} onChange={set('location')} placeholder="City, Country" />
      </Field>
      <div className="cv-row-2">
        <Field label="Website">
          <Input value={data.website} onChange={set('website')} placeholder="yoursite.com" />
        </Field>
        <Field label="LinkedIn">
          <Input value={data.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/you" />
        </Field>
      </div>
      <Field label="GitHub">
        <Input value={data.github} onChange={set('github')} placeholder="github.com/you" />
      </Field>

      {regionalMode === 'indonesia' && (
        <>
          <Field label="Photo (Indonesia mode)">
            <input
              type="file"
              accept="image/*"
              className="cv-regional-photo-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange({ ...data, photo: reader.result as string });
                reader.readAsDataURL(file);
              }}
            />
          </Field>
          <div className="cv-row-2">
            <Field label="Date of Birth">
              <Input value={data.dateOfBirth ?? ''} onChange={(v) => onChange({ ...data, dateOfBirth: v })} placeholder="1990-01-15" />
            </Field>
            <Field label="Marital Status">
              <Input value={data.maritalStatus ?? ''} onChange={(v) => onChange({ ...data, maritalStatus: v })} placeholder="Single / Married" />
            </Field>
          </div>
          <Field label="Religion (optional)">
            <Input value={data.religion ?? ''} onChange={(v) => onChange({ ...data, religion: v })} placeholder="Islam, Christianity, Hinduism, etc." />
          </Field>
        </>
      )}
    </div>
  );
}

// -------- Summary --------
function SummarySection({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="cv-section">
      <SectionHead label="Professional Summary" />
      <div className="cv-section__ai-row">
        <AIButton
          action="generate_summary"
          text={value}
          context="Generate a strong professional summary for this CV."
          onResult={onChange}
          label="✨ Generate summary"
        />
      </div>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder="Briefly describe your background and key strengths..."
        rows={4}
      />
    </div>
  );
}

// -------- Work Experience --------
function ExperienceSection({
  items,
  onChange,
}: {
  items: WorkExperience[];
  onChange: (items: WorkExperience[]) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      {
        id: uid(),
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const update = (id: string, patch: Partial<WorkExperience>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="cv-section">
      <SectionHead label="Work Experience" onAdd={add} />
      {items.map((exp) => (
        <div key={exp.id} className="cv-card">
          <div className="cv-card__header">
            <span className="cv-card__title">{exp.role || 'New Position'}</span>
            <RemoveBtn onClick={() => remove(exp.id)} />
          </div>
          <div className="cv-row-2">
            <Field label="Job Title">
              <Input value={exp.role} onChange={(v) => update(exp.id, { role: v })} placeholder="Product Designer" />
            </Field>
            <Field label="Company">
              <Input value={exp.company} onChange={(v) => update(exp.id, { company: v })} placeholder="Stripe" />
            </Field>
          </div>
          <Field label="Location">
            <Input value={exp.location} onChange={(v) => update(exp.id, { location: v })} placeholder="San Francisco, CA" />
          </Field>
          <div className="cv-row-2">
            <Field label="Start Date">
              <Input value={exp.startDate} onChange={(v) => update(exp.id, { startDate: v })} placeholder="2021-03" />
            </Field>
            <Field label="End Date">
              <Input
                value={exp.endDate}
                onChange={(v) => update(exp.id, { endDate: v })}
                placeholder="2024-01"
              />
            </Field>
          </div>
          <label className="cv-checkbox">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => update(exp.id, { current: e.target.checked, endDate: '' })}
            />
            <span>Currently working here</span>
          </label>
          <Field label="Description (use - for bullet points)">
            <div className="cv-section__ai-row cv-section__ai-row--right">
              <AIButton
                action="rewrite_bullet"
                text={exp.description}
                context={`Role: ${exp.role || 'Unknown'} at ${exp.company || 'Unknown company'}`}
                onResult={(result) => update(exp.id, { description: result })}
                label="✨ Rewrite"
                small
              />
            </div>
            <Textarea
              value={exp.description}
              onChange={(v) => update(exp.id, { description: v })}
              placeholder="- Led redesign of onboarding funnel&#10;- Built design system for 12 teams"
              rows={4}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

// -------- Education --------
function EducationSection({
  items,
  onChange,
}: {
  items: Education[];
  onChange: (items: Education[]) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      {
        id: uid(),
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
        description: '',
      },
    ]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, patch: Partial<Education>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="cv-section">
      <SectionHead label="Education" onAdd={add} />
      {items.map((edu) => (
        <div key={edu.id} className="cv-card">
          <div className="cv-card__header">
            <span className="cv-card__title">{edu.institution || 'New Education'}</span>
            <RemoveBtn onClick={() => remove(edu.id)} />
          </div>
          <div className="cv-row-2">
            <Field label="Degree">
              <Input value={edu.degree} onChange={(v) => update(edu.id, { degree: v })} placeholder="Master of Design" />
            </Field>
            <Field label="Field / Major">
              <Input value={edu.field} onChange={(v) => update(edu.id, { field: v })} placeholder="Human-Computer Interaction" />
            </Field>
          </div>
          <Field label="Institution">
            <Input value={edu.institution} onChange={(v) => update(edu.id, { institution: v })} placeholder="Carnegie Mellon University" />
          </Field>
          <div className="cv-row-2">
            <Field label="Start Date">
              <Input value={edu.startDate} onChange={(v) => update(edu.id, { startDate: v })} placeholder="2016-08" />
            </Field>
            <Field label="End Date">
              <Input value={edu.endDate} onChange={(v) => update(edu.id, { endDate: v })} placeholder="2018-05" />
            </Field>
          </div>
          <div className="cv-row-2">
            <Field label="GPA (optional)">
              <Input value={edu.gpa ?? ''} onChange={(v) => update(edu.id, { gpa: v })} placeholder="3.9" />
            </Field>
            <Field label="Location">
              <Input value={edu.location} onChange={(v) => update(edu.id, { location: v })} placeholder="Pittsburgh, PA" />
            </Field>
          </div>
          <label className="cv-checkbox">
            <input
              type="checkbox"
              checked={edu.current}
              onChange={(e) => update(edu.id, { current: e.target.checked })}
            />
            <span>Currently enrolled</span>
          </label>
        </div>
      ))}
    </div>
  );
}

// -------- Skills --------
function SkillsSection({
  items,
  onChange,
}: {
  items: Skill[];
  onChange: (items: Skill[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: '', level: undefined, category: '' }]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, patch: Partial<Skill>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="cv-section">
      <SectionHead label="Skills" onAdd={add} />
      <div className="cv-skills-grid">
        {items.map((skill) => (
          <div key={skill.id} className="cv-skill-row">
            <input
              className="cv-input cv-skill-name"
              value={skill.name}
              placeholder="Figma"
              onChange={(e) => update(skill.id, { name: e.target.value })}
            />
            <select
              className="cv-select"
              value={skill.level ?? ''}
              onChange={(e) =>
                update(skill.id, { level: e.target.value as Skill['level'] })
              }
            >
              <option value="">Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <input
              className="cv-input cv-skill-cat"
              value={skill.category ?? ''}
              placeholder="Category"
              onChange={(e) => update(skill.id, { category: e.target.value })}
            />
            <RemoveBtn onClick={() => remove(skill.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Certifications --------
function CertificationsSection({
  items,
  onChange,
}: {
  items: Certification[];
  onChange: (items: Certification[]) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      { id: uid(), name: '', issuer: '', date: '', expiry: '', credentialId: '', url: '' },
    ]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, patch: Partial<Certification>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="cv-section">
      <SectionHead label="Certifications" onAdd={add} />
      {items.map((cert) => (
        <div key={cert.id} className="cv-card">
          <div className="cv-card__header">
            <span className="cv-card__title">{cert.name || 'New Certification'}</span>
            <RemoveBtn onClick={() => remove(cert.id)} />
          </div>
          <Field label="Certificate Name">
            <Input value={cert.name} onChange={(v) => update(cert.id, { name: v })} placeholder="AWS Solutions Architect" />
          </Field>
          <div className="cv-row-2">
            <Field label="Issuer">
              <Input value={cert.issuer} onChange={(v) => update(cert.id, { issuer: v })} placeholder="Amazon Web Services" />
            </Field>
            <Field label="Date Issued">
              <Input value={cert.date} onChange={(v) => update(cert.id, { date: v })} placeholder="2023-04" />
            </Field>
          </div>
          <div className="cv-row-2">
            <Field label="Expiry (optional)">
              <Input value={cert.expiry ?? ''} onChange={(v) => update(cert.id, { expiry: v })} placeholder="2026-04" />
            </Field>
            <Field label="Credential ID (optional)">
              <Input value={cert.credentialId ?? ''} onChange={(v) => update(cert.id, { credentialId: v })} placeholder="AWS-XXX-1234" />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

// -------- CV Editor (root) --------
export function CVEditor({
  data,
  onChange,
  activeSection,
  regionalMode = 'international',
}: {
  data: CVData;
  onChange: (data: CVData) => void;
  activeSection?: string;
  regionalMode?: CVRegionalMode;
}) {
  const show = (name: string) => !activeSection || activeSection === name;

  return (
    <div className="cv-editor">
      {show('personal') && <PersonalSection data={data.personal} onChange={(p) => onChange({ ...data, personal: p })} regionalMode={regionalMode} />}
      {show('summary') && <SummarySection value={data.summary} onChange={(s) => onChange({ ...data, summary: s })} />}
      {show('experience') && <ExperienceSection items={data.experience} onChange={(ex) => onChange({ ...data, experience: ex })} />}
      {show('education') && <EducationSection items={data.education} onChange={(ed) => onChange({ ...data, education: ed })} />}
      {show('skills') && <SkillsSection items={data.skills} onChange={(sk) => onChange({ ...data, skills: sk })} />}
      {show('certifications') && <CertificationsSection items={data.certifications} onChange={(c) => onChange({ ...data, certifications: c })} />}
    </div>
  );
}
