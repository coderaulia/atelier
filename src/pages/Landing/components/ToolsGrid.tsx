import { Link } from 'react-router-dom';
import { TOOLS } from '../../../lib/tools';
import { ArrowSmIcon, DocIcon } from './Icons';

function Logos() {
  return (
    <section className="logos container">
      <div className="logos__label">A toolkit instead of a stack of subscriptions</div>
      <div className="logos__row">
        <span className="logos__item">Documents</span>
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
  'Retainer', 'Receipt', 'Onboarding', 'Handover', 'Social', 'CSV Bulk',
]

interface LandingToolCopy {
  group: string
  title: string
  description: string
  cta: string
  size: 'lg' | 'md'
}

const LANDING_TOOL_COPY: Record<string, LandingToolCopy> = {
  'social-generator': {
    group: 'Social',
    title: 'Posts that look designed.',
    description: 'Square, vertical, and carousel templates with your brand baked in. Export individual slides.',
    cta: 'Open Social',
    size: 'md',
  },
  'cv-builder': {
    group: 'CV Studio',
    title: 'A CV that lands.',
    description: 'ATS-friendly. Editorial. Designer-portfolio. Pick a template, type once, export to PDF. No paywall on download.',
    cta: 'Try the live demo',
    size: 'lg',
  },
  'pdf-to-image': {
    group: 'Convert',
    title: 'PDF pages into images.',
    description: 'PDF → JPG or PNG. Batch pages, pick resolution, and keep files local in your browser.',
    cta: 'Convert PDFs',
    size: 'lg',
  },
  'pdf-merge': {
    group: 'PDF Merge',
    title: 'Merge PDFs instantly.',
    description: 'Combine up to 20 PDFs into one file. Drag to reorder. Done locally.',
    cta: 'Merge PDFs',
    size: 'md',
  },
  'pdf-compress': {
    group: 'PDF Compress',
    title: 'Compress PDFs for sharing.',
    description: 'Reduce PDF file size in-browser with light, balanced, or maximum compression.',
    cta: 'Compress PDFs',
    size: 'md',
  },
  'pdf-organize': {
    group: 'PDF Organize',
    title: 'Reorder pages without Acrobat.',
    description: 'Rotate, remove, extract, and rearrange PDF pages in one private browser workspace.',
    cta: 'Organize PDFs',
    size: 'md',
  },
  'pdf-split': {
    group: 'PDF Split',
    title: 'Split PDFs into clean sets.',
    description: 'Break large PDFs into pages or custom ranges without uploading client files.',
    cta: 'Split PDFs',
    size: 'md',
  },
  'pdf-watermark': {
    group: 'PDF Watermark',
    title: 'Mark PDFs before sending.',
    description: 'Add styled text watermarks for drafts, approvals, client review, and internal files.',
    cta: 'Watermark PDFs',
    size: 'md',
  },
  'pdf-markdown': {
    group: 'PDF Convert',
    title: 'Turn PDFs into useful notes.',
    description: 'Extract selectable text into clean, editable Markdown. Keep private documents on your device.',
    cta: 'Convert to Markdown',
    size: 'md',
  },
  'pdf-word': {
    group: 'PDF Convert',
    title: 'Make PDF text editable again.',
    description: 'Convert text-first PDFs into a usable Word document without sending files anywhere.',
    cta: 'Convert to Word',
    size: 'md',
  },
  'pdf-powerpoint': {
    group: 'PDF Convert',
    title: 'Bring PDF pages to a deck.',
    description: 'Create editable text slides or presentation-ready visual slides from a PDF in your browser.',
    cta: 'Convert to PowerPoint',
    size: 'md',
  },
  'pdf-edit': {
    group: 'PDF Edit',
    title: 'Fix a PDF before it leaves.',
    description: 'Move and rotate pages, add text overlays, or apply black cover blocks without uploading a document.',
    cta: 'Edit PDF',
    size: 'md',
  },
  'image-converter': {
    group: 'Image Lab',
    title: 'WebP, AVIF, whatever.',
    description: "Convert PNG, JPG, WebP, and AVIF for your CMS, client, or aunt's iPhone.",
    cta: 'Convert images',
    size: 'md',
  },
  'image-compress': {
    group: 'Image Compress',
    title: 'Shrink images without drama.',
    description: 'Reduce image size for web, email, storefronts, and client handoff without leaving the tab.',
    cta: 'Compress images',
    size: 'md',
  },
  'image-resize': {
    group: 'Image Resize',
    title: 'Resize crops to spec.',
    description: 'Crop, scale, and export images for thumbnails, banners, avatars, and social posts.',
    cta: 'Resize images',
    size: 'md',
  },
  'image-bg': {
    group: 'Image Cleanup',
    title: 'Backgrounds and metadata handled.',
    description: 'Remove backgrounds, inspect metadata, and strip hidden image details before sharing.',
    cta: 'Clean images',
    size: 'md',
  },
  ocr: {
    group: 'Scan',
    title: 'OCR that just works.',
    description: 'Image or PDF in, plain text out. Receipts, screenshots, scanned docs.',
    cta: 'Extract text',
    size: 'md',
  },
}

const TOOL_BADGE_LABELS: Record<string, string> = {
  new: '● New',
  beta: '● Beta',
  pro: '● Pro',
}

const otherTools = TOOLS.filter((tool) => tool.id !== 'document-generator')

function ToolsGrid() {
  return (
    <section className="section" id="tools">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">The Suite · {TOOLS.length.toString().padStart(2, '0')} Tools</span>
          <h2>Fourteen tools that replace a <span className="accent">monthly stack</span> of subscriptions.</h2>
          <p className="section__lede">
            Each one solves a real, recurring annoyance. Use them standalone. Or as a chain — write the proposal, convert the PDF, post the win.
          </p>
        </div>

        <div className="tools">
          <Link className="tool-card tool-card--hero" to="/document-generator">
            <div className="tool-card__body">
              <div className="tool-card__num">Tool 01 / Documents</div>
              <div className="tool-card__icon"><DocIcon /></div>
              <h3 className="tool-card__title">The document generator <span className="it">that ships.</span></h3>
              <p className="tool-card__desc">
                Nine document types, CSV bulk generation, three style variants each, live preview, PDF and image export. Built for the work between the work — agreements, invoices, retainers, the lot.
              </p>
              <div className="tool-card__doctypes">
                {DOC_TYPES.map((d) => <span key={d} className="dt-pill">{d}</span>)}
              </div>
              <div className="tool-card__foot">
                <span className="tool-card__cta">Open Documents <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
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

          {otherTools.map((tool, index) => {
            const copy = LANDING_TOOL_COPY[tool.id] ?? {
              group: tool.category,
              title: tool.name,
              description: tool.description,
              cta: `Open ${tool.name}`,
              size: 'md' as const,
            }
            const badgeLabel = tool.badge ? TOOL_BADGE_LABELS[tool.badge] ?? `● ${tool.badge}` : '● Live'
            return (
              <Link key={tool.id} className={`tool-card tool-card--${copy.size}`} to={tool.publicPath}>
                <div className="tool-card__num">Tool {String(index + 2).padStart(2, '0')} / {copy.group}</div>
                <div className="tool-card__icon">{tool.icon}</div>
                <h3 className="tool-card__title">{copy.title}</h3>
                <p className="tool-card__desc">{copy.description}</p>
                <div className="tool-card__foot">
                  <span className="tool-card__cta">{copy.cta} <span className="tool-card__cta-arrow"><ArrowSmIcon /></span></span>
                  <span className="tool-card__badge tool-card__badge--live">{badgeLabel}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { Logos, ToolsGrid };
