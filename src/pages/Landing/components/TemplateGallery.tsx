import React from 'react';

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

export { TemplateGallery };
