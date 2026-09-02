import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function ReceiptEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Receipt details</SectionTitle>
      <div className="field__row">
        <Field label="Receipt no.">
          <TextInput value={data.receiptNo} onChange={(v: any) => set("receiptNo", v)} placeholder="REC-2026-001" />
        </Field>
        <Field label="Payment date">
          <TextInput type="date" value={data.paymentDate} onChange={(v: any) => set("paymentDate", v)} />
        </Field>
      </div>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Item description">
        <TextInput value={data.itemDescription} onChange={(v: any) => set("itemDescription", v)} placeholder="Brand identity — Phase 01 deposit" />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Amount">
          <TextInput type="number" value={data.amount} onChange={(v: any) => set("amount", v)} placeholder="9600" />
        </Field>
      </div>
      <Field label="Payment method">
        <TextInput value={data.paymentMethod} onChange={(v: any) => set("paymentMethod", v)} placeholder="Bank transfer / Wise" />
      </Field>

      <SectionTitle>Notes</SectionTitle>
      <Field label="Notes (markdown)">
        <Textarea value={data.notes} onChange={(v: any) => set("notes", v)} />
      </Field>
    </>
  );
}
