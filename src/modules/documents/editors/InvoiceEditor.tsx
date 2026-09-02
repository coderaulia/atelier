import { Field, TextInput, Textarea, SectionTitle } from '../utils';
import { calcLineTotal, getInvoiceCalculations, TAX_PRESETS, type TaxPreset, type TaxEffect } from '../helpers/invoiceCalc';
import { amountToWords } from '../helpers/terbilang';

export function InvoiceEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });

  const setItem = (i: number, k: string, v: any) => {
    const items = [...(data.items || [])];
    items[i] = { ...items[i], [k]: v };
    set("items", items);
  };

  const addItem = () => set("items", [...(data.items || []), { desc: "", qty: 1, rate: 0 }]);
  const delItem = (i: number) => set("items", (data.items || []).filter((_: any, j: number) => j !== i));

  const calcs = getInvoiceCalculations(data);
  const taxPreset: TaxPreset = data.taxPreset || (data.taxPct === 11 ? 'ppn_11' : data.taxPct === 12 ? 'ppn_12' : data.taxPct > 0 ? 'custom' : 'none');
  const taxEffect: TaxEffect = data.taxEffect || 'add';

  const handleTaxPresetChange = (preset: TaxPreset) => {
    if (preset === 'none') {
      onChange({ ...data, taxPreset: 'none', taxPct: 0 });
    } else if (preset === 'ppn_11') {
      onChange({ ...data, taxPreset: 'ppn_11', taxPct: 11 });
    } else if (preset === 'ppn_12') {
      onChange({ ...data, taxPreset: 'ppn_12', taxPct: 12 });
    } else {
      onChange({ ...data, taxPreset: 'custom' });
    }
  };

  const words = amountToWords(calcs.grandTotal, data.currency || 'USD');

  return (
    <>
      <SectionTitle>Invoice header</SectionTitle>
      <Field label="Bill to (client name)">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={(v: any) => set("clientAddress", v)} rows={3} />
      </Field>
      <div className="field__row">
        <Field label="Invoice no.">
          <TextInput value={data.invoiceNo} onChange={(v: any) => set("invoiceNo", v)} placeholder="INV-2026-014" />
        </Field>
        <Field label="Project ref">
          <TextInput value={data.projectRef} onChange={(v: any) => set("projectRef", v)} />
        </Field>
      </div>
      <div className="field__row">
        <Field label="Issued">
          <TextInput type="date" value={data.issuedAt} onChange={(v: any) => set("issuedAt", v)} />
        </Field>
        <Field label="Due">
          <TextInput type="date" value={data.dueAt} onChange={(v: any) => set("dueAt", v)} />
        </Field>
      </div>
      <Field label="Currency">
        <select className="field__select" value={data.currency || 'USD'} onChange={(e: any) => set("currency", e.target.value)}>
          <option value="USD">USD ($)</option>
          <option value="IDR">IDR (Rp)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="SGD">SGD ($)</option>
          <option value="AUD">AUD ($)</option>
          <option value="CAD">CAD ($)</option>
          <option value="JPY">JPY (¥)</option>
        </select>
      </Field>

      <SectionTitle>Line items</SectionTitle>
      <div className="lineitems">
        {(data.items || []).map((it: any, i: number) => {
          const lineTotal = calcLineTotal(it.qty, it.rate);
          return (
            <div className="lineitem" key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 90px 28px', gap: 6, alignItems: 'center' }}>
              <input
                className="field__input"
                value={it.desc}
                placeholder="Description"
                onChange={(e: any) => setItem(i, "desc", e.target.value)}
              />
              <input
                className="field__input"
                type="number"
                value={it.qty}
                placeholder="Qty"
                onChange={(e: any) => setItem(i, "qty", e.target.value)}
              />
              <input
                className="field__input"
                type="number"
                value={it.rate}
                placeholder="Rate"
                onChange={(e: any) => setItem(i, "rate", e.target.value)}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right', color: 'var(--shell-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lineTotal.toLocaleString()}
              </div>
              <button
                className="lineitem__del"
                type="button"
                onClick={() => delItem(i)}
                title="Remove item"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14h10l1-14"/>
                </svg>
              </button>
            </div>
          );
        })}
        <button className="btn-add" type="button" onClick={addItem}>+ Add line item</button>
      </div>

      <SectionTitle>Tax &amp; Adjustments</SectionTitle>
      <div style={{ background: 'var(--shell-bg)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--shell-rule)', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: 'var(--shell-muted)' }}>Subtotal:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{calcs.subtotal.toLocaleString()} {data.currency || 'USD'}</span>
        </div>

        <div className="field__row" style={{ marginTop: 8 }}>
          <Field label="Jenis Pajak">
            <select
              className="field__select"
              value={taxPreset}
              onChange={(e: any) => handleTaxPresetChange(e.target.value)}
            >
              {TAX_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Efek Pajak">
            <select
              className="field__select"
              value={taxEffect}
              onChange={(e: any) => set("taxEffect", e.target.value)}
            >
              <option value="add">(+) Menambah Total</option>
              <option value="deduct">(−) Memotong (PPh)</option>
            </select>
          </Field>
        </div>

        {taxPreset === 'custom' && (
          <Field label="Tarif Pajak Kustom (%)">
            <TextInput
              type="number"
              value={data.taxPct}
              onChange={(v: any) => set("taxPct", v)}
              placeholder="0"
            />
          </Field>
        )}

        <div className="field__row" style={{ marginTop: 8 }}>
          <Field label="Discount %">
            <TextInput
              type="number"
              value={data.discountPct}
              onChange={(v: any) => set("discountPct", v)}
              placeholder="0"
            />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--shell-muted)', marginBottom: 4 }}>Potongan:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'hsl(155 86% 58%)' }}>
              {calcs.discountAmount > 0 ? `−${calcs.discountAmount.toLocaleString()}` : '0'}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--shell-rule)', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--shell-ink)' }}>Grand Total:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#5a8fc7' }}>
            {calcs.grandTotal.toLocaleString()} {data.currency || 'USD'}
          </span>
        </div>

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--shell-rule)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--shell-muted)' }}>
            <input
              type="checkbox"
              checked={data.showTerbilang !== false}
              onChange={(e: any) => set("showTerbilang", e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span>Tampilkan Kalimat Terbilang pada Dokumen</span>
          </label>
          {data.showTerbilang !== false && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--shell-muted)', fontStyle: 'italic', background: 'rgba(148, 163, 184, 0.05)', padding: '6px 8px', borderRadius: 4 }}>
              <strong>Terbilang:</strong> {words}
            </div>
          )}
        </div>
      </div>

      <SectionTitle>Notes</SectionTitle>
      <Field label="Payment notes (markdown)">
        <Textarea value={data.notes} onChange={(v: any) => set("notes", v)} />
      </Field>
    </>
  );
}
