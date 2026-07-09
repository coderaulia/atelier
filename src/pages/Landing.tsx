import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle'

/* ---- Inline icons ---- */
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const ArrowSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const DocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="14" y2="17" />
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const ConvertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)
const ScanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
)
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)
const SocialIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

/* ===================== NAV ===================== */
function Nav() {
  return (
    <nav className="nav">
      <div className="container nav__inner">
        <a href="/" className="nav__brand">
          <span className="nav__mark" />
          <span>Atelier</span>
          <span className="nav__brand-sub">by Vanaila</span>
        </a>
        <div className="nav__links">
          <a className="nav__link" href="#tools">Tools</a>
          <Link className="nav__link" to="/cv-builder">CV Builder</Link>
          <Link className="nav__link" to="/image-converter">Image Converter</Link>
          <Link className="nav__link" to="/pricing">Pricing</Link>
        </div>
        <div className="nav__actions">
          <LanguageToggle />
          <Link className="nav__link" to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          <Link className="btn btn--primary" to="/register">Open the app <ArrowSmIcon /></Link>
        </div>
      </div>
    </nav>
  )
}

/* ===================== HERO ===================== */
function HeroDocWindow() {
  return (
    <div className="hero-window hero-window--main">
      <div className="hero-window__bar">
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__title">atelier — agreement</span>
      </div>
      <div className="hp-doc">
        <div className="hp-doc__crumb">
          <span>Agreement · AG-2026-014</span>
          <span>Letter · 8.5 × 11 in</span>
        </div>
        <h2>Brand identity for<br />Atlas &amp; Bell.</h2>
        <dl className="hp-doc__meta">
          <div><dt>Client</dt><dd>Atlas &amp; Bell, Inc.</dd></div>
          <div><dt>Studio</dt><dd>North &amp; Quill</dd></div>
          <div><dt>Issued</dt><dd>May 20, 2026</dd></div>
          <div><dt>Fee</dt><dd>$24,000 USD</dd></div>
        </dl>
        <div className="hp-doc__body">
          <p>The Studio will design a full brand identity system — logo, type, color, and a 32-page guidelines document — over an eight-week engagement.</p>
          <p>Work begins on signing. Two formal review rounds are included.</p>
        </div>
        <div className="hp-doc__sig">
          <div className="hp-doc__sig-line">Maren Aksel</div>
          <div className="hp-doc__sig-line">Priya Bell</div>
        </div>
      </div>
    </div>
  )
}

function HeroCvWindow() {
  return (
    <div className="hero-window hero-window--cv">
      <div className="hero-window__bar">
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__title">cv — editorial</span>
      </div>
      <div className="hp-cv">
        <div className="hp-cv__name">Maren Aksel</div>
        <div className="hp-cv__role">Brand designer · NYC</div>
        <div className="hp-cv__row"><strong>2023 — present</strong><span>North &amp; Quill</span></div>
        <div className="hp-cv__row"><strong>2020 — 23</strong><span>Pentagram, Jr.</span></div>
        <div className="hp-cv__row"><strong>2018 — 20</strong><span>RISD, BFA</span></div>
        <div className="hp-cv__row"><strong>Skills</strong><span>ID · Type · Web</span></div>
        <div className="hp-cv__row"><strong>Languages</strong><span>EN · NO · FR</span></div>
      </div>
    </div>
  )
}

function HeroConvWindow() {
  return (
    <div className="hero-window hero-window--conv">
      <div className="hero-window__bar">
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__dot" />
        <span className="hero-window__title">pdf → jpg</span>
      </div>
      <div className="hp-conv">
        <div className="hp-conv__title">Drop to convert</div>
        <div className="hp-conv__drop">
          <div className="hp-conv__drop-icon"><UploadIcon /></div>
          <div className="hp-conv__drop-text">Drop file or click to browse</div>
          <div className="hp-conv__drop-meta">PDF · JPG · PNG · WebP · AVIF</div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <div className="hero__tag">
            <span className="hero__tag-dot" />
            Now live · Atelier 0.1 + 4 new tools coming
          </div>
          <h1>
            One tab.<br />
            Every tool you actually <span className="accent">use.</span>
          </h1>
          <p className="hero__sub">
            Documents, CVs, image and PDF conversions, OCR, and social posts — built in your browser. No installs. No accounts. No watermarks. Pro is opt-in.
          </p>
          <div className="hero__ctas">
            <Link className="btn btn--accent btn--lg" to="/document-generator">Start free <ArrowIcon /></Link>
            <a className="btn btn--ghost btn--lg" href="#tools">See all 8 tools</a>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-dots">
              <span /><span /><span /><span />
            </div>
            <span>Built for freelancers, small teams &amp; job seekers</span>
          </div>
        </div>
        <div className="hero__visual">
          <HeroDocWindow />
          <HeroCvWindow />
          <HeroConvWindow />
        </div>
      </div>
    </section>
  )
}

