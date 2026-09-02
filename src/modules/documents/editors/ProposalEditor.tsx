import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function ProposalEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Cover</SectionTitle>
      <Field label="Proposal title">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="A brand system for Atlas & Bell" />
      </Field>
      <Field label="Prepared for">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} />
      </Field>
      <div className="field__row">
        <Field label="Date">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Reference">
          <TextInput value={data.refNo} onChange={(v: any) => set("refNo", v)} placeholder="P-2026-014" />
        </Field>
      </div>

      <SectionTitle>Content (markdown)</SectionTitle>
      <Field label="Executive summary">
        <Textarea value={data.summary} onChange={(v: any) => set("summary", v)} />
      </Field>
      <Field label="Understanding the brief">
        <Textarea value={data.understanding} onChange={(v: any) => set("understanding", v)} />
      </Field>
      <Field label="Approach &amp; methodology">
        <Textarea value={data.approach} onChange={(v: any) => set("approach", v)} />
      </Field>
      <Field label="Deliverables">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Timeline">
        <Textarea value={data.timeline} onChange={(v: any) => set("timeline", v)} />
      </Field>
      <Field label="Investment &amp; terms">
        <Textarea value={data.investment} onChange={(v: any) => set("investment", v)} />
      </Field>
      <Field label="About / Why us">
        <Textarea value={data.about} onChange={(v: any) => set("about", v)} />
      </Field>
    </>
  );
}
