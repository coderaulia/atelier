// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* =============== RETAINER ===================== */
/* ============================================== */

function RetainerClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Retainer Agreement</div>
        <div className="t-sub">Monthly services between {data.studioName || brand.studioName || "Studio"} and {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Studio</dt><dd>{data.studioName || brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Monthly fee</dt><dd>{fmt.money(data.monthlyFee, data.currency)}</dd></div>
        <div className="t-meta-block"><dt>Start date</dt><dd>{fmt.date(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Duration</dt><dd>{data.contractDuration || "—"}</dd></div>
        <div className="t-meta-block"><dt>Payment due</dt><dd>{data.paymentDueDay || "—"}</dd></div>
      </dl>
      <h2>1. Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>2. Revision Limit</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>{data.revisionLimit || "—"}</p>
      <h2>3. Payment Terms</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        The monthly retainer fee of <strong>{fmt.money(data.monthlyFee, data.currency)}</strong> is due on the {data.paymentDueDay || "1st"} of each month. Payment terms: Net 7 from invoice date.
      </p>
      <h2>4. Governing Law</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>This agreement shall be governed by the laws of {data.governingLaw || "—"}.</p>
      <div className="t-foot">
        <div><div className="t-sign">{brand.fullName || "—"}<br/>{brand.studioName}</div></div>
        <div><div className="t-sign">{data.clientName || "—"}</div></div>
      </div>
    </div>
  );
}

function RetainerModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Retainer<br/><em>Agreement</em></div>
          <div className="t-num">{fmt.money(data.monthlyFee, data.currency)} / mo</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}</div>
          <div className="t-from-meta" style={{ marginTop: 6 }}>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Starts</dt><dd>{fmt.dateShort(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Duration</dt><dd>{data.contractDuration || "—"}</dd></div>
        <div className="t-meta-block"><dt>Due on</dt><dd>{data.paymentDueDay || "—"}</dd></div>
      </dl>
      <h2>Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>Revision Limit</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>{data.revisionLimit || "—"}</p>
      <h2>Payment</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.monthlyFee, data.currency)} due on the {data.paymentDueDay || "1st"} of each month.
      </p>
      <h2>Governing Law</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>{data.governingLaw || "—"}</p>
      <div className="t-foot">
        <div>
          <div className="t-sign"></div>
          <div>{brand.fullName || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign"></div>
          <div>{data.clientName || "—"}</div>
        </div>
      </div>
    </div>
  );
}

function RetainerEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Retainer</span>
        <span>{fmt.dateShort(data.startDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>retainer</em></div>
        <div className="t-sub">between {data.studioName || brand.studioName || "Studio"} and {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Monthly fee</dt><dd style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "13pt" }}>{fmt.money(data.monthlyFee, data.currency)}</dd></div>
        <div className="t-meta-block"><dt>Duration</dt><dd>{data.contractDuration || "—"}</dd></div>
        <div className="t-meta-block"><dt>Due</dt><dd>{data.paymentDueDay || "—"}</dd></div>
        <div className="t-meta-block"><dt>Governing law</dt><dd>{data.governingLaw || "—"}</dd></div>
      </dl>
      <h3>The Work</h3><h2>What is covered.</h2>
      <DocBody md={data.scope} />
      <h3>Revisions</h3><h2>How many rounds.</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>{data.revisionLimit || "—"}</p>
      <h3>Payment</h3><h2>What is owed, and when.</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.monthlyFee, data.currency)} due on the {data.paymentDueDay || "1st"} of each month.
      </p>
      <div className="t-sign-area">
        <div className="t-sign">{brand.fullName || "—"}<br/>{brand.studioName}</div>
        <div className="t-sign">{data.clientName || "—"}</div>
      </div>
      <div className="t-foot">
        <span>End of agreement</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.startDate)}</span>
      </div>
    </div>
  );
}

