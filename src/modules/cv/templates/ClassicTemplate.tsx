import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const ClassicTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;
  
  const classicStyles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#2d2d2d',
    },
    header: {
      alignItems: 'center',
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
      paddingBottom: 10,
      marginBottom: 15,
    },
    name: {
      fontSize: 20,
      fontFamily: 'Helvetica-Bold',
      color: '#1a1a1a',
      marginBottom: 4,
    },
    title: {
      fontSize: 11,
      color: '#555555',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      fontSize: 8,
      color: '#666666',
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: accent,
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 2,
      marginBottom: 6,
      marginTop: 10,
      letterSpacing: 0.5,
    },
    summaryText: {
      fontSize: 9,
      lineHeight: 1.4,
      marginBottom: 10,
      color: '#3d3d3d',
    },
    mainContainer: {
      flexDirection: 'row',
      gap: 18,
    },
    leftCol: {
      flex: 2,
    },
    rightCol: {
      flex: 1,
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
      fontSize: 9.5,
      color: '#1a1a1a',
    },
    itemSub: {
      fontSize: 8.5,
      color: '#555555',
      marginTop: 1,
    },
    itemDate: {
      fontSize: 8,
      color: '#777777',
    },
    skillBadge: {
      marginBottom: 4,
    },
    skillName: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 8.5,
    },
    skillCat: {
      fontSize: 7.5,
      color: '#777777',
    },
  });

  return (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>{personal.fullName}</Text>
          <Text style={classicStyles.title}>{personal.title}</Text>
          <View style={classicStyles.contactRow}>
            {personal.email && <Text>{personal.email}</Text>}
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.location && <Text>{personal.location}</Text>}
            {personal.website && <Text>{personal.website}</Text>}
            {personal.linkedin && <Text>{personal.linkedin}</Text>}
            {personal.github && <Text>{personal.github}</Text>}
          </View>
        </View>

        {/* Summary */}
        {summary && (
          <View>
            <Text style={classicStyles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Two Columns */}
        <View style={classicStyles.mainContainer}>
          {/* Left Column: Work & Education */}
          <View style={classicStyles.leftCol}>
            {experience && experience.length > 0 && (
              <View>
                <Text style={classicStyles.sectionTitle}>Work Experience</Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={classicStyles.itemBlock}>
                    <View style={classicStyles.itemHeader}>
                      <Text style={classicStyles.itemTitle}>{exp.role}</Text>
                      <Text style={classicStyles.itemDate}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </Text>
                    </View>
                    <Text style={classicStyles.itemSub}>
                      {exp.company} {exp.location ? `| ${exp.location}` : ''}
                    </Text>
                    <DescriptionText text={exp.description} />
                  </View>
                ))}
              </View>
            )}

            {education && education.length > 0 && (
              <View>
                <Text style={classicStyles.sectionTitle}>Education</Text>
                {education.map((edu) => (
                  <View key={edu.id} style={classicStyles.itemBlock}>
                    <View style={classicStyles.itemHeader}>
                      <Text style={classicStyles.itemTitle}>
                        {edu.degree} in {edu.field}
                      </Text>
                      <Text style={classicStyles.itemDate}>
                        {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      </Text>
                    </View>
                    <Text style={classicStyles.itemSub}>
                      {edu.institution} {edu.location ? `| ${edu.location}` : ''}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                    </Text>
                    {edu.description && <DescriptionText text={edu.description} />}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right Column: Skills & Certifications */}
          <View style={classicStyles.rightCol}>
            {skills && skills.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={classicStyles.sectionTitle}>Skills</Text>
                {skills.map((skill) => (
                  <View key={skill.id} style={classicStyles.skillBadge}>
                    <Text style={classicStyles.skillName}>{skill.name}</Text>
                    {skill.category && <Text style={classicStyles.skillCat}>{skill.category}</Text>}
                  </View>
                ))}
              </View>
            )}

            {certifications && certifications.length > 0 && (
              <View>
                <Text style={classicStyles.sectionTitle}>Certifications</Text>
                {certifications.map((cert) => (
                  <View key={cert.id} style={classicStyles.itemBlock}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5 }}>{cert.name}</Text>
                    <Text style={{ fontSize: 7.5, color: '#555555' }}>
                      {cert.issuer} | {cert.date}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
