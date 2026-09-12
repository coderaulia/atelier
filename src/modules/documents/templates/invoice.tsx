// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
import { getInvoiceCalculations } from '../helpers/invoiceCalc';
import { amountToWords } from '../helpers/terbilang';
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


export { InvoiceClassic, InvoiceModern, InvoiceEditorial };