/* ===================== TRUST / LOGOS ===================== */
function Logos() {
  return (
    <section className="logos container">
      <div className="logos__label">A toolkit instead of a stack of subscriptions</div>
      <div className="logos__row">
        <span className="logos__item">Atelier</span>
        <span className="logos__item logos__item--sans">CV Studio</span>
        <span className="logos__item">Convert</span>
        <span className="logos__item logos__item--sans">Scan</span>
        <span className="logos__item">Image Lab</span>
        <span className="logos__item logos__item--sans">Social</span>
      </div>
    </section>
  )
}

/* ===================== TOOLS GRID ===================== */
const DOC_TYPES = [
  'Agreement', 'Invoice', 'Proposal', 'PRD',
  'Retainer', 'Receipt', 'Onboarding', 'Handover', 'Social',
]

function ToolsGrid() {
  return (
    <section className="section" id="tools">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">The Suite · 08 Tools</span>
          <h2>Eight tools that replace a <span className="accent">monthly stack</span> of subscriptions.</h2>
          <p className="section__lede">
            Each one solves a real, recurring annoyance. Use them standalone. Or as a chain — write the proposal, convert the PDF, post the win.
          </p>
        </div>

        <div className="tools">
          {/* Atelier — hero tool, full-width */}
          <Link className="tool-card tool-card--hero" to="/document-generator">
            <div className="tool-card__body">
              <div className="tool-card__num">Tool 01 / Atelier</div>
              <div className="tool-card__icon"><DocIcon /></div>
              <h3 className="tool-card__title">The document generator <span className="it">that ships.</span></h3>
              <p className="tool-card__desc">
                Nine document types, three style variants each, live preview, PDF and image export. Built for the work between the work — agreements, invoices, retainers, the lot.
              </p>
              <div className="tool-card__doctypes">
                {DOC_TYPES.map((d) => <span key={d} className="dt-pill">{d}</span>)}
              </div>
              <div className="tool-card__foot">
                <span className="tool-card__cta">Open Atelier <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
                <span className="tool-card__badge tool-card__badge--live">● Live</span>
              </div>
            </div>
            <div className="tool-card__visual">
              <div className="dt-stack">
                <div className="dt-thumb">
                  <div className="dt-thumb__accent" />
                  <div className="dt-thumb__label">Invoice</div>
                  <div className="dt-thumb__title">INV — 014</div>
                  <div className="dt-thumb__lines"><span /><span /><span /></div>
                </div>
                <div className="dt-thumb">
                  <div className="dt-thumb__accent" />
                  <div className="dt-thumb__label">Proposal</div>
                  <div className="dt-thumb__title">A brand system.</div>
                  <div className="dt-thumb__lines"><span /><span /><span /></div>
                </div>
                <div className="dt-thumb">
                  <div className="dt-thumb__accent" />
                  <div className="dt-thumb__label">Retainer</div>
                  <div className="dt-thumb__title">Monthly.</div>
                  <div className="dt-thumb__lines"><span /><span /><span /></div>
                </div>
              </div>
            </div>
          </Link>

          <Link className="tool-card tool-card--lg" to="/cv-builder">
            <div className="tool-card__num">Tool 02 / CV Studio</div>
            <div className="tool-card__icon"><BriefcaseIcon /></div>
            <h3 className="tool-card__title">A <span className="it">CV that lands.</span></h3>
            <p className="tool-card__desc">
              ATS-friendly. Editorial. Designer-portfolio. Pick a template, type once, export to PDF. No paywall on download.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Try the live demo <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live demo</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--lg" to="/pdf-to-image">
            <div className="tool-card__num">Tool 03 / Convert</div>
            <div className="tool-card__icon"><ConvertIcon /></div>
            <h3 className="tool-card__title">PDF &amp; image, <span className="it">in either direction.</span></h3>
            <p className="tool-card__desc">
              PDF → JPG, PNG. JPG → PDF. Batch a folder. Done locally. Your files never leave the browser.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Convert PDFs <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--md" to="/ocr">
            <div className="tool-card__num">Tool 04 / Scan</div>
            <div className="tool-card__icon"><ScanIcon /></div>
            <h3 className="tool-card__title">OCR <span className="it">that just works.</span></h3>
            <p className="tool-card__desc">
              Image or PDF in, plain text out. Receipts, screenshots, scanned docs.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Extract text <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--md" to="/image-converter">
            <div className="tool-card__num">Tool 05 / Image Lab</div>
            <div className="tool-card__icon"><ImageIcon /></div>
            <h3 className="tool-card__title">WebP, AVIF, <span className="it">whatever.</span></h3>
            <p className="tool-card__desc">
              Convert, resize, compress. Match the format your CMS, client, or aunt's iPhone needs.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Convert images <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--md" to="/social-generator">
            <div className="tool-card__num">Inside Atelier / Social</div>
            <div className="tool-card__icon"><SocialIcon /></div>
            <h3 className="tool-card__title">Posts that look <span className="it">designed.</span></h3>
            <p className="tool-card__desc">
              Square, vertical and carousel templates with your brand baked in. Export individual slides.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Open Social <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--md" to="/pdf-merge">
            <div className="tool-card__num">Tool 07 / PDF Merge</div>
            <div className="tool-card__icon"><ConvertIcon /></div>
            <h3 className="tool-card__title">Merge PDFs <span className="it">instantly.</span></h3>
            <p className="tool-card__desc">
              Combine up to 20 PDFs into one file. Drag to reorder. Done locally.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Merge PDFs <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>

          <Link className="tool-card tool-card--md" to="/pdf-compress">
            <div className="tool-card__num">Tool 08 / PDF Compress</div>
            <div className="tool-card__icon"><ConvertIcon /></div>
            <h3 className="tool-card__title">Compress PDFs <span className="it">for sharing.</span></h3>
            <p className="tool-card__desc">
              Reduce PDF file size in-browser with light, balanced, or maximum compression.
            </p>
            <div className="tool-card__foot">
              <span className="tool-card__cta">Compress PDFs <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
              <span className="tool-card__badge tool-card__badge--live">● Live</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

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

/* ===================== TEMPLATE GALLERY ===================== */
interface DocThumbProps {
  type: string
  variant?: 'accent' | 'blue'
  children: React.ReactNode
}

function DocThumb({ type, variant, children }: DocThumbProps) {
  const dark = variant === 'accent'
  const blue = variant === 'blue'
  const bg = dark ? '#1a2332' : blue ? '#2c4a6b' : '#fff'
  const fg = (dark || blue) ? '#f8f9fb' : '#0f1419'
  const muted = (dark || blue) ? 'rgba(255,255,255,0.48)' : 'var(--ink-3)'
  const borderC = dark ? '#2d3847' : blue ? '#243d59' : 'var(--border)'
  return (
    <div style={{ width: 240, height: 320, flexShrink: 0, background: bg, color: fg, borderRadius: 10, border: `1px solid ${borderC}`, padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: muted, marginBottom: 12 }}>{type}</div>
      {children}
    </div>
  )
}

const linesBg = (dark: boolean, blue: boolean) => dark ? 'rgba(255,255,255,0.12)' : blue ? 'rgba(255,255,255,0.2)' : 'var(--border)'

function DocThumbAgreement() {
  return (
    <DocThumb type="Agreement · Classic">
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 10, lineHeight: 1.2 }}>Brand identity<br />for Atlas &amp; Bell.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <div><div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-3)', marginBottom: 2 }}>CLIENT</div>Atlas &amp; Bell</div>
        <div><div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-3)', marginBottom: 2 }}>FEE</div>$24,000</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'auto' }}>
        {([null, '80%', '60%'] as const).map((w, i) => <span key={i} style={{ height: 3, background: 'var(--border)', borderRadius: 2, display: 'block', width: w ?? '100%' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span>AG · CLASSIC</span><span>Letter</span>
      </div>
    </DocThumb>
  )
}

function DocThumbInvoice() {
  return (
    <DocThumb type="Invoice · Modern" variant="accent">
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>INV-2026-014</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 8, marginBottom: 8, fontSize: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Atlas &amp; Bell</span><span>Due Jun 3</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 'auto', fontSize: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Phase 02</span><span>$7,200</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>Guidelines</span><span>$2,400</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>Project mgmt</span><span>$1,080</span></div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, marginTop: 10 }}>
        <span>Total</span><span>$10,680</span>
      </div>
    </DocThumb>
  )
}

