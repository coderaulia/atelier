import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const MinimalTemplate = ({ data }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const minStyles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 8.5,
      color: '#333333',
    },
    header: {
      marginBottom: 15,
    },
    name: {
      fontSize: 22,
      fontFamily: 'Helvetica-Bold',
      color: '#111111',
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 10,
      color: '#666666',
      marginTop: 2,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      fontSize: 7.5,
      color: '#777777',
      borderTopWidth: 1,
      borderTopColor: '#eeeeee',
      paddingTop: 6,
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: '#111111',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 2,
    },
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemTitle: {
      fontFamily: 'Helvetica-Bold',
      color: '#222222',
    },
    itemDate: {
      color: '#777777',
      fontSize: 7.5,
    },
    itemSub: {
      color: '#555555',
      fontSize: 8,
      marginTop: 1,
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    skillBadge: {
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 2,
      fontSize: 7.5,
      color: '#444444',
    },
  });

  return (
    <Document>
      <Page size="A4" style={minStyles.page}>
        <View style={minStyles.header}>
          <Text style={minStyles.name}>{personal.fullName}</Text>
          <Text style={minStyles.title}>{personal.title}</Text>
          <View style={minStyles.contactRow}>
            {personal.email && <Text>{personal.email}</Text>}
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.location && <Text>{personal.location}</Text>}
            {personal.website && <Text>{personal.website}</Text>}
            {personal.linkedin && <Text>{personal.linkedin}</Text>}
            {personal.github && <Text>{personal.github}</Text>}
          </View>
        </View>

        {summary && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ lineHeight: 1.35, color: '#444444' }}>{summary}</Text>
          </View>
        )}

        {experience && experience.length > 0 && (
          <View style={minStyles.section}>
            <Text style={minStyles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={minStyles.itemBlock}>
                <View style={minStyles.itemHeader}>
                  <Text style={minStyles.itemTitle}>
                    {exp.role} <Text style={{ fontWeight: 'normal', color: '#666666' }}>at</Text> {exp.company}
                  </Text>
                  <Text style={minStyles.itemDate}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                <DescriptionText text={exp.description} color="#444444" />
              </View>
            ))}
          </View>
        )}

        {education && education.length > 0 && (
          <View style={minStyles.section}>
            <Text style={minStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={minStyles.itemBlock}>
                <View style={minStyles.itemHeader}>
                  <Text style={minStyles.itemTitle}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={minStyles.itemDate}>
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </Text>
                </View>
                <Text style={minStyles.itemSub}>
                  {edu.institution} {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills && skills.length > 0 && (
          <View style={minStyles.section}>
            <Text style={minStyles.sectionTitle}>Skills</Text>
            <View style={minStyles.skillsGrid}>
              {skills.map((skill) => (
                <Text key={skill.id} style={minStyles.skillBadge}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {certifications && certifications.length > 0 && (
          <View style={minStyles.section}>
            <Text style={minStyles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text>
                <Text style={{ fontSize: 7.5, color: '#666666' }}>
                  {cert.issuer} • {cert.date}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
