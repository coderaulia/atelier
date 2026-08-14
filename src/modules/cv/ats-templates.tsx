import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CVData } from './types';

// Helper: bullet / plain text parser (shared with main templates.tsx)
const DescriptionText = ({ text, color = '#333333' }: { text: string; color?: string }) => {
  if (!text) return null;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 4 }}>
      {lines.map((line, idx) => {
        const isBullet = line.startsWith('-') || line.startsWith('*');
        const cleanLine = isBullet ? line.replace(/^[-*]\s*/, '') : line;
        if (isBullet) {
          return (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 2, paddingLeft: 8 }}>
              <Text style={{ width: 6, fontSize: 9, color }}>•</Text>
              <Text style={{ flex: 1, fontSize: 9, lineHeight: 1.3, color }}>{cleanLine}</Text>
            </View>
          );
        }
        return (
          <Text key={idx} style={{ fontSize: 9, lineHeight: 1.3, color, marginBottom: 2 }}>
            {cleanLine}
          </Text>
        );
      })}
    </View>
  );
};

// ── Shared contact builder ────────────────────────────────────────
const buildContact = (personal: CVData['personal']) =>
  [personal.phone, personal.email, personal.location, personal.linkedin || personal.website]
    .filter(Boolean)
    .join(' | ');

// ════════════════════════════════════════════════════════════════
// 7. SLATE ATS TEMPLATE (Free)
//    Single column · Helvetica · Navy accent
//    Section order: Summary → Work Experience → Skills → Education → Certifications
// ════════════════════════════════════════════════════════════════
export const SlateAtsTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const s = StyleSheet.create({
    page:      { padding: 54, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2933' },
    header:    { alignItems: 'center', borderBottomWidth: 1.2, borderBottomColor: accent, paddingBottom: 8, marginBottom: 12 },
    name:      { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 3 },
    jobTitle:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 4 },
    contact:   { fontSize: 9, color: '#334155', textAlign: 'center' },
    secTitle:  { fontSize: 12, fontFamily: 'Helvetica-Bold', color: accent, textTransform: 'uppercase', borderBottomWidth: 0.8, borderBottomColor: '#cbd5e1', paddingBottom: 2, marginTop: 10, marginBottom: 5 },
    body:      { fontSize: 10, lineHeight: 1.35 },
    block:     { marginBottom: 8 },
    row:       { flexDirection: 'row', justifyContent: 'space-between' },
    bold:      { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
    dateText:  { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
    sub:       { fontSize: 9.5, color: '#334155', marginTop: 1 },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{personal.fullName}</Text>
          <Text style={s.jobTitle}>{personal.title}</Text>
          <Text style={s.contact}>{buildContact(personal)}</Text>
        </View>

        {/* ── Professional Summary ── */}
        {summary ? (
          <View>
            <Text style={s.secTitle}>Professional Summary</Text>
            <Text style={s.body}>{summary}</Text>
          </View>
        ) : null}

        {/* ── Work Experience ── */}
        {experience?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Work Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{exp.role} – {exp.company}</Text>
                  <Text style={s.dateText}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                </View>
                {exp.location ? <Text style={s.sub}>{exp.location}</Text> : null}
                <DescriptionText text={exp.description} color="#1f2933" />
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {skills?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Skills</Text>
            <Text style={s.body}>
              {skills.map((sk) => (sk.category ? `${sk.name} (${sk.category})` : sk.name)).join(' | ')}
            </Text>
          </View>
        ) : null}

        {/* ── Education ── */}
        {education?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{edu.degree} in {edu.field}, {edu.institution}</Text>
                  <Text style={s.dateText}>{edu.endDate || edu.startDate}</Text>
                </View>
                {edu.location ? <Text style={s.sub}>{edu.location}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Certifications / Projects ── */}
        {certifications?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Certifications / Projects</Text>
            {certifications.map((cert) => (
              <Text key={cert.id} style={s.body}>{cert.name}, {cert.issuer}, {cert.date}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

// ════════════════════════════════════════════════════════════════
// 8. CRIMSON ATS TEMPLATE (Free)
//    Single column · Times-Roman serif · Deep-red accent
// ════════════════════════════════════════════════════════════════
export const CrimsonAtsTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const s = StyleSheet.create({
    page:      { padding: 54, fontFamily: 'Times-Roman', fontSize: 10.5, color: '#1c1917' },
    header:    { borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 7, marginBottom: 12 },
    name:      { fontSize: 18, fontFamily: 'Times-Bold', color: '#111111', textTransform: 'uppercase' },
    jobTitle:  { fontSize: 11, fontFamily: 'Times-Bold', color: accent, marginTop: 2, marginBottom: 4 },
    contact:   { fontSize: 9.5, color: '#44403c' },
    secTitle:  { fontSize: 12, fontFamily: 'Times-Bold', color: accent, textTransform: 'uppercase', marginTop: 11, marginBottom: 5, borderBottomWidth: 0.7, borderBottomColor: '#d6d3d1', paddingBottom: 2 },
    body:      { fontSize: 10.5, lineHeight: 1.32 },
    block:     { marginBottom: 8 },
    row:       { flexDirection: 'row', justifyContent: 'space-between' },
    bold:      { fontSize: 10.5, fontFamily: 'Times-Bold' },
    dateText:  { fontSize: 9.5, fontFamily: 'Times-Bold', color: '#44403c' },
    sub:       { fontSize: 9.5, color: '#44403c', marginTop: 1 },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{personal.fullName}</Text>
          <Text style={s.jobTitle}>{personal.title}</Text>
          <Text style={s.contact}>{buildContact(personal)}</Text>
        </View>

        {summary ? (
          <View>
            <Text style={s.secTitle}>Professional Summary</Text>
            <Text style={s.body}>{summary}</Text>
          </View>
        ) : null}

        {experience?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Work Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{exp.role} – {exp.company}</Text>
                  <Text style={s.dateText}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                </View>
                {exp.location ? <Text style={s.sub}>{exp.location}</Text> : null}
                <DescriptionText text={exp.description} color="#1c1917" />
              </View>
            ))}
          </View>
        ) : null}

        {skills?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Skills</Text>
            <Text style={s.body}>{skills.map((sk) => sk.name).join(' | ')}</Text>
          </View>
        ) : null}

        {education?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{edu.degree} in {edu.field}, {edu.institution}</Text>
                  <Text style={s.dateText}>{edu.endDate || edu.startDate}</Text>
                </View>
                {edu.location ? <Text style={s.sub}>{edu.location}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {certifications?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Certifications / Projects</Text>
            {certifications.map((cert) => (
              <Text key={cert.id} style={s.body}>{cert.name}, {cert.issuer}, {cert.date}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

// ════════════════════════════════════════════════════════════════
// 9. CARBON ATS TEMPLATE (Free)
//    Single column · Black & white only · Thick rule section headers
// ════════════════════════════════════════════════════════════════
export const CarbonAtsTemplate = ({ data }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const s = StyleSheet.create({
    page:      { padding: 54, fontFamily: 'Helvetica', fontSize: 10, color: '#000000' },
    header:    { alignItems: 'center', marginBottom: 10 },
    name:      { fontSize: 18, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    jobTitle:  { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2, marginBottom: 4 },
    contact:   { fontSize: 9, textAlign: 'center' },
    secTitle:  {
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      textTransform: 'uppercase',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderTopColor: '#000000',
      borderBottomColor: '#000000',
      paddingTop: 2,
      paddingBottom: 2,
      marginTop: 10,
      marginBottom: 5,
    },
    body:      { fontSize: 10, lineHeight: 1.35 },
    block:     { marginBottom: 8 },
    row:       { flexDirection: 'row', justifyContent: 'space-between' },
    bold:      { fontSize: 10, fontFamily: 'Helvetica-Bold' },
    dateText:  { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
    sub:       { fontSize: 9.5, marginTop: 1 },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{personal.fullName}</Text>
          <Text style={s.jobTitle}>{personal.title}</Text>
          <Text style={s.contact}>{buildContact(personal)}</Text>
        </View>

        {summary ? (
          <View>
            <Text style={s.secTitle}>Professional Summary</Text>
            <Text style={s.body}>{summary}</Text>
          </View>
        ) : null}

        {experience?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Work Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{exp.role} – {exp.company}</Text>
                  <Text style={s.dateText}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                </View>
                {exp.location ? <Text style={s.sub}>{exp.location}</Text> : null}
                <DescriptionText text={exp.description} color="#000000" />
              </View>
            ))}
          </View>
        ) : null}

        {skills?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Skills</Text>
            <Text style={s.body}>{skills.map((sk) => sk.name).join(' | ')}</Text>
          </View>
        ) : null}

        {education?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={s.block}>
                <View style={s.row}>
                  <Text style={s.bold}>{edu.degree} in {edu.field}, {edu.institution}</Text>
                  <Text style={s.dateText}>{edu.endDate || edu.startDate}</Text>
                </View>
                {edu.location ? <Text style={s.sub}>{edu.location}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {certifications?.length > 0 ? (
          <View>
            <Text style={s.secTitle}>Certifications / Projects</Text>
            {certifications.map((cert) => (
              <Text key={cert.id} style={s.body}>{cert.name}, {cert.issuer}, {cert.date}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};