function DocThumbProposal() {
  return (
    <DocThumb type="Proposal · Editorial">
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 8, lineHeight: 1.2 }}>A brand system<br />for Atlas &amp; Bell.</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>P-2026-014 · May 20</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'auto' }}>
        {([null, '75%', null, '55%'] as const).map((w, i) => <span key={i} style={{ height: 3, background: 'var(--border)', borderRadius: 2, display: 'block', width: w ?? '100%' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span>P · EDITORIAL</span><span>32pg</span>
      </div>
    </DocThumb>
  )
}

function DocThumbPRD() {
  return (
    <DocThumb type="PRD · Classic">
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, marginBottom: 4, letterSpacing: '-0.01em' }}>Onboarding 2.0</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>In Review · Q3 2026</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'auto' }}>
        {([null, '90%', '70%', null] as const).map((w, i) => <span key={i} style={{ height: 3, background: 'var(--border)', borderRadius: 2, display: 'block', width: w ?? '100%' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span>PRD · CLASSIC</span><span>Spec</span>
      </div>
    </DocThumb>
  )
}

function DocThumbRetainer() {
  const lb = linesBg(false, true)
  return (
    <DocThumb type="Retainer · Modern" variant="blue">
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 10, lineHeight: 1.2, color: 'rgba(255,255,255,0.95)' }}>Monthly creative retainer.</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 'auto', lineHeight: 1.6 }}>12-month engagement<br />North &amp; Quill × Atlas &amp; Bell<br />$4,500 / mo</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: `1px solid ${lb}`, paddingTop: 8 }}>
        <span>RET · MODERN</span><span>12mo</span>
      </div>
    </DocThumb>
  )
}

