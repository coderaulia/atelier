import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function HandoverEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project info</SectionTitle>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Handover date">
        <TextInput type="date" value={data.handoverDate} onChange={(v: any) => set("handoverDate", v)} />
      </Field>

      <SectionTitle>Handover content</SectionTitle>
      <Field label="Deliverables list" hint="One item per line — renders as a checklist.">
        <Textarea value={data.deliverablesList} onChange={(v: any) => set("deliverablesList", v)} />
      </Field>
      <Field label="File locations / links (markdown)">
        <Textarea value={data.fileLocations} onChange={(v: any) => set("fileLocations", v)} />
      </Field>
      <Field label="Credentials handed over (markdown)">
        <Textarea value={data.credentialsHandedOver} onChange={(v: any) => set("credentialsHandedOver", v)} />
      </Field>
      <Field label="Next steps for client" hint="One item per line — renders as a checklist.">
        <Textarea value={data.nextStepsForClient} onChange={(v: any) => set("nextStepsForClient", v)} />
      </Field>

      <SectionTitle>Sign-off</SectionTitle>
      <Field label="Studio sign-off name">
        <TextInput value={data.studioSignOffName} onChange={(v: any) => set("studioSignOffName", v)} placeholder="Maren Aksel" />
      </Field>
    </>
  );
}
