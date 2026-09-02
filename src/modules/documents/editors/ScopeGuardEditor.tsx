import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function ScopeGuardEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project</SectionTitle>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>

      <SectionTitle>Revision terms</SectionTitle>
      <Field label="Included revisions">
        <TextInput type="number" value={data.includedRevisions} onChange={(v: any) => set("includedRevisions", v)} placeholder="2" />
      </Field>
      <Field label="What counts as a revision (markdown)">
        <Textarea value={data.whatIsRevision} onChange={(v: any) => set("whatIsRevision", v)} />
      </Field>
      <Field label="What is out of scope" hint="One item per line — renders as a list.">
        <Textarea value={data.whatIsOutOfScope} onChange={(v: any) => set("whatIsOutOfScope", v)} />
      </Field>
      <div className="field__row">
        <Field label="Currency">
          <select className="field__select" value={data.currency || "USD"} onChange={(e: any) => set("currency", e.target.value)}>
            <option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option><option>SGD</option>
          </select>
        </Field>
        <Field label="Additional revision rate">
          <TextInput type="number" value={data.additionalRevisionRate} onChange={(v: any) => set("additionalRevisionRate", v)} placeholder="180" />
        </Field>
      </div>
    </>
  );
}