function DocThumbReceipt() {
  return (
    <DocThumb type="Receipt · Clean">
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>RCT-2026-118</div>
      <div style={{ fontSize: 10, color: 'var(--ink-2)', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Atlas &amp; Bell · Paid</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 10, marginBottom: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-2)' }}>Phase 02</span><span>$7,200</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-2)' }}>Guidelines</span><span>$2,400</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span>RCT · CLEAN</span><span>Paid</span>
      </div>
    </DocThumb>
  )
}

function DocThumbOnboarding() {
  return (
    <DocThumb type="Onboarding · Editorial">
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 10, lineHeight: 1.2 }}>Welcome to<br />North &amp; Quill.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'auto' }}>
        {([null, '85%', '65%', '90%'] as const).map((w, i) => <span key={i} style={{ height: 3, background: 'var(--border)', borderRadius: 2, display: 'block', width: w ?? '100%' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span>ONB · EDITORIAL</span><span>5pg</span>
      </div>
    </DocThumb>
  )
}

function DocThumbHandover() {
  return (
    <DocThumb type="Handover · Modern" variant="accent">
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'rgba(255,255,255,0.9)' }}>Project handover.</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 'auto', lineHeight: 1.6 }}>Deliverables, source files,<br />credentials &amp; next steps.<br />Atlas &amp; Bell — May 2026</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 8 }}>
        <span>HND · MODERN</span><span>Final</span>
      </div>
    </DocThumb>
  )
}

type Row1Component = () => React.ReactElement

const ROW_1: Row1Component[] = [
  DocThumbAgreement, DocThumbInvoice, DocThumbProposal, DocThumbPRD,
  DocThumbRetainer, DocThumbReceipt, DocThumbOnboarding, DocThumbHandover,
]

