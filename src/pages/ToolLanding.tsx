import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav from '@/components/navigation/MarketingNav'
import { type ToolPage } from './toolPages'

export default function ToolLanding({ tool, children }: { tool: ToolPage; children: ReactNode }) {
  useEffect(() => {
    document.title = tool.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', tool.description)
  }, [tool])

  return (
    <main className="tool-seo-page" style={{ '--tool-accent': tool.accent } as React.CSSProperties}>
      <MarketingNav />

      <section className="tool-hero">
        <div className="tool-hero__copy">
          <div className="tool-pill">Private browser tool</div>
          <h1>{tool.primaryKeyword}</h1>
          <p>{tool.valueProp}</p>
          <div className="tool-hero__actions">
            <a className="tool-cta tool-cta--primary" href="#live-tool">Try free</a>
            <Link className="tool-cta tool-cta--ghost" to="/pricing">Upgrade to Pro</Link>
          </div>
        </div>
        <div className="tool-hero__orb" aria-hidden="true" />
      </section>

      <section id="live-tool" className="tool-live" aria-label={`${tool.name} live tool`}>
        <div className="tool-live__header">
          <span>Live tool</span>
          <strong>{tool.name}</strong>
        </div>
        <div className="tool-live__frame">{children}</div>
      </section>

      <section className="tool-section">
        <div className="tool-section__eyebrow">How it works</div>
        <h2>Upload, process, download</h2>
        <div className="tool-steps">
          {['Upload your file', 'Process in browser', 'Download result'].map((step, index) => (
            <article className="tool-step" key={step}>
              <div className="tool-step__number">0{index + 1}</div>
              <div className="tool-step__icon">{['⬆️', '⚙️', '⬇️'][index]}</div>
              <h3>{step}</h3>
              <p>{['Choose file from your device.', 'Vanaila runs work locally.', 'Save clean output instantly.'][index]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tool-section">
        <div className="tool-section__eyebrow">Features</div>
        <h2>Built for private, fast output</h2>
        <div className="tool-features">
          {tool.features.map((feature) => (
            <article className="tool-feature" key={feature.text}>
              <span>{feature.icon}</span>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="tool-section tool-faq">
        <div className="tool-section__eyebrow">FAQ</div>
        <h2>Questions people ask</h2>
        <div className="tool-faq__list">
          {tool.faqs.map((faq) => (
            <details key={faq.question} open>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="tool-final-cta">
        <h2>Try {tool.name} free</h2>
        <p>Use browser-private tools with no watermarks. Upgrade when you need Pro templates, higher limits, and bulk export.</p>
        <div className="tool-hero__actions">
          <a className="tool-cta tool-cta--primary" href="#live-tool">Try free</a>
          <Link className="tool-cta tool-cta--ghost" to="/pricing">Upgrade to Pro</Link>
        </div>
      </section>

      <footer className="tool-footer">
        <strong>Privacy note:</strong> files never leave your browser.
      </footer>
    </main>
  )
}
