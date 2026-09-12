import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const ExecutiveTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const execStyles = StyleSheet.create({
    page: {
      padding: 45,
      fontFamily: 'Times-Roman', // Serif for premium executive vibe
      fontSize: 9,
      color: '#1a1a1a',
    },
    header: {
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: accent,
      paddingBottom: 12,
      marginBottom: 12,
    },
    name: {
      fontSize: 22,
      fontFamily: 'Times-Bold',
      color: '#111111',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 10.5,
      fontFamily: 'Times-Roman',
      textTransform: 'uppercase',
      color: '#555555',
      marginTop: 3,
      letterSpacing: 1.5,
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      fontSize: 8,
      color: '#666666',
      marginTop: 6,
      fontFamily: 'Helvetica',
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Times-Bold',
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottomWidth: 0.5,
      borderBottomColor: '#b5b5b5',
      paddingBottom: 2,
      marginTop: 14,
      marginBottom: 6,
    },
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemTitle: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5,
    },
    itemDate: {
      fontFamily: 'Times-Bold',
      fontSize: 8.5,
    },
    itemSub: {
      fontStyle: 'italic',
      color: '#444444',
      fontSize: 8.5,
      marginTop: 1,
    },
  });

  return (
    <Document>
      <Page size="A4" style={execStyles.page}>
        <View style={execStyles.header}>
          <Text style={execStyles.name}>{personal.fullName}</Text>
          <Text style={execStyles.title}>{personal.title}</Text>
          <View style={execStyles.contactRow}>
            {personal.email && <Text>{personal.email}</Text>}
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.location && <Text>{personal.location}</Text>}
          </View>
          <View style={[execStyles.contactRow, { marginTop: 2 }]}>
            {personal.website && <Text>{personal.website}</Text>}
            {personal.linkedin && <Text>{personal.linkedin}</Text>}
          </View>
        </View>

        {summary && (
          <View style={{ marginBottom: 6 }}>
            <Text style={{ lineHeight: 1.4, textAlign: 'justify', fontStyle: 'italic' }}>{summary}</Text>
          </View>
        )}

        {experience && experience.length > 0 && (
          <View>
            <Text style={execStyles.sectionTitle}>Leadership Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={execStyles.itemBlock}>
                <View style={execStyles.itemHeader}>
                  <Text style={execStyles.itemTitle}>
                    {exp.role} — {exp.company}
                  </Text>
                  <Text style={execStyles.itemDate}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={execStyles.itemSub}>{exp.location}</Text> : null}
                <DescriptionText text={exp.description} color="#2d2d2d" />
              </View>
            ))}
          </View>
        )}

        {education && education.length > 0 && (
          <View>
            <Text style={execStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={execStyles.itemBlock}>
                <View style={execStyles.itemHeader}>
                  <Text style={execStyles.itemTitle}>
                    {edu.institution} — {edu.degree}
                  </Text>
                  <Text style={execStyles.itemDate}>
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </Text>
                </View>
                <Text style={execStyles.itemSub}>
                  {edu.field} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills && skills.length > 0 && (
          <View>
            <Text style={execStyles.sectionTitle}>Expertise</Text>
            <Text style={{ lineHeight: 1.3 }}>
              {skills.map((s) => s.name).join('  |  ')}
            </Text>
          </View>
        )}

        {certifications && certifications.length > 0 && (
          <View>
            <Text style={execStyles.sectionTitle}>Professional Credentials</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Times-Bold' }}>
                  {cert.name} — {cert.issuer} ({cert.date})
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