interface DocRow2Item { type: string; title: string; footL: string; footR: string; variant: '' | 'accent' | 'blue' }
interface SocialRow2Item { social: true; id: string }
type Row2Item = DocRow2Item | SocialRow2Item

const ROW_2_DOC: DocRow2Item[] = [
  { type: 'CV / Resume', title: 'Editorial, single column.', footL: 'CV · EDITORIAL', footR: 'A4', variant: '' },
  { type: 'CV / Resume', title: 'ATS-Mono, ATS-safe.', footL: 'CV · MONO', footR: 'Letter', variant: 'blue' },
  { type: 'CV / Resume', title: 'Modern designer portfolio.', footL: 'CV · MODERN', footR: 'A4', variant: '' },
  { type: 'Cover letter', title: 'Dear hiring team —', footL: 'CL · SERIF', footR: '1pg', variant: '' },
  { type: 'Cover letter', title: 'Punchy & brief.', footL: 'CL · MODERN', footR: '1pg', variant: 'accent' },
]

/* Social gallery thumbnails */
function SocialThumbQuote() {
  return (
    <div style={{ width: 240, height: 240, flexShrink: 0, background: '#1a2332', color: '#f8f9fb', borderRadius: 10, border: '1px solid #2d3847', padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 'auto' }}>A Better Future</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.2, marginBottom: 16 }}>"The secret to social media success? Authenticity &amp; consistency."</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>Maren Aksel</span><span>Quote · 1080×1080</span>
      </div>
    </div>
  )
}

function SocialThumbStat() {
  return (
    <div style={{ width: 240, height: 240, flexShrink: 0, background: '#f8f9fb', color: '#0f1419', borderRadius: 10, border: '1px solid var(--border)', padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>By the numbers</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-2)', marginBottom: 10 }}>Why do most posts fail?</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: '#0f1419', marginBottom: 4 }}>91%</div>
      <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: 'auto' }}>of posts get zero meaningful engagement.</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stat · 1080×1080</div>
    </div>
  )
}

function SocialThumbHotTake() {
  return (
    <div style={{ width: 240, height: 320, flexShrink: 0, background: '#2c4a6b', color: 'white', borderRadius: 10, border: '1px solid #243d59', padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 'auto' }}>Hot Take</div>
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 10 }}>You don't need another tool.</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.4, marginBottom: 18 }}>You need to <em style={{ fontWeight: 700 }}>finish one</em> of the seven tabs already open.</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vertical · 1080×1920</div>
    </div>
  )
}

function SocialThumbLaunch() {
  return (
    <div style={{ width: 240, height: 240, flexShrink: 0, background: '#1a2332', color: '#f8f9fb', borderRadius: 10, border: '1px solid #2d3847', padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Launching</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>A document generator</div>
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em', lineHeight: 1 }}>Atelier</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 8, marginBottom: 'auto' }}>Built for working freelancers.</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>May · 2026</span><span>1080×1080</span>
      </div>
    </div>
  )
}

function SocialThumbThreads() {
  return (
    <div style={{ width: 240, height: 240, flexShrink: 0, background: 'white', color: '#0f1419', borderRadius: 10, border: '1px solid var(--border)', padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>From the Feed</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, lineHeight: 1.55, color: '#0f1419', marginBottom: 8 }}>the hardest part of freelancing isn't the work. it's deciding the work is <em>finished</em> and sending the invoice.</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--accent)', marginBottom: 'auto' }}>yes, this is a personal attack.</div>
      <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 10 }}>
        <span>184 replies</span><span>1.2k likes</span>
      </div>
    </div>
  )
}

const SOCIAL_THUMB_MAP: Record<string, () => React.ReactElement> = {
  quote: SocialThumbQuote,
  stat: SocialThumbStat,
  hottake: SocialThumbHotTake,
  launch: SocialThumbLaunch,
  threads: SocialThumbThreads,
}

const SOCIAL_IDS = ['quote', 'stat', 'hottake', 'launch', 'threads']

