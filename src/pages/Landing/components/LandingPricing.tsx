import { Link } from 'react-router-dom';
import { TOOLS } from '../../../lib/tools';
import { ArrowSmIcon } from './Icons';

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
              <li>All {TOOLS.length} tools, fully functional</li>
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
            <div className="price-tier__name">Paid plans · from $5 / mo</div>
            <div className="price-tier__price">
              <span className="num">$5</span>
              <span className="per">/ month — or IDR 49,000</span>
            </div>
            <div className="price-tier__tag">Starter, Pro, and Business tiers.</div>
            <ul className="price-tier__list">
              <li>Everything in Free, plus —</li>
              <li>30–300 exports per day, by tier</li>
              <li>Premium CV &amp; document templates</li>
              <li>AI drafting for proposals, PRDs, CVs</li>
              <li>Priority support on Business</li>
            </ul>
            <div>
              <Link className="btn btn--accent" to="/pricing">Compare plans <ArrowSmIcon /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===================== NEWSLETTER ===================== */

export { Pricing as LandingPricing };
