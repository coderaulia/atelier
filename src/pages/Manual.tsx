import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '../lib/tools'

const sections = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'tools', label: 'Tools' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'billing', label: 'Billing' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'faq', label: 'FAQ' },
]

const toolTips: Record<string, string[]> = {
  'document-generator': [
    'Choose a document type and style variant, then fill Studio Settings once for reusable brand details.',
    'For bulk work, download or match CSV headers for selected document type, then upload CSV and map fields.',
    'Export generated documents as a PDF or PNG ZIP when final copy is ready.',
  ],
  'social-generator': [
    'Pick square, vertical, or carousel templates.',
    'Upload brand images when templates support media fields.',
    'Export one slide or full carousel as PNG/JPG.',
  ],
  'cv-builder': [
    'Start with imported data or fill profile sections manually.',
    'Use ATS-friendly templates for job applications.',
    'Export final resume as PDF.',
  ],
  'pdf-to-image': [
    'Drop a PDF and select PNG or JPG output.',
    'Use higher scale for sharper previews.',
    'Download selected pages or all pages as a ZIP.',
  ],
  'pdf-merge': [
    'Add multiple PDFs.',
    'Drag files into final order.',
    'Merge and download one combined PDF.',
  ],
  'pdf-compress': [
    'Upload a PDF.',
    'Choose light, balanced, or maximum compression.',
    'Preview size savings before download.',
  ],
  'pdf-organize': [
    'Upload a PDF file and view pages as visual thumbnails.',
    'Drag page thumbnails to reorder, or select and rotate/delete.',
    'Export organized document or extract selected pages as PDF/ZIP.',
  ],
  'pdf-split': [
    'Upload a PDF file.',
    'Choose to split every page, every N pages, or specify custom ranges.',
    'Download split PDF files as a ZIP package.',
  ],
  'pdf-watermark': [
    'Upload a PDF file.',
    'Set custom text and adjust size, opacity, rotation, color, and placement.',
    'Preview changes on the first page, then apply and download watermarked PDF.',
  ],
  'pdf-markdown': [
    'Upload a PDF with selectable text.',
    'Convert the first 10 pages on Free, or up to 100 pages on Pro.',
    'Copy the editable preview or download a Markdown file; Pro can OCR scanned pages.',
  ],
  'pdf-word': [
    'Upload a PDF with selectable text.',
    'Convert the first 10 pages on Free, or up to 100 pages on Pro.',
    'Open the downloaded DOCX in Word or another compatible editor to continue editing.',
  ],
  'pdf-powerpoint': [
    'Upload a PDF document.',
    'Choose editable text slides for revision or visual slides to preserve page appearance.',
    'Download the resulting PPTX and continue working in PowerPoint or a compatible presentation editor.',
  ],
  'pdf-edit': [
    'Choose a PDF and select the page to adjust.',
    'Move, rotate, or remove pages, then add text or configure black cover blocks.',
    'Cover blocks only hide content visually; do not use them as secure redaction.',
  ],
  'image-converter': [
    'Upload one or more images.',
    'Choose output format: PNG, JPG, WebP, or AVIF.',
    'Resize or adjust quality before export.',
  ],
  'image-compress': [
    'Upload one or more images (JPG, PNG, WebP, AVIF).',
    'Adjust quality slider or input target file size in KB.',
    'Compare file sizes and download optimized output.',
  ],
  'image-resize': [
    'Upload your image.',
    'Enter target width/height or select custom preset (like social crop ratios).',
    'Set fit/crop mode and download resized image.',
  ],
  'image-bg': [
    'Upload image (PNG, JPG, WebP, AVIF).',
    'Select keyed color to make background transparent or replace it with custom color.',
    'Optionally view basic metadata fields or strip them during local re-encode.',
  ],
  ocr: [
    'Upload image or PDF scan.',
    'Select language when available.',
    'Copy extracted text or download it as a text file.',
  ],
}