function RetainerMinimal({ data, brand }) {
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">Retainer Agreement</div>
          <div className="t-sub">{fmt.money(data.monthlyFee, data.currency)} / MONTHLY RETAINER</div>
          <div className="t-num">START: {fmt.date(data.startDate)} · TERM: {data.contractDuration || "12 Months"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{brand.studioAddress}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Studio</dt><dd>{data.studioName || brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Monthly Fee</dt><dd style={{ color: "var(--paper-ink)", fontWeight: 700 }}>{fmt.money(data.monthlyFee, data.currency)}</dd></div>
        <div className="t-meta-block"><dt>Due Day</dt><dd>{data.paymentDueDay || "1st of month"}</dd></div>
      </dl>
      <h2>1. Included Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>2. Revision Allocations</h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", lineHeight: 1.6 }}>{data.revisionLimit || "Standard revision cycle applies."}</p>
      <h2>3. Recurring Payment Terms</h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", lineHeight: 1.6 }}>
        The monthly fee of <strong>{fmt.money(data.monthlyFee, data.currency)}</strong> is payable on the {data.paymentDueDay || "1st"} of each month. Invoices carry Net 7 payment terms.
      </p>
      <h2>4. Jurisdiction &amp; Governing Law</h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", lineHeight: 1.6 }}>Governed under the laws of {data.governingLaw || "applicable jurisdiction"}.</p>
      <div className="t-sign-area">
        <div className="t-sign">ACCEPTED FOR STUDIO:<br/><strong>{brand.fullName || "—"}</strong><br/>{brand.studioName}</div>
        <div className="t-sign">ACCEPTED FOR CLIENT:<br/><strong>{data.clientName || "—"}</strong></div>
      </div>
      <div className="t-foot">
        <span>{brand.studioName}</span>
        <span>Monthly Retainer Agreement</span>
        <span>{fmt.date(data.startDate)}</span>
      </div>
    </div>
  );
}

function RetainerExecutive({ data, brand }) {
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">Retainer Agreement</div>
          <div className="t-sub">Executive Ongoing Advisory &amp; Creative Services Agreement</div>
          <div className="t-num">FEE: {fmt.money(data.monthlyFee, data.currency)} / MO · COMMENCEMENT: {fmt.date(data.startDate)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Service Provider</dt><dd>{data.studioName || brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Corporate Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Retainer Amount</dt><dd style={{ color: "var(--accent)", fontSize: "12pt", fontWeight: 700 }}>{fmt.money(data.monthlyFee, data.currency)}</dd></div>
        <div className="t-meta-block"><dt>Engagement Period</dt><dd>{data.contractDuration || "12 Months Ongoing"}</dd></div>
      </dl>
      <h2>Section 1: Retained Scope of Services</h2>
      <DocBody md={data.scope} />
      <h2>Section 2: Service Level &amp; Revision Boundaries</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", lineHeight: 1.65 }}>{data.revisionLimit || "Standard service terms apply per statement of work."}</p>
      <h2>Section 3: Recurring Compensation &amp; Invoicing</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", lineHeight: 1.65 }}>
        A recurring monthly retainer fee of <strong>{fmt.money(data.monthlyFee, data.currency)}</strong> will be invoiced on the {data.paymentDueDay || "1st"} of each calendar month. Payments are due upon receipt or Net 14.
      </p>
      <h2>Section 4: Governing Law &amp; Legal Venue</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", lineHeight: 1.65 }}>This agreement shall be constructed and enforced in accordance with the laws of {data.governingLaw || "the governing jurisdiction"}.</p>
      <div className="t-sign-area">
        <div className="t-sign">{brand.fullName || "—"}<br/>Authorized Signature, {brand.studioName}</div>
        <div className="t-sign">{data.clientName || "—"}<br/>Authorized Client Officer</div>
      </div>
      <div className="t-foot">
        <span>Binding Corporate Retainer Agreement</span>
        <span>{brand.studioName}</span>
        <span>Confidential</span>
      </div>
    </div>
  );
}

export { RetainerClassic, RetainerModern, RetainerEditorial, RetainerMinimal, RetainerExecutive };

