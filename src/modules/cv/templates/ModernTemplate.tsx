import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const ModernTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const modernStyles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#2c3e50',
    },
    sidebar: {
      width: '32%',
      backgroundColor: accent,
      color: '#ffffff',
      padding: 20,
      paddingTop: 30,
    },
    main: {
      width: '68%',
      padding: 24,
      paddingTop: 30,
      backgroundColor: '#fafafa',
    },
    name: {
      fontSize: 18,
      fontFamily: 'Helvetica-Bold',
      color: '#ffffff',
      marginBottom: 2,
    },
    title: {
      fontSize: 9.5,
      color: '#e2e8f0',
      marginBottom: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sideSectionTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.3)',
      paddingBottom: 3,
      marginTop: 15,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sideContact: {
      fontSize: 7.5,
      color: '#f7fafc',
      marginBottom: 6,
    },
    sideSkill: {
      fontSize: 8,
      color: '#edf2f7',
      marginBottom: 4,
    },
    mainSectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#2c3e50',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 3,
      marginTop: 14,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    itemTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 9,
      color: '#1a202c',
    },
    itemSub: {
      fontSize: 8,
      color: '#4a5568',
      marginTop: 1,
    },
    itemDate: {
      fontSize: 7.5,
      color: '#718096',
    },
  });

  return (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        {/* Sidebar */}
        <View style={modernStyles.sidebar}>
          <Text style={modernStyles.name}>{personal.fullName}</Text>
          <Text style={modernStyles.title}>{personal.title}</Text>

          <Text style={modernStyles.sideSectionTitle}>Contact</Text>
          {personal.email && <Text style={modernStyles.sideContact}>✉ {personal.email}</Text>}
          {personal.phone && <Text style={modernStyles.sideContact}>☎ {personal.phone}</Text>}
          {personal.location && <Text style={modernStyles.sideContact}>📍 {personal.location}</Text>}
          {personal.website && <Text style={modernStyles.sideContact}>🌐 {personal.website}</Text>}
          {personal.linkedin && <Text style={modernStyles.sideContact}>in/ {personal.linkedin}</Text>}
          {personal.github && <Text style={modernStyles.sideContact}>git/ {personal.github}</Text>}

          {skills && skills.length > 0 && (
            <View>
              <Text style={modernStyles.sideSectionTitle}>Skills</Text>
              {skills.map((skill) => (
                <Text key={skill.id} style={modernStyles.sideSkill}>
                  • {skill.name} {skill.level ? `(${skill.level})` : ''}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Body */}
        <View style={modernStyles.main}>
          {summary && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 9.5, lineHeight: 1.4, color: '#4a5568' }}>{summary}</Text>
            </View>
          )}

          {experience && experience.length > 0 && (
            <View>
              <Text style={modernStyles.mainSectionTitle}>Experience</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={modernStyles.itemBlock}>
                  <View style={modernStyles.itemHeader}>
                    <Text style={modernStyles.itemTitle}>{exp.role}</Text>
                    <Text style={modernStyles.itemDate}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </Text>
                  </View>
                  <Text style={modernStyles.itemSub}>
                    {exp.company} {exp.location ? `| ${exp.location}` : ''}
                  </Text>
                  <DescriptionText text={exp.description} color="#4a5568" />
                </View>
              ))}
            </View>
          )}

          {education && education.length > 0 && (
            <View>
              <Text style={modernStyles.mainSectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={modernStyles.itemBlock}>
                  <View style={modernStyles.itemHeader}>
                    <Text style={modernStyles.itemTitle}>
                      {edu.degree} in {edu.field}
                    </Text>
                    <Text style={modernStyles.itemDate}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </Text>
                  </View>
                  <Text style={modernStyles.itemSub}>
                    {edu.institution} {edu.location ? `| ${edu.location}` : ''}
                    {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {certifications && certifications.length > 0 && (
            <View>
              <Text style={modernStyles.mainSectionTitle}>Certifications</Text>
              {certifications.map((cert) => (
                <View key={cert.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: '#1a202c' }}>
                    {cert.name}
                  </Text>
                  <Text style={{ fontSize: 7.5, color: '#718096' }}>
                    {cert.issuer} | {cert.date}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