function TemplateGallery() {
  const row1 = [...ROW_1, ...ROW_1, ...ROW_1].map((C, i) => <C key={i} />)

  const row2Base: Row2Item[] = [
    ...ROW_2_DOC,
    ...SOCIAL_IDS.map((id): SocialRow2Item => ({ social: true, id })),
  ]
  const row2 = [...row2Base, ...row2Base, ...row2Base]

  return (
    <section className="section" id="templates">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">Template library</span>
          <h2>Designed once. <span className="accent">Reused forever.</span></h2>
          <p className="section__lede">
            Every doc type ships with three style variants — Classic, Modern, Editorial — and a Social library with quote, stat, list, launch, and carousel formats.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="gallery__row">
          <div className="gallery">
            <div className="gallery__track">{row1}</div>
          </div>
        </div>

        <div className="gallery__row">
          <div className="gallery">
            <div className="gallery__track">
              {row2.map((t, i) => {
                if ('social' in t) {
                  const C = SOCIAL_THUMB_MAP[t.id]
                  return C ? <div key={i} style={{ flexShrink: 0 }}><C /></div> : null
                }
                return (
                  <div key={i} className={`thumb${t.variant === 'accent' ? ' thumb--accent' : t.variant === 'blue' ? ' thumb--blue' : ''}`}>
                    <div className="thumb__type">{t.type}</div>
                    <div className="thumb__title">{t.title}</div>
                    <div className="thumb__body"><span /><span /><span /><span /><span /></div>
                    <div className="thumb__foot">
                      <span>{t.footL}</span>
                      <span>{t.footR}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===================== USE CASES ===================== */
function UseCases() {
  return (
    <section className="section" id="usecases">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">Who it's for</span>
          <h2>Built for the three people <span className="accent">who pay for too many tools.</span></h2>
        </div>

        <div className="usecases">
          <div className="usecase">
            <span className="usecase__num">01</span>
            <div className="usecase__icon"><BriefcaseIcon /></div>
            <h3 className="usecase__title">Small business <span className="it">owners.</span></h3>
            <p className="usecase__desc">
              Stop paying $29/mo to invoice three clients. Generate everything that runs your back-office in one tab.
            </p>
            <ul className="usecase__list">
              <li>Invoices, receipts, retainers</li>
              <li>Branded onboarding &amp; handover docs</li>
              <li>Social posts that match</li>
            </ul>
          </div>

          <div className="usecase">
            <span className="usecase__num">02</span>
            <div className="usecase__icon"><UserIcon /></div>
            <h3 className="usecase__title">Job <span className="it">seekers.</span></h3>
            <p className="usecase__desc">
              ATS-friendly, editorial, or designer-portfolio — your CV in three styles, exported instantly with no email-walls.
            </p>
            <ul className="usecase__list">
              <li>Full CV template library</li>
              <li>Cover letters in matching styles</li>
              <li>Free PDF export, every time</li>
            </ul>
          </div>

          <div className="usecase">
            <span className="usecase__num">03</span>
            <div className="usecase__icon"><ConvertIcon /></div>
            <h3 className="usecase__title">Anyone with <span className="it">a file.</span></h3>
            <p className="usecase__desc">
              The PDF and image jobs that don't deserve a separate app, an account, or a "free trial."
            </p>
            <ul className="usecase__list">
              <li>PDF ↔ image conversions</li>
              <li>OCR on receipts &amp; scans</li>
              <li>WebP, AVIF, batch resize</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===================== PRICING ===================== */
function Pricing() {
  return (
    <section className="section section--dark" id="pricing">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">Pricing</span>
          <h2>Generous free. <span className="accent">Honest Pro.</span></h2>
          <p className="section__lede">
            The suite is free to use. Pro unlocks higher daily limits, premium templates, and bulk export. That's it. No "starter," "team," "scale" maze.
          </p>
        </div>

        <div className="pricing">
          <div className="price-tier">
            <div className="price-tier__name">Free · forever</div>
            <div className="price-tier__price">
              <span className="num" style={{ color: 'rgb(106, 106, 106)' }}>$0</span>
              <span className="per">/ no card, no signup</span>
            </div>
            <div className="price-tier__tag">For 90% of people.</div>
            <ul className="price-tier__list" style={{ color: 'rgb(0, 0, 0)' }}>
              <li>All 5 tools, fully functional</li>
              <li>All 9 document types + social</li>
              <li>Full CV template library</li>
              <li>PDF &amp; image exports (no watermark)</li>
              <li>OCR up to 20 pages / day</li>
              <li>Settings stored locally on your device</li>
            </ul>
            <div>
              <Link className="btn btn--ghost" to="/document-generator" style={{ background: 'rgba(255,255,255,0.1)', color: '#f8f9fb', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                Start with Free <ArrowSmIcon />
              </Link>
            </div>
          </div>

          <div className="price-tier price-tier--pro">
            <div className="price-tier__name">Pro · $9 / mo</div>
            <div className="price-tier__price">
              <span className="num">$9</span>
              <span className="per">/ month — or IDR 99,000</span>
            </div>
            <div className="price-tier__tag">For people running a business.</div>
            <ul className="price-tier__list">
              <li>Everything in Free, plus —</li>
              <li>100 exports per day</li>
              <li>Premium CV &amp; document templates</li>
              <li>AI drafting for proposals, PRDs, CVs</li>
              <li>Priority support</li>
            </ul>
            <div>
              <Link className="btn btn--accent" to="/pricing">See Pro plans <ArrowSmIcon /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===================== NEWSLETTER ===================== */
function Newsletter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thanks — you're on the list.")
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section__head section__head--center">
          <span className="eyebrow eyebrow--accent">Field notes</span>
          <h2 className="newsletter"><span style={{ display: 'block' }}>The slow newsletter <span className="accent">for working people.</span></span></h2>
          <p className="section__lede" style={{ margin: '0 auto' }}>
            One short note, once a month. New templates, new tools, the occasional spreadsheet. No tracking, no upsells, unsubscribe in one click.
          </p>
        </div>

        <div className="newsletter">
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input className="newsletter__input" type="email" placeholder="you@work.email" required />
            <button className="btn btn--accent" type="submit">Subscribe <ArrowSmIcon /></button>
          </form>
          <div className="newsletter__note">~ 2,140 readers · zero ads</div>
        </div>
      </div>
    </section>
  )
}

/* ===================== FOOTER ===================== */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <a className="nav__brand" href="/">
              <span className="nav__mark" />
              <span>Atelier</span>
              <span className="nav__brand-sub">by Vanaila</span>
            </a>
            <p className="footer__brand-text">A small suite of free tools for the documents that surround the work — and the formats that surround the documents.</p>
          </div>
          <div>
            <div className="footer__col-title">Tools</div>
            <Link className="footer__col-link" to="/document-generator">Document Generator</Link>
            <Link className="footer__col-link" to="/cv-builder">CV Builder</Link>
            <Link className="footer__col-link" to="/pdf-to-image">PDF to Image</Link>
            <Link className="footer__col-link" to="/ocr">Scan (OCR)</Link>
            <Link className="footer__col-link" to="/image-converter">Image Converter</Link>
            <Link className="footer__col-link" to="/social-generator">Social Generator</Link>
          </div>
          <div>
            <div className="footer__col-title">Company</div>
            <Link className="footer__col-link" to="/manual">Manual</Link>
            <a className="footer__col-link" href="#">About</a>
            <a className="footer__col-link" href="#">Changelog</a>
            <a className="footer__col-link" href="#">Roadmap</a>
          </div>
          <div>
            <div className="footer__col-title">Legal</div>
            <Link className="footer__col-link" to="/privacy">Privacy</Link>
            <Link className="footer__col-link" to="/terms">Terms</Link>
            <Link className="footer__col-link" to="/refund">Refund</Link>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Vanaila Digital</span>
          <span>app.vanailadigital.com</span>
        </div>
      </div>
    </footer>
  )
}

/* ===================== PAGE ===================== */
export default function Landing() {
  useEffect(() => {
    document.title = 'Atelier by Vanaila — Documents, CVs, conversions & more'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Documents, CVs, image and PDF conversions, OCR, and social posts — built in your browser. No installs, no accounts, no watermarks.')
  }, [])

  return (
    <>
      <Nav />
      <Hero />
      <Logos />
      <ToolsGrid />
      <TryItEmbed />
      <TemplateGallery />
      <UseCases />
      <Pricing />
      <Newsletter />
      <Footer />
    </>
  )
}
