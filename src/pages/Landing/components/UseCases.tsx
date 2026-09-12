import { BriefcaseIcon, UserIcon, ConvertIcon } from './Icons';

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

export { UseCases };
