import { Link } from 'react-router-dom'
import { TOOLS } from '@/lib/tools'
import './marketing-footer.css'

export default function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer__grid">
        <div className="marketing-footer__brand">
          <Link to="/" className="marketing-footer__logo"><span className="nav__mark" />Vanaila Studio</Link>
          <p>Private browser tools for documents, content, CVs, PDFs, images, and OCR.</p>
          <span className="marketing-footer__meta">Private tools · studio.vanaila.com</span>
        </div>
        <div>
          <h2>Explore</h2>
          <Link to="/pricing">Pricing</Link>
          <Link to="/manual">Manual</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h2>Company</h2>
          <Link to="/about">About Vanaila Studio</Link>
          <Link to="/changelog">Changelog</Link>
          <Link to="/roadmap">Roadmap</Link>
          <a href="mailto:hello@vanaila.com">hello@vanaila.com</a>
        </div>
        <div>
          <h2>Legal</h2>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/refund">Refund Policy</Link>
          <Link to="/contact">Support</Link>
        </div>
      </div>
      <div className="marketing-footer__bottom">
        <span>© {new Date().getFullYear()} Vanaila Digital</span>
        <span>{TOOLS.length} tools · Files stay in your browser</span>
      </div>
    </footer>
  )
}
