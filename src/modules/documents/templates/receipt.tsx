// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
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


export { ReceiptClassic, ReceiptModern, ReceiptEditorial };
