// Document templates: Agreement, Invoice, Proposal, PRD
// Each has 3 variants: Classic, Modern, Editorial
// Exports: DocTemplates = { agreement: {classic, modern, editorial}, ... }

/* ---------- Reusable bits ---------- */
const DocBody = ({ md }) => md ? <div className="doc-body" dangerouslySetInnerHTML={{ __html: MD(md) }} /> : null;
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
          {brand.studioName || "Studio"}
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
          <div className="t-from">{brand.studioName || "Studio"}</div>
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
        <span>{brand.studioName || "Studio"}</span>
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
  const subtotal = (data.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const discount = subtotal * (Number(data.discountPct) || 0) / 100;
  const taxBase = subtotal - discount;
  const tax = taxBase * (Number(data.taxPct) || 0) / 100;
  const total = taxBase + tax;
  return { subtotal, discount, tax, total };
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
            <td style={{ textAlign: "right" }}>{fmt.money(it.rate, data.currency)}</td>
            <td style={{ textAlign: "right" }}>{fmt.money((Number(it.qty)||0)*(Number(it.rate)||0), data.currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InvoiceTotals({ data }) {
  const { subtotal, discount, tax, total } = calcInvoice(data);
  return (
    <div className="inv-totals">
      <div className="inv-totals-row"><span>Subtotal</span><span>{fmt.money(subtotal, data.currency)}</span></div>
      {discount > 0 && <div className="inv-totals-row"><span>Discount ({data.discountPct}%)</span><span>−{fmt.money(discount, data.currency)}</span></div>}
      {tax > 0 && <div className="inv-totals-row"><span>Tax ({data.taxPct}%)</span><span>{fmt.money(tax, data.currency)}</span></div>}
      <div className="inv-totals-row inv-totals-row--final"><span>Total due</span><span>{fmt.money(total, data.currency)}</span></div>
    </div>
  );
}

function InvoiceClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          {brand.studioName || "Studio"}
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
          <div className="t-from">{brand.studioName}</div>
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
        <span>{brand.studioName || "Studio"}</span>
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
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>{brand.studioName}</div>
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
          <div className="t-from">{brand.studioName}</div>
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
        <span>{brand.studioName}</span>
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

const DocTemplates = {
  agreement: { classic: AgreementClassic, modern: AgreementModern, editorial: AgreementEditorial },
  invoice:   { classic: InvoiceClassic,   modern: InvoiceModern,   editorial: InvoiceEditorial },
  proposal:  { classic: ProposalClassic,  modern: ProposalModern,  editorial: ProposalEditorial },
  prd:       { classic: PRDClassic,       modern: PRDModern,       editorial: PRDEditorial },
};

Object.assign(window, { DocTemplates });
