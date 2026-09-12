import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const AtsOptimizedTemplate = ({ data }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const atsStyles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#000000', // Solid black for optimal parsing
    },
    header: {
      alignItems: 'center',
      marginBottom: 12,
    },
    name: {
      fontSize: 16,
      fontFamily: 'Helvetica-Bold',
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 10,
      marginTop: 2,
      fontFamily: 'Helvetica-Bold',
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      fontSize: 8,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontFamily: 'Helvetica-Bold',
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: '#000000',
      paddingBottom: 2,
      marginTop: 12,
      marginBottom: 6,
    },
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontWeight: 'bold',
    },
    itemTitle: {
      fontFamily: 'Helvetica-Bold',
    },
    itemDate: {
      fontFamily: 'Helvetica-Bold',
    },
    itemSub: {
      fontStyle: 'italic',
      marginTop: 1,
    },
    skillsText: {
      fontSize: 9,
      lineHeight: 1.3,
    },
  });

  return (
    <Document>
      <Page size="A4" style={atsStyles.page}>
        <View style={atsStyles.header}>
          <Text style={atsStyles.name}>{personal.fullName}</Text>
          <Text style={atsStyles.title}>{personal.title}</Text>
          <View style={atsStyles.contactRow}>
            {personal.email && <Text>{personal.email}</Text>}
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.location && <Text>{personal.location}</Text>}
            {personal.website && <Text>{personal.website}</Text>}
          </View>
          <View style={[atsStyles.contactRow, { marginTop: 2 }]}>
            {personal.linkedin && <Text>LinkedIn: {personal.linkedin}</Text>}
            {personal.github && <Text>GitHub: {personal.github}</Text>}
          </View>
        </View>

        {summary && (
          <View style={{ marginBottom: 6 }}>
            <Text style={{ lineHeight: 1.3 }}>{summary}</Text>
          </View>
        )}

        {experience && experience.length > 0 && (
          <View>
            <Text style={atsStyles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={atsStyles.itemBlock}>
                <View style={atsStyles.itemHeader}>
                  <Text style={atsStyles.itemTitle}>
                    {exp.company} — {exp.role}
                  </Text>
                  <Text style={atsStyles.itemDate}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={atsStyles.itemSub}>{exp.location}</Text> : null}
                <DescriptionText text={exp.description} color="#000000" />
              </View>
            ))}
          </View>
        )}

        {education && education.length > 0 && (
          <View>
            <Text style={atsStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={atsStyles.itemBlock}>
                <View style={atsStyles.itemHeader}>
                  <Text style={atsStyles.itemTitle}>
                    {edu.institution} — {edu.degree} in {edu.field}
                  </Text>
                  <Text style={atsStyles.itemDate}>
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </Text>
                </View>
                <Text style={atsStyles.itemSub}>
                  {edu.location} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills && skills.length > 0 && (
          <View>
            <Text style={atsStyles.sectionTitle}>Skills & Expertise</Text>
            <Text style={atsStyles.skillsText}>
              {skills.map((s) => s.name).join(', ')}
            </Text>
          </View>
        )}

        {certifications && certifications.length > 0 && (
          <View>
            <Text style={atsStyles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>
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