function ManualNav() {
  return (
    <nav className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__mark" />
          <span>Vanaila Studio</span>
          <span className="nav__brand-sub">Manual</span>
        </Link>
        <div className="nav__links">
          {sections.slice(0, 4).map((section) => (
            <a key={section.id} className="nav__link" href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </div>
        <div className="nav__actions">
          <Link className="nav__link" to="/pricing">Pricing</Link>
          <Link className="btn btn--primary" to="/app/dashboard">Open app</Link>
        </div>
      </div>
    </nav>
  )
}

function ManualCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="manual-card">
      <h3>{title}</h3>
      {children}
    </article>
  )
}

export default function Manual() {
  useEffect(() => {
    document.title = 'Vanaila Studio Manual — Help, tools, billing, and privacy'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'User manual for Vanaila Studio. Learn how to use document, CV, PDF, image, OCR, account, billing, and privacy features.'
      )
    }
  }, [])

  return (
    <>
      <ManualNav />
      <main className="manual-page">
        <section className="manual-hero">
          <div className="container manual-hero__grid">
            <div>
              <span className="eyebrow eyebrow--accent">User manual</span>
              <h1>Make finished files without learning another app.</h1>
              <p>
                Quick guide for using Vanaila Studio tools, managing account access, buying credits,
                and understanding how files stay private in your browser.
              </p>
              <div className="hero__ctas">
                <Link className="btn btn--accent btn--lg" to="/app/dashboard">Open dashboard</Link>
                <a className="btn btn--ghost btn--lg" href="#tools">Browse tool guides</a>
              </div>
            </div>
            <aside className="manual-hero__panel" aria-label="Manual contents">
              <div className="manual-hero__panel-title">Contents</div>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>{section.label}</a>
              ))}
            </aside>
          </div>
        </section>

        <section id="getting-started" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">Start here</span>
            <h2>Three ways to use Vanaila Studio.</h2>
          </div>
          <div className="manual-grid manual-grid--three">
            <ManualCard title="Use public tools">
              <p>Open any tool page from the homepage. Anonymous usage is tracked locally in your browser.</p>
            </ManualCard>
            <ManualCard title="Create a free account">
              <p>Register, verify email, and use tools inside the `/app` dashboard with synced account limits.</p>
            </ManualCard>
            <ManualCard title="Upgrade to Pro">
              <p>Unlock unlimited daily access, premium templates, and bulk export. No per-use purchases needed.</p>
            </ManualCard>
          </div>
        </section>

        <section id="tools" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">Tool guides</span>
            <h2>Pick a tool. Follow small steps.</h2>
          </div>
          <div className="manual-tool-list">
            {TOOLS.map((tool) => (
              <article key={tool.id} className="manual-tool">
                <div className="manual-tool__head">
                  <span className="manual-tool__icon">{tool.icon}</span>
                  <div>
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                  </div>
                </div>
                <ol>
                  {(toolTips[tool.id] ?? ['Open tool.', 'Add files or content.', 'Export result.']).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ol>
                <div className="manual-tool__actions">
                  <Link to={tool.publicPath}>Open public tool</Link>
                  <Link to={tool.appPath}>Open in app</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="accounts" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">Accounts</span>
            <h2>Keep access clean and recoverable.</h2>
          </div>
          <div className="manual-grid manual-grid--two">
            <ManualCard title="Registration and login">
              <ul>
                <li>Create account with email and password.</li>
                <li>Verify email from inbox before full account use.</li>
                <li>Use password reset if login credentials are lost.</li>
              </ul>
            </ManualCard>
            <ManualCard title="Account deletion">
              <ul>
                <li>Delete request starts soft-deletion grace period.</li>
                <li>Sessions are checked against account status.</li>
                <li>Contact support if deletion was accidental.</li>
              </ul>
            </ManualCard>
          </div>
        </section>

        <section id="billing" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">Billing</span>
            <h2>Simple subscription with no surprise charges.</h2>
          </div>
          <div className="manual-grid manual-grid--two">
            <ManualCard title="Pro subscription">
              <p>Pro unlocks unlimited daily use, premium templates, and bulk export. Payments run through Midtrans.</p>
            </ManualCard>

            <ManualCard title="Receipts">
              <p>After payment, open the receipt page from checkout redirect or account transaction history.</p>
            </ManualCard>
            <ManualCard title="Refunds">
              <p>Refund requests are reviewed manually. High usage may require extra review before approval.</p>
            </ManualCard>
          </div>
        </section>

        <section id="privacy" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">Privacy</span>
            <h2>Your files stay local.</h2>
          </div>
          <div className="manual-callout">
            <strong>Important:</strong> PDF, image, and OCR processing runs in your browser. Files are not uploaded to Vanaila servers for conversion.
          </div>
          <div className="manual-grid manual-grid--three">
            <ManualCard title="Local processing"><p>Canvas, pdf.js, Tesseract.js, JSZip, and pdf-lib run client-side.</p></ManualCard>
            <ManualCard title="Usage tracking"><p>Accounts send usage counts only. Anonymous usage stays in localStorage.</p></ManualCard>
            <ManualCard title="Error logs"><p>Error logs avoid PII and never include uploaded file contents.</p></ManualCard>
          </div>
        </section>

        <section id="faq" className="manual-section container">
          <div className="section__head">
            <span className="eyebrow eyebrow--accent">FAQ</span>
            <h2>Common questions.</h2>
          </div>
          <div className="manual-faq">
            <details><summary>Do I need an account?</summary><p>No. Public tools work without signup, with lower anonymous limits.</p></details>
            <details><summary>Are there watermarks?</summary><p>No. Free and Pro exports are clean unless product policy changes later.</p></details>
            <details><summary>Why did export fail?</summary><p>Check file size, browser memory, and daily limit. Try fewer pages or lower output quality.</p></details>
            <details><summary>Which browser is best?</summary><p>Use current Chrome, Edge, Firefox, or Safari. Large PDF/image tasks work best on desktop.</p></details>
            <details><summary>How do I get support?</summary><p>Email studio@vanaila.com with account email, tool name, and steps to reproduce.</p></details>
          </div>
        </section>
      </main>
    </>
  )
}
