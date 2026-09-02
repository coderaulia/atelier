import { Field, TextInput, Textarea, SectionTitle } from '../utils';

export function OnboardingEditor({ data, onChange }: any) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <>
      <SectionTitle>Project info</SectionTitle>
      <Field label="Client name">
        <TextInput value={data.clientName} onChange={(v: any) => set("clientName", v)} placeholder="Atlas & Bell, Inc." />
      </Field>
      <Field label="Project name">
        <TextInput value={data.projectName} onChange={(v: any) => set("projectName", v)} placeholder="Brand Identity" />
      </Field>
      <Field label="Start date">
        <TextInput type="date" value={data.startDate} onChange={(v: any) => set("startDate", v)} />
      </Field>

      <SectionTitle>Checklist content</SectionTitle>
      <Field label="Deliverables" hint="One item per line — renders as a printable checklist.">
        <Textarea value={data.deliverables} onChange={(v: any) => set("deliverables", v)} />
      </Field>
      <Field label="Assets needed from client" hint="One item per line.">
        <Textarea value={data.assetsNeeded} onChange={(v: any) => set("assetsNeeded", v)} />
      </Field>

      <SectionTitle>Communication</SectionTitle>
      <Field label="Communication channel">
        <TextInput value={data.communicationChannel} onChange={(v: any) => set("communicationChannel", v)} placeholder="Slack / WhatsApp / Email" />
      </Field>
      <Field label="Meeting schedule">
        <TextInput value={data.meetingSchedule} onChange={(v: any) => set("meetingSchedule", v)} placeholder="Weekly check-ins, Tuesdays 10am EST" />
      </Field>
      <Field label="Point of contact">
        <TextInput value={data.pointOfContact} onChange={(v: any) => set("pointOfContact", v)} placeholder="Maren Aksel — hello@northquill.studio" />
      </Field>
    </>
  );
}
