import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function AgreementEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });

  return (
    <>
      <SectionTitle>Parties &amp; Scope</SectionTitle>
      <Field label="Project / Engagement title">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="Brand identity engagement" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Client address">
        <Textarea value={data.clientAddress} onChange={(v: any) => set("clientAddress", v)} placeholder="221 Baker St, Suite 4&#10;Brooklyn, NY 11201" />
      </Field>
      <div className="field__row">
        <Field label="Agreement date">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Reference no.">
          <TextInput value={data.refNo} onChange={(v: any) => set("refNo", v)} placeholder="AG-2026-014" />
        </Field>
      </div>

      <SectionTitle>Terms</SectionTitle>
      <Field label="Scope of work (markdown)" hint="Use ## for sections, ** for emphasis.">
        <Textarea value={data.scope} onChange={(v: any) => set("scope", v)} />
      </Field>
      <Field label="Deliverables (markdown)">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Compensation &amp; payment (markdown)">
        <Textarea value={data.compensation} onChange={(v: any) => set("compensation", v)} />
      </Field>
      <Field label="Timeline (markdown)">
        <Textarea value={data.timeline} onChange={(v: any) => set("timeline", v)} />
      </Field>
      <Field label="Legal &amp; misc (markdown)">
        <Textarea value={data.legal} onChange={(v: any) => set("legal", v)} />
      </Field>

      <SectionTitle>Signatures</SectionTitle>
      <div className="field__row">
        <Field label="Your signatory">
          <TextInput value={data.signatoryName} onChange={(v: any) => set("signatoryName", v)} />
        </Field>
        <Field label="Client signatory">
          <TextInput value={data.clientSignatory} onChange={(v: any) => set("clientSignatory", v)} />
        </Field>
      </div>
    </>
  );
}
