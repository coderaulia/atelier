import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContextProvider } from '@/context/AppContext'
import MarketingNav from '@/components/navigation/MarketingNav'
import type { ToolDefinition } from '@/lib/tools'
import { toolPages } from '@/pages/toolPages'
import './marketing-wrapper.css'

interface MarketingWrapperProps {
  tool: ToolDefinition
  children: ReactNode
}

export default function MarketingWrapper({ tool, children }: MarketingWrapperProps) {
  const navigate = useNavigate()
  const [signupPromptOpen, setSignupPromptOpen] = useState(false)

  // Find matching toolPage for SEO content
  const toolPage = toolPages.find((tp) => tp.slug === tool.id)

  const handleAuthRequired = () => {
    localStorage.setItem('vs_post_auth_redirect', tool.appPath)
    navigate('/register')
  }

  const handleUpgradeRequired = () => {
    setSignupPromptOpen(true)
  }

  return (
    <AppContextProvider
      onAuthRequired={handleAuthRequired}
      onUpgradeRequired={handleUpgradeRequired}
      activeTool={tool}
    >
      <div className="marketing-wrapper">
        <MarketingNav />

        <section className="mw-hero">
          <div className="mw-hero__content">
            <span className="mw-hero__badge">🔒 Private browser tool</span>
            <h1 className="mw-hero__title">{tool.name}</h1>
            <p className="mw-hero__description">{tool.description}</p>
            <div className="mw-hero__actions">
              <a href="#tool" className="mw-hero__cta mw-hero__cta--primary">
                Try free
              </a>
              <Link to="/pricing" className="mw-hero__cta mw-hero__cta--ghost">
                See Pro plans
              </Link>
            </div>
          </div>
          <div className="mw-hero__orb" aria-hidden="true" />
        </section>

        <section id="tool" className="mw-tool-section">
          <div className="mw-tool-container">
            <div className="mw-tool-header">
              <span className="mw-tool-header__label">Live tool</span>
              <strong className="mw-tool-header__name">{tool.name}</strong>
            </div>
            <div className="mw-tool-frame">{children}</div>
          </div>
        </section>

        {toolPage && (
          <>
            <section className="mw-section">
              <div className="mw-section__eyebrow">How it works</div>
              <h2 className="mw-section__title">Upload, process, download</h2>
              <div className="mw-steps">
                {['Upload your file', 'Process in browser', 'Download result'].map((step, i) => (
                  <article className="mw-step" key={step}>
                    <div className="mw-step__number">0{i + 1}</div>
                    <div className="mw-step__icon">{['⬆️', '⚙️', '⬇️'][i]}</div>
                    <h3 className="mw-step__title">{step}</h3>
                    <p className="mw-step__text">
                      {['Choose file from your device.', 'Vanaila runs work locally.', 'Save clean output instantly.'][i]}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mw-section">
              <div className="mw-section__eyebrow">Features</div>
              <h2 className="mw-section__title">Built for private, fast output</h2>
              <div className="mw-features">
                {toolPage.features.map((feature) => (
                  <article className="mw-feature" key={feature.text}>
                    <span className="mw-feature__icon">{feature.icon}</span>
                    <p className="mw-feature__text">{feature.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="faq" className="mw-section mw-faq">
              <div className="mw-section__eyebrow">FAQ</div>
              <h2 className="mw-section__title">Questions people ask</h2>
              <div className="mw-faq__list">
                {toolPage.faqs.map((faq) => (
                  <details key={faq.question} className="mw-faq__item" open>
                    <summary className="mw-faq__question">{faq.question}</summary>
                    <p className="mw-faq__answer">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="mw-cta-banner">
          <h2 className="mw-cta-banner__title">Sign up free — get {tool.freeDailyLimit} uses/day</h2>
          <p className="mw-cta-banner__text">
            No watermarks. Upgrade to Pro for unlimited access and premium features.
          </p>
          <div className="mw-cta-banner__actions">
            <Link to="/register" className="mw-cta-banner__btn mw-cta-banner__btn--primary">
              Sign up free
            </Link>
            <Link to="/pricing" className="mw-cta-banner__btn mw-cta-banner__btn--ghost">
              See Pro plans
            </Link>
          </div>
        </section>

        <footer className="mw-footer">
          <div className="mw-footer__content">
            <p>
              <strong>Privacy note:</strong> Files never leave your browser.
            </p>
            <nav className="mw-footer__links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/refund">Refund Policy</Link>
            </nav>
          </div>
        </footer>

        {signupPromptOpen && (
          <div className="mw-signup-modal">
            <div className="mw-signup-modal__backdrop" onClick={() => setSignupPromptOpen(false)} />
            <div className="mw-signup-modal__content">
              <button
                className="mw-signup-modal__close"
                type="button"
                onClick={() => setSignupPromptOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3>You've used your free tries</h3>
              <p>Sign up free for {tool.freeDailyLimit} uses per day, or go Pro for unlimited access.</p>
              <div className="mw-signup-modal__actions">
                <Link
                  to="/register"
                  className="mw-signup-modal__btn mw-signup-modal__btn--primary"
                  onClick={() => {
                    localStorage.setItem('vs_post_auth_redirect', tool.appPath)
                  }}
                >
                  Sign up free
                </Link>
                <Link to="/pricing" className="mw-signup-modal__btn mw-signup-modal__btn--ghost">
                  See Pro plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppContextProvider>
  )
}
