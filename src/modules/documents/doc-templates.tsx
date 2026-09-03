// @ts-nocheck
import { MD, MDInline, fmt } from './utils';
import { getInvoiceCalculations } from './helpers/invoiceCalc';
import { amountToWords } from './helpers/terbilang';

/* ---------- Reusable bits ---------- */
const DocBody = ({ md }) => md ? <div className="doc-body" dangerouslySetInnerHTML={{ __html: MD(md) }} /> : null;

/* Brand name or logo image — used in template headers */
const BrandMark = ({ brand }) => {
  if (brand.logo && brand.logoEnabled !== false) {
    return <img src={brand.logo} alt={brand.studioName || "logo"} style={{ height: 24, width: "auto", maxWidth: 110, objectFit: "contain", display: "block" }} />;
  }
  return <>{brand.studioName || "Studio"}</>;
};
const InlineMd = ({ md, as = "span" }) => {
  const Tag = as;
  return <Tag dangerouslySetInnerHTML={{ __html: MDInline(md || "") }} />;
};

/* ============================================== */
/* =============== AGREEMENT ==================== */
/* ============================================== */

function AgreementClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Services Agreement</div>
        <div className="t-sub">{data.title || "Untitled engagement"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block">
          <dt>Between</dt>
          <dd>{brand.studioName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400 }}>{brand.studioAddress}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>And</dt>
          <dd>{data.clientName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400, whiteSpace: "pre-line" }}>{data.clientAddress}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>Effective date</dt>
          <dd>{fmt.date(data.date)}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Reference</dt>
          <dd>{data.refNo || "—"}</dd>
        </div>
      </dl>
      <h2>1. Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>2. Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>3. Compensation</h2>
      <DocBody md={data.compensation} />
      <h2>4. Timeline</h2>
      <DocBody md={data.timeline} />
      <h2>5. Legal &amp; General Terms</h2>
      <DocBody md={data.legal} />

      <div className="t-foot">
        <div>
          <div className="t-sign">{data.signatoryName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign">{data.clientSignatory || "—"}<br/>{data.clientName}</div>
        </div>
      </div>
    </div>
  );
}

function AgreementModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Services<br/><em>Agreement</em></div>
          <div className="t-num">REF / {data.refNo || "AG-0001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}</div>
          <div className="t-from-meta" style={{ marginTop: 6 }}>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block">
          <dt>Client</dt>
          <dd>{data.clientName || "—"}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Engagement</dt>
          <dd>{data.title || "—"}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Effective</dt>
          <dd>{fmt.date(data.date)}</dd>
        </div>
      </dl>
      <h2>Scope</h2>
      <DocBody md={data.scope} />
      <h2>Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>Compensation</h2>
      <DocBody md={data.compensation} />
      <h2>Timeline</h2>
      <DocBody md={data.timeline} />
      <h2>Legal</h2>
      <DocBody md={data.legal} />

      <div className="t-foot">
        <div>
          <div className="t-sign"></div>
          <div>{data.signatoryName || brand.fullName || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign"></div>
          <div>{data.clientSignatory || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{data.clientName}</div>
        </div>
      </div>
    </div>
  );
}

function AgreementEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>No. {data.refNo || "01"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">An <em>agreement</em></div>
        <div className="t-sub">on the matter of "{data.title || "the engagement"}"</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Between</dt><dd>{brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>And</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Effective</dt><dd>{fmt.dateShort(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Reference</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h3>The Scope</h3><h2>What is being made.</h2>
      <DocBody md={data.scope} />
      <h3>The Deliverables</h3><h2>What will be received.</h2>
      <DocBody md={data.deliverables} />
      <h3>The Compensation</h3><h2>What is owed.</h2>
      <DocBody md={data.compensation} />
      <h3>The Timeline</h3><h2>When it happens.</h2>
      <DocBody md={data.timeline} />
      <h3>The Terms</h3><h2>How we work together.</h2>
      <DocBody md={data.legal} />

      <div className="t-sign-area">
        <div className="t-sign">{data.signatoryName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        <div className="t-sign">{data.clientSignatory || "—"}<br/>{data.clientName}</div>
      </div>
      <div className="t-foot">
        <span>End of document</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* =============== INVOICE ====================== */
/* ============================================== */

function calcInvoice(data) {
  const calcs = getInvoiceCalculations(data);
  return {
    subtotal: calcs.subtotal,
    discount: calcs.discountAmount,
    tax: calcs.taxAmount,
    total: calcs.grandTotal,
  };
}

function InvoiceTable({ data }) {
  return (
    <table className="inv-table">
      <thead>
        <tr>
          <th style={{ width: "55%" }}>Description</th>
          <th style={{ textAlign: "right" }}>Qty</th>
          <th style={{ textAlign: "right" }}>Rate</th>
          <th style={{ textAlign: "right" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {(data.items || []).map((it, i) => (
          <tr key={i}>
            <td><InlineMd md={it.desc} /></td>
            <td style={{ textAlign: "right" }}>{it.qty}</td>
            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{fmt.money(it.rate, data.currency)}</td>
            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{fmt.money((Number(it.qty)||0)*(Number(it.rate)||0), data.currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InvoiceTotals({ data }) {
  const { subtotal, taxAmount, discountAmount, grandTotal } = getInvoiceCalculations(data);
  const taxEffect = data.taxEffect || 'add';
  const taxLabel = data.taxPreset === 'ppn_11'
    ? 'PPN (11%)'
    : data.taxPreset === 'ppn_12'
    ? 'PPN (12%)'
    : `Tax (${data.taxPct || 0}%)`;
  const words = data.showTerbilang !== false && grandTotal > 0 ? amountToWords(grandTotal, data.currency) : null;

  return (
    <div className="inv-totals">
      <div className="inv-totals-row">
        <span>Subtotal</span>
        <span style={{ whiteSpace: "nowrap", textAlign: "right" }}>{fmt.money(subtotal, data.currency)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="inv-totals-row">
          <span>Discount ({data.discountPct}%)</span>
          <span style={{ whiteSpace: "nowrap", textAlign: "right" }}>−{fmt.money(discountAmount, data.currency)}</span>
        </div>
      )}
      {taxAmount > 0 && (
        <div className="inv-totals-row">
          <span>{taxLabel}</span>
          <span style={{ whiteSpace: "nowrap", textAlign: "right" }}>{taxEffect === 'deduct' ? '−' : '+'}{fmt.money(taxAmount, data.currency)}</span>
        </div>
      )}
      <div className="inv-totals-row inv-totals-row--final">
        <span>Total due</span>
        <span style={{ whiteSpace: "nowrap", textAlign: "right" }}>{fmt.money(grandTotal, data.currency)}</span>
      </div>
      {words && (
        <div className="inv-totals-words" style={{ fontStyle: 'italic', fontSize: '8.5pt', color: 'var(--paper-muted)', marginTop: 8, textAlign: 'right' }}>
          Terbilang: {words}
        </div>
      )}
    </div>
  );
}

function InvoiceClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Invoice</div>
        <div className="t-sub">{data.invoiceNo || "INV-0001"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block">
          <dt>Bill from</dt>
          <dd>{brand.studioName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400, whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>Bill to</dt>
          <dd>{data.clientName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400, whiteSpace: "pre-line" }}>{data.clientAddress}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>Issued</dt>
          <dd>{fmt.date(data.issuedAt)}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Due</dt>
          <dd>{fmt.date(data.dueAt)}</dd>
        </div>
      </dl>
      <h2>Statement of charges</h2>
      <InvoiceTable data={data} />
      <InvoiceTotals data={data} />
      {data.notes && (<><h2>Payment</h2><DocBody md={data.notes} /></>)}
      <div style={{ marginTop: 40, fontSize: "9pt", color: "var(--paper-muted)", textAlign: "center", borderTop: "1px solid var(--paper-rule)", paddingTop: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Thank you for your business
      </div>
    </div>
  );
}

function InvoiceModern({ data, brand }) {
  const { total } = calcInvoice(data);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype"><em>Invoice</em></div>
          <div className="t-num">{data.invoiceNo || "INV-0001"} · {data.projectRef || ""}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}</div>
          <div className="t-from-meta" style={{ marginTop: 6 }}>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Billed to</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Issued</dt><dd>{fmt.dateShort(data.issuedAt)}</dd></div>
        <div className="t-meta-block"><dt>Due</dt><dd>{fmt.dateShort(data.dueAt)}</dd></div>
      </dl>
      <InvoiceTable data={data} />
      <InvoiceTotals data={data} />
      {data.notes && (<><h2>Payment</h2><DocBody md={data.notes} /></>)}
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Pay to</div>
          <div style={{ marginTop: 4, fontSize: "10pt", whiteSpace: "pre-line" }}>{brand.payment || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Questions</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.email}</div>
        </div>
      </div>
    </div>
  );
}

function InvoiceEditorial({ data, brand }) {
  const { total } = calcInvoice(data);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>{data.invoiceNo || "INV-0001"}</span>
        <span>{fmt.dateShort(data.issuedAt)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">An <em>invoice</em></div>
        <div className="t-sub">for services rendered to {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Billed to</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Issued</dt><dd>{fmt.dateShort(data.issuedAt)}</dd></div>
        <div className="t-meta-block"><dt>Due by</dt><dd>{fmt.dateShort(data.dueAt)}</dd></div>
        <div className="t-meta-block"><dt>Total due</dt><dd style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "14pt" }}>{fmt.money(total, data.currency)}</dd></div>
      </dl>
      <h3>The work</h3><h2>What was done.</h2>
      <InvoiceTable data={data} />
      <InvoiceTotals data={data} />
      {data.notes && (<><h3>Payment</h3><h2>How to pay.</h2><DocBody md={data.notes} /></>)}
      <div className="t-foot">
        <span>End of invoice</span>
        <span>{brand.studioName}</span>
        <span>{data.invoiceNo}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* =============== PROPOSAL ===================== */
/* ============================================== */

function ProposalClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}><BrandMark brand={brand} /></div>
        <div className="t-doctype">Proposal</div>
        <div className="t-sub">{data.title || "Untitled proposal"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Prepared for</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Prepared by</dt><dd>{brand.fullName || brand.studioName}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Reference</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>1. Executive Summary</h2><DocBody md={data.summary} />
      <h2>2. Understanding the brief</h2><DocBody md={data.understanding} />
      <h2>3. Approach</h2><DocBody md={data.approach} />
      <h2>4. Deliverables</h2><DocBody md={data.deliverables} />
      <h2>5. Timeline</h2><DocBody md={data.timeline} />
      <h2>6. Investment</h2><DocBody md={data.investment} />
      <h2>7. About</h2><DocBody md={data.about} />
    </div>
  );
}

function ProposalModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 18 }}>A proposal</div>
          <div className="t-doctype" style={{ fontSize: "36pt" }}><em>{data.title || "Proposal"}</em></div>
          <div className="t-num">For {data.clientName || "—"} · {fmt.dateShort(data.date)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.fullName}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Engagement</dt><dd>{data.title || "—"}</dd></div>
        <div className="t-meta-block"><dt>Ref.</dt><dd>{data.refNo || "—"}</dd></div>
        <div className="t-meta-block"><dt>Valid until</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h2>Summary</h2><DocBody md={data.summary} />
      <h2>The brief</h2><DocBody md={data.understanding} />
      <h2>Approach</h2><DocBody md={data.approach} />
      <h2>Deliverables</h2><DocBody md={data.deliverables} />
      <h2>Timeline</h2><DocBody md={data.timeline} />
      <h2>Investment</h2><DocBody md={data.investment} />
      <h2>About us</h2><DocBody md={data.about} />
    </div>
  );
}

function ProposalEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Proposal · No. {data.refNo || "01"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>{data.title || "A proposal"}</em></div>
        <div className="t-sub">prepared for the kind attention of {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Prepared for</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>From the desk of</dt><dd>{brand.fullName}</dd></div>
        <div className="t-meta-block"><dt>Studio</dt><dd>{brand.studioName}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h3>Chapter One</h3><h2>The summary.</h2><DocBody md={data.summary} />
      <h3>Chapter Two</h3><h2>What we heard.</h2><DocBody md={data.understanding} />
      <h3>Chapter Three</h3><h2>How we'll work.</h2><DocBody md={data.approach} />
      <h3>Chapter Four</h3><h2>What you'll receive.</h2><DocBody md={data.deliverables} />
      <h3>Chapter Five</h3><h2>When it happens.</h2><DocBody md={data.timeline} />
      <h3>Chapter Six</h3><h2>The investment.</h2><DocBody md={data.investment} />
      <h3>Chapter Seven</h3><h2>About the studio.</h2><DocBody md={data.about} />
      <div className="t-foot">
        <span>End of proposal</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* =============== PRD ========================== */
/* ============================================== */

function PRDStats({ data }) {
  return (
    <dl className="prd-stat-grid">
      <div className="prd-stat"><dt>Author</dt><dd>{data.author || "—"}</dd></div>
      <div className="prd-stat"><dt>Status</dt><dd>{data.status || "Draft"}</dd></div>
      <div className="prd-stat"><dt>Target</dt><dd>{data.release || "—"}</dd></div>
    </dl>
  );
}

function PRDClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>Product Requirements</div>
        <div className="t-doctype">{data.title || "Untitled"}</div>
        <div className="t-sub">{data.tagline}</div>
      </div>
      <PRDStats data={data} />
      <h2>1. Problem</h2><DocBody md={data.problem} />
      <h2>2. Goals &amp; non-goals</h2><DocBody md={data.goals} />
      <h2>3. User stories</h2><DocBody md={data.stories} />
      <h2>4. Solution</h2><DocBody md={data.solution} />
      <h2>5. Success metrics</h2><DocBody md={data.metrics} />
      <h2>6. Risks &amp; open questions</h2><DocBody md={data.risks} />
    </div>
  );
}

function PRDModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 12 }}>PRD · {data.status || "Draft"}</div>
          <div className="t-doctype" style={{ fontSize: "40pt" }}>{data.title || "Untitled"}</div>
          <div className="t-num" style={{ fontSize: "11pt", marginTop: 8, color: "var(--paper-ink)" }}>{data.tagline}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from">{data.author || brand.fullName}</div>
          <div className="t-from-meta">Updated {fmt.dateShort(data.date)}</div>
          <div className="t-from-meta">Target {data.release}</div>
        </div>
      </div>
      <h2>Problem</h2><DocBody md={data.problem} />
      <h2>Goals</h2><DocBody md={data.goals} />
      <h2>User stories</h2><DocBody md={data.stories} />
      <h2>Solution</h2><DocBody md={data.solution} />
      <h2>Success metrics</h2><DocBody md={data.metrics} />
      <h2>Risks</h2><DocBody md={data.risks} />
    </div>
  );
}

function PRDEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span>Product Requirements</span>
        <span>{data.status || "Draft"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>{data.title || "Untitled"}</em></div>
        <div className="t-sub">{data.tagline}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Author</dt><dd>{data.author || "—"}</dd></div>
        <div className="t-meta-block"><dt>Status</dt><dd>{data.status || "Draft"}</dd></div>
        <div className="t-meta-block"><dt>Target</dt><dd>{data.release || "—"}</dd></div>
        <div className="t-meta-block"><dt>Updated</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h3>Section One</h3><h2>The problem.</h2><DocBody md={data.problem} />
      <h3>Section Two</h3><h2>Goals &amp; non-goals.</h2><DocBody md={data.goals} />
      <h3>Section Three</h3><h2>User stories.</h2><DocBody md={data.stories} />
      <h3>Section Four</h3><h2>The solution.</h2><DocBody md={data.solution} />
      <h3>Section Five</h3><h2>How we measure success.</h2><DocBody md={data.metrics} />
      <h3>Section Six</h3><h2>Risks &amp; questions.</h2><DocBody md={data.risks} />
      <div className="t-foot">
        <span>End of document</span>
        <span>{data.author || brand.fullName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}

/* ---------- Shared helpers for new templates ---------- */
const parseLines = (str) => (str || "").split("\n").filter(l => l.trim());

const CheckRow = ({ text }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid var(--paper-rule)" }}>
    <div style={{ width: 16, height: 16, border: "1.5px solid var(--paper-ink)", borderRadius: 3, flexShrink: 0, marginTop: "0.2em" }}></div>
    <span style={{ fontSize: "10.5pt", fontFamily: "var(--font-serif)", lineHeight: 1.5 }}>{text}</span>
  </div>
);

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

/* ============================================== */
/* =============== RECEIPT ====================== */
/* ============================================== */

function ReceiptClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Payment Receipt</div>
        <div className="t-sub">{data.receiptNo || "REC-0001"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Received from</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Received by</dt><dd>{brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.date(data.paymentDate)}</dd></div>
        <div className="t-meta-block"><dt>Method</dt><dd>{data.paymentMethod || "—"}</dd></div>
      </dl>
      <h2>Payment details</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "8pt", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--paper-muted)", paddingBottom: 8, borderBottom: "1px solid var(--paper-rule)" }}>Description</th>
            <th style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "8pt", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--paper-muted)", paddingBottom: 8, borderBottom: "1px solid var(--paper-rule)" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ paddingTop: 12, fontSize: "11pt", fontFamily: "var(--font-serif)", lineHeight: 1.5 }}>{data.itemDescription || "—"}</td>
            <td style={{ paddingTop: 12, fontSize: "11pt", fontFamily: "var(--font-serif)", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt.money(data.amount, data.currency)}</td>
          </tr>
        </tbody>
      </table>
      <div className="inv-totals">
        <div className="inv-totals-row inv-totals-row--final"><span>Amount received</span><span style={{ whiteSpace: "nowrap", textAlign: "right" }}>{fmt.money(data.amount, data.currency)}</span></div>
      </div>
      {data.notes && (<><h2>Notes</h2><DocBody md={data.notes} /></>)}
      <div style={{ marginTop: 40, fontSize: "9pt", color: "var(--paper-muted)", textAlign: "center", borderTop: "1px solid var(--paper-rule)", paddingTop: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        This receipt confirms payment received in full · {brand.studioName}
      </div>
    </div>
  );
}

function ReceiptModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype"><em>Receipt</em></div>
          <div className="t-num">{data.receiptNo || "REC-0001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}</div>
          <div className="t-from-meta" style={{ marginTop: 6 }}>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>From</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.paymentDate)}</dd></div>
        <div className="t-meta-block"><dt>Method</dt><dd>{data.paymentMethod || "—"}</dd></div>
      </dl>
      <div style={{ margin: "28px 0", padding: "24px 28px", background: "var(--paper-rule)", borderRadius: 4 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)", marginBottom: 10, lineHeight: 1.5 }}>{data.itemDescription || "—"}</div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "28pt", color: "var(--paper-ink)" }}>{fmt.money(data.amount, data.currency)}</div>
      </div>
      {data.notes && (<><h2>Notes</h2><DocBody md={data.notes} /></>)}
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Received by</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.studioName} · {brand.email}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Receipt no.</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{data.receiptNo || "REC-0001"}</div>
        </div>
      </div>
    </div>
  );
}

function ReceiptEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>{data.receiptNo || "REC-0001"}</span>
        <span>{fmt.dateShort(data.paymentDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>receipt</em></div>
        <div className="t-sub">for payment received from {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Received from</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.paymentDate)}</dd></div>
        <div className="t-meta-block"><dt>Method</dt><dd>{data.paymentMethod || "—"}</dd></div>
        <div className="t-meta-block"><dt>Amount</dt><dd style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "14pt" }}>{fmt.money(data.amount, data.currency)}</dd></div>
      </dl>
      <h3>The payment</h3><h2>What was received.</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>{data.itemDescription || "—"}</p>
      {data.notes && (<><h3>Notes</h3><h2>Additional context.</h2><DocBody md={data.notes} /></>)}
      <div className="t-foot">
        <span>End of receipt</span>
        <span>{brand.studioName}</span>
        <span>{data.receiptNo || "REC-0001"}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* ============= ONBOARDING ==================== */
/* ============================================== */

function OnboardingClassic({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Client Onboarding</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Start date</dt><dd>{fmt.date(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <h2>1. Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No deliverables listed.</p>}
      </div>
      <h2>2. Assets needed from client</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.length ? assets.map((a, i) => <CheckRow key={i} text={a} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No assets listed.</p>}
      </div>
      <h2>3. Communication</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
      </dl>
      <div style={{ marginTop: 40, borderTop: "1px solid var(--paper-rule)", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: "9pt", color: "var(--paper-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
        {brand.studioName} · {brand.email}
      </div>
    </div>
  );
}

function OnboardingModern({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Client<br/><em>Onboarding</em></div>
          <div className="t-num">{data.projectName || "Project"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.clientName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{fmt.dateShort(data.startDate)}</div>
        </div>
      </div>
      <h2>Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h2>Assets needed from you</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.map((a, i) => <CheckRow key={i} text={a} />)}
      </div>
      <h2>Communication</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Studio</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.studioName} · {brand.email}</div>
        </div>
      </div>
    </div>
  );
}

function OnboardingEditorial({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Onboarding</span>
        <span>{fmt.dateShort(data.startDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>Getting started.</em></div>
        <div className="t-sub">A guide for {data.clientName || "the client"} on the {data.projectName || "project"} project.</div>
      </div>
      <h3>What we'll make</h3><h2>Deliverables.</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h3>What we need from you</h3><h2>Assets needed.</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.map((a, i) => <CheckRow key={i} text={a} />)}
      </div>
      <h3>How we work</h3><h2>Communication.</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Point of contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <span>Start: {fmt.dateShort(data.startDate)}</span>
        <span>{brand.studioName}</span>
        <span>{data.clientName || "—"}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* ============= SCOPE GUARD =================== */
/* ============================================== */

function ScopeGuardClassic({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Revision Policy</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Included rounds</dt><dd><strong>{data.includedRevisions || "2"}</strong> revision rounds</dd></div>
        <div className="t-meta-block"><dt>Additional rate</dt><dd>{fmt.money(data.additionalRevisionRate, data.currency)} / round</dd></div>
      </dl>
      <h2>1. What counts as a revision</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>2. What is out of scope</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>3. Additional revisions</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        Revisions beyond the included {data.includedRevisions || "2"} rounds are billed at {fmt.money(data.additionalRevisionRate, data.currency)} per round, invoiced separately.
      </p>
      <div style={{ marginTop: 40, borderTop: "1px solid var(--paper-rule)", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: "9pt", color: "var(--paper-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
        {brand.studioName} · {brand.email}
      </div>
    </div>
  );
}

function ScopeGuardModern({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Revision<br/><em>Policy</em></div>
          <div className="t-num">{data.includedRevisions || "2"} rounds included</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.projectName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{data.clientName || "—"}</div>
        </div>
      </div>
      <h2>What counts as a revision</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>Out of scope</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>Additional revisions</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.additionalRevisionRate, data.currency)} per additional round, invoiced separately.
      </p>
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Studio</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.studioName} · {brand.email}</div>
        </div>
      </div>
    </div>
  );
}

function ScopeGuardEditorial({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Scope Guard</span>
        <span>{data.projectName || "—"}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>revision policy.</em></div>
        <div className="t-sub">for {data.clientName || "the client"} — {data.includedRevisions || "2"} rounds included.</div>
      </div>
      <h3>What's in</h3><h2>What counts.</h2>
      <DocBody md={data.whatIsRevision} />
      <h3>What's out</h3><h2>What isn't covered.</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h3>Extra rounds</h3><h2>The rate.</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.additionalRevisionRate, data.currency)} per additional round, invoiced separately.
      </p>
      <div className="t-foot">
        <span>End of document</span>
        <span>{brand.studioName}</span>
        <span>{data.projectName || "—"}</span>
      </div>
    </div>
  );
}

/* ============================================== */
/* =============== HANDOVER ==================== */
/* ============================================== */

function HandoverClassic({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Project Handover</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Handover date</dt><dd>{fmt.date(data.handoverDate)}</dd></div>
        <div className="t-meta-block"><dt>Signed off by</dt><dd>{data.studioSignOffName || brand.fullName || "—"}</dd></div>
      </dl>
      <h2>1. Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No deliverables listed.</p>}
      </div>
      <h2>2. File locations</h2>
      <DocBody md={data.fileLocations} />
      <h2>3. Credentials handed over</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h2>4. Next steps for client</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.length ? nextSteps.map((s, i) => <CheckRow key={i} text={s} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No steps listed.</p>}
      </div>
      <div className="t-foot">
        <div><div className="t-sign">{data.studioSignOffName || brand.fullName || "—"}<br/>{brand.studioName}</div></div>
        <div><div className="t-sign">{data.clientName || "—"}</div></div>
      </div>
    </div>
  );
}

function HandoverModern({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Project<br/><em>Handover</em></div>
          <div className="t-num">{data.projectName || "Project"} · {fmt.dateShort(data.handoverDate)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.clientName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{brand.email}</div>
        </div>
      </div>
      <h2>Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h2>File locations</h2>
      <DocBody md={data.fileLocations} />
      <h2>Credentials</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h2>Next steps for client</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.map((s, i) => <CheckRow key={i} text={s} />)}
      </div>
      <div className="t-foot">
        <div>
          <div className="t-sign"></div>
          <div>{data.studioSignOffName || brand.fullName || "—"}</div>
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

function HandoverEditorial({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Handover</span>
        <span>{fmt.dateShort(data.handoverDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>handover.</em></div>
        <div className="t-sub">from {brand.studioName || "Studio"} to {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.handoverDate)}</dd></div>
        <div className="t-meta-block"><dt>Signed off</dt><dd>{data.studioSignOffName || brand.fullName || "—"}</dd></div>
      </dl>
      <h3>What you're getting</h3><h2>Deliverables.</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h3>Where it lives</h3><h2>Files.</h2>
      <DocBody md={data.fileLocations} />
      <h3>Access</h3><h2>Credentials.</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h3>What's next</h3><h2>Next steps.</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.map((s, i) => <CheckRow key={i} text={s} />)}
      </div>
      <div className="t-sign-area">
        <div className="t-sign">{data.studioSignOffName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        <div className="t-sign">{data.clientName || "—"}</div>
      </div>
      <div className="t-foot">
        <span>End of handover</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.handoverDate)}</span>
      </div>
    </div>
  );
}

const DocTemplates = {
  agreement:  { classic: AgreementClassic,  modern: AgreementModern,  editorial: AgreementEditorial },
  invoice:    { classic: InvoiceClassic,    modern: InvoiceModern,    editorial: InvoiceEditorial },
  proposal:   { classic: ProposalClassic,   modern: ProposalModern,   editorial: ProposalEditorial },
  prd:        { classic: PRDClassic,        modern: PRDModern,        editorial: PRDEditorial },
  retainer:   { classic: RetainerClassic,   modern: RetainerModern,   editorial: RetainerEditorial },
  receipt:    { classic: ReceiptClassic,    modern: ReceiptModern,    editorial: ReceiptEditorial },
  onboarding: { classic: OnboardingClassic, modern: OnboardingModern, editorial: OnboardingEditorial },
  scopeguard: { classic: ScopeGuardClassic, modern: ScopeGuardModern, editorial: ScopeGuardEditorial },
  handover:   { classic: HandoverClassic,   modern: HandoverModern,   editorial: HandoverEditorial },
};


export { DocTemplates };
