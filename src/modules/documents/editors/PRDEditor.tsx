import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function PRDEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Document info</SectionTitle>
      <Field label="Feature / Product name">
        <TextInput value={data.title} onChange={(v: any) => set("title", v)} placeholder="Onboarding 2.0" />
      </Field>
      <Field label="One-line summary">
        <TextInput value={data.tagline} onChange={(v: any) => set("tagline", v)} placeholder="A guided first-run experience for new accounts." />
      </Field>
      <div className="field__row">
        <Field label="Author">
          <TextInput value={data.author} onChange={(v: any) => set("author", v)} />
        </Field>
        <Field label="Status">
          <select className="field__select" value={data.status} onChange={(e: any) => set("status", e.target.value)}>
            <option>Draft</option><option>In Review</option><option>Approved</option><option>Shipped</option>
          </select>
        </Field>
      </div>
      <div className="field__row">
        <Field label="Updated">
          <TextInput type="date" value={data.date} onChange={(v: any) => set("date", v)} />
        </Field>
        <Field label="Target release">
          <TextInput value={data.release} onChange={(v: any) => set("release", v)} placeholder="Q3 2026" />
        </Field>
      </div>

      <SectionTitle>Body (markdown)</SectionTitle>
      <Field label="Problem">
        <Textarea value={data.problem} onChange={(v: any) => set("problem", v)} />
      </Field>
      <Field label="Goals &amp; non-goals">
        <Textarea value={data.goals} onChange={(v: any) => set("goals", v)} />
      </Field>
      <Field label="User stories">
        <Textarea value={data.stories} onChange={(v: any) => set("stories", v)} />
      </Field>
      <Field label="Solution / Requirements">
        <Textarea value={data.solution} onChange={(v: any) => set("solution", v)} />
      </Field>
      <Field label="Success metrics">
        <Textarea value={data.metrics} onChange={(v: any) => set("metrics", v)} />
      </Field>
      <Field label="Risks &amp; open questions">
        <Textarea value={data.risks} onChange={(v: any) => set("risks", v)} />
      </Field>
    </>
  );
}
