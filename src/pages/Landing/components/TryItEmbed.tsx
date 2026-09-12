import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSmIcon } from './Icons';

/* ===================== TRY-IT EMBED ===================== */
const CV_TEMPLATES = [
  { id: 'modern', label: 'Modern', className: '' },
  { id: 'editorial', label: 'Editorial', className: 'cv-card--editorial' },
  { id: 'mono', label: 'ATS-Mono', className: 'cv-card--mono' },
] as const

type TplId = typeof CV_TEMPLATES[number]['id']

interface CvCardProps {
  name: string
  role: string
  bio: string
  className?: string
}

function CvCard({ name, role, bio, className = '' }: CvCardProps) {
  return (
    <div className={`cv-card ${className}`}>
      <div className="cv-card__name">{name || 'Your Name'}</div>
      <div className="cv-card__role">{role || 'Your role'}</div>
      <div className="cv-card__bio">{bio || 'Short bio appears here.'}</div>

      <div className="cv-card__section">Experience</div>
      <div className="cv-card__job">
        <div className="cv-card__job-head">
          <span className="cv-card__job-title">Senior Designer · North &amp; Quill</span>
          <span className="cv-card__job-meta">2023 — Now</span>
        </div>
        <div className="cv-card__job-desc">Lead brand identity engagements for early-stage product companies.</div>
      </div>
      <div className="cv-card__job">
        <div className="cv-card__job-head">
          <span className="cv-card__job-title">Junior Designer · Pentagram</span>
          <span className="cv-card__job-meta">2020 — 2023</span>
        </div>
        <div className="cv-card__job-desc">Type, identity, motion. Shipped 14 client engagements end-to-end.</div>
      </div>

      <div className="cv-card__section">Education</div>
      <div className="cv-card__job">
        <div className="cv-card__job-head">
          <span className="cv-card__job-title">RISD — BFA Graphic Design</span>
          <span className="cv-card__job-meta">2016 — 2020</span>
        </div>
      </div>

      <div className="cv-card__section">Skills</div>
      <div className="cv-card__skills">
        {['Identity', 'Typography', 'Web', 'Print', 'Motion', 'Figma', 'After Effects'].map((s) => (
          <span key={s} className="cv-card__skill">{s}</span>
        ))}
      </div>
    </div>
  )
}

function TryItEmbed() {
  const [name, setName] = useState('Maren Aksel')
  const [role, setRole] = useState('Senior Brand Designer')
  const [bio, setBio] = useState('Brand designer working with founder-led companies on the documents that surround the product. Previously at Pentagram.')
  const [tpl, setTpl] = useState<TplId>('editorial')

  const active = CV_TEMPLATES.find((t) => t.id === tpl)!

  return (
    <section className="section section--cream" id="try">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">Live demo · No signup</span>
          <h2>Type your name. <span className="accent">See a CV appear.</span></h2>
          <p className="section__lede">
            This is the exact preview engine that powers every tool in the suite. Edit on the left, see the result on the right, export when you're ready.
          </p>
        </div>

        <div className="tryit">
          <div className="tryit__panel">
            <div>
              <div className="tryit__heading">Build your <span className="it">CV.</span></div>
              <div className="tryit__sub">Try the editor. We won't save anything.</div>
            </div>

            <div className="tryit__field">
              <label>Template</label>
              <div className="tryit__templates">
                {CV_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    className={`tryit__tpl${tpl === t.id ? ' tryit__tpl--active' : ''}`}
                    onClick={() => setTpl(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tryit__row">
              <div className="tryit__field">
                <label>Full name</label>
                <input className="tryit__input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="tryit__field">
                <label>Role / title</label>
                <input className="tryit__input" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <div className="tryit__field">
              <label>Bio</label>
              <textarea className="tryit__textarea" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link className="btn btn--accent" to="/cv-builder">Open full editor <ArrowSmIcon /></Link>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ↳ Includes export
              </span>
            </div>
          </div>

          <div className="tryit__preview">
            <div className="tryit__preview-meta">PDF · 8.5 × 11 · Auto-paginate</div>
            <CvCard name={name} role={role} bio={bio} className={active.className} />
          </div>
        </div>
      </div>
    </section>
  )
}


export { TryItEmbed };
