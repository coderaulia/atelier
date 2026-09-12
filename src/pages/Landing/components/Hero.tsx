import { Link } from 'react-router-dom';
import { TOOLS } from '../../../lib/tools';
import { ArrowIcon, UploadIcon } from './Icons';

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
            Now live · {TOOLS.length} browser tools
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
            <a className="btn btn--ghost btn--lg" href="#tools">See all {TOOLS.length} tools</a>
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

export { Hero };
