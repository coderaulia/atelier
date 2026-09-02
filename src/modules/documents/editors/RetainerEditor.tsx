import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function RetainerEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Parties</SectionTitle>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Studio name">
        <TextInput value={data.studioName} onChange={(v: any) => set("studioName", v)} placeholder="North & Quill" />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Monthly fee">
          <TextInput type="number" value={data.monthlyFee} onChange={(v: any) => set("monthlyFee", v)} placeholder="4500" />
        </Field>
      </div>

      <SectionTitle>Terms</SectionTitle>
      <Field label="Scope of work (markdown)">
        <Textarea value={data.scope} onChange={(v: any) => set("scope", v)} />
      </Field>
      <Field label="Revision limit">
        <TextInput value={data.revisionLimit} onChange={(v: any) => set("revisionLimit", v)} placeholder="2 revision rounds per deliverable" />
      </Field>
      <Field label="Payment due day">
        <TextInput value={data.paymentDueDay} onChange={(v: any) => set("paymentDueDay", v)} placeholder="1st of each month" />
      </Field>
      <div className="field__row">
        <Field label="Start date">
          <TextInput type="date" value={data.startDate} onChange={(v: any) => set("startDate", v)} />
        </Field>
        <Field label="Contract duration">
          <TextInput value={data.contractDuration} onChange={(v: any) => set("contractDuration", v)} placeholder="3 months, auto-renewing" />
        </Field>
      </div>
      <Field label="Governing law">
        <TextInput value={data.governingLaw} onChange={(v: any) => set("governingLaw", v)} placeholder="New York, USA" />
      </Field>
    </>
  );
}
