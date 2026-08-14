import { useState } from 'react';
import { fmt, Field, TextInput, SectionTitle } from './utils';

export function QuoteCalculatorPanel({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const [copied, setCopied] = useState(false);

  const hours    = Number(data.hours)       || 0;
  const rate     = Number(data.hourlyRate)  || 0;
  const disc     = Number(data.discountPct) || 0;
  const tax      = Number(data.taxPct)      || 0;
  const currency = data.currency || "USD";

  const subtotal    = hours * rate;
  const discountAmt = subtotal * disc / 100;
  const taxBase     = subtotal - discountAmt;
  const taxAmt      = taxBase * tax / 100;
  const total       = taxBase + taxAmt;

  const copyAsText = () => {
    const lines = [
      `Quote: ${data.serviceDescription || "Service"}`,
      `${hours} hrs × ${fmt.money(rate, currency)}/hr`,
      `Subtotal: ${fmt.money(subtotal, currency)}`,
      disc > 0 ? `Discount (${disc}%): −${fmt.money(discountAmt, currency)}` : null,
      tax > 0  ? `Tax (${tax}%): ${fmt.money(taxAmt, currency)}` : null,
      `Total: ${fmt.money(total, currency)}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines as string).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <>
      <SectionTitle>Service</SectionTitle>
      <Field label="Service description">
        <TextInput value={data.serviceDescription} onChange={(v: any) => set("serviceDescription", v)} placeholder="Brand Identity Design" />
      </Field>
      <Field label="Currency">
        <select className="field__select" value={currency} onChange={(e: any) => set("currency", e.target.value)}>
          <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
        </select>
      </Field>

      <SectionTitle>Pricing</SectionTitle>
      <div className="field__row">
        <Field label="Hours">
          <TextInput type="number" value={data.hours} onChange={(v: any) => set("hours", v)} placeholder="40" />
        </Field>
        <Field label={`Rate per hour (${currency})`}>
          <TextInput type="number" value={data.hourlyRate} onChange={(v: any) => set("hourlyRate", v)} placeholder="180" />
        </Field>
      </div>

      <SectionTitle>Adjustments</SectionTitle>
      <div className="field__row">
        <Field label="Discount %">
          <TextInput type="number" value={data.discountPct} onChange={(v: any) => set("discountPct", v)} placeholder="0" />
        </Field>
        <Field label="Tax %">
          <TextInput type="number" value={data.taxPct} onChange={(v: any) => set("taxPct", v)} placeholder="0" />
        </Field>
      </div>

      <SectionTitle>Result</SectionTitle>
      <div className="quote-calc-result">
        <div className="quote-calc-row">
          <span>{hours} hrs × {fmt.money(rate, currency)}</span>
          <span>{fmt.money(subtotal, currency)}</span>
        </div>
        {disc > 0 && (
          <div className="quote-calc-row">
            <span>Discount ({disc}%)</span>
            <span>−{fmt.money(discountAmt, currency)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="quote-calc-row">
            <span>Tax ({tax}%)</span>
            <span>{fmt.money(taxAmt, currency)}</span>
          </div>
        )}
        <div className="quote-calc-row quote-calc-row--total">
          <span>Total</span>
          <span>{fmt.money(total, currency)}</span>
        </div>
        <button className="quote-calc-copy" onClick={copyAsText}>
          {copied ? "Copied!" : "Copy as text"}
        </button>
      </div>
    </>
  );
}

export function QuotePreview({ data }: any) {
  const hours    = Number(data.hours)       || 0;
  const rate     = Number(data.hourlyRate)  || 0;
  const disc     = Number(data.discountPct) || 0;
  const tax      = Number(data.taxPct)      || 0;
  const currency = data.currency || "USD";

  const subtotal    = hours * rate;
  const discountAmt = subtotal * disc / 100;
  const taxBase     = subtotal - discountAmt;
  const taxAmt      = taxBase * tax / 100;
  const total       = taxBase + taxAmt;

  return (
    <div className="quote-preview">
      <div className="quote-preview__label">Quick Quote</div>
      <div className="quote-preview__service">{data.serviceDescription || "—"}</div>
      <div className="quote-preview__rows">
        <div className="quote-preview__row">
          <span>{hours} hrs × {fmt.money(rate, currency)}</span>
          <span>{fmt.money(subtotal, currency)}</span>
        </div>
        {disc > 0 && (
          <div className="quote-preview__row">
            <span>Discount ({disc}%)</span>
            <span>−{fmt.money(discountAmt, currency)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="quote-preview__row">
            <span>Tax ({tax}%)</span>
            <span>{fmt.money(taxAmt, currency)}</span>
          </div>
        )}
        <div className="quote-preview__row quote-preview__row--total">
          <span>Total</span>
          <span>{fmt.money(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
