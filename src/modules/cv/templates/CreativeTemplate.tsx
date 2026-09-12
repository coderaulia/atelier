import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVData } from '../types';
import { DescriptionText } from './shared';

export const CreativeTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
  const { personal, summary, experience, education, skills, certifications } = data;

  const creativeStyles = StyleSheet.create({
    page: {
      padding: 35,
      fontFamily: 'Helvetica',
      fontSize: 8.5,
      color: '#2d3748',
    },
    headerBg: {
      backgroundColor: accent,
      padding: 20,
      borderRadius: 6,
      marginBottom: 15,
      color: '#ffffff',
    },
    name: {
      fontSize: 24,
      fontFamily: 'Helvetica-Bold',
      color: '#ffffff',
    },
    title: {
      fontSize: 11,
      color: '#f7fafc',
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      fontSize: 8,
      marginTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: 'rgba(255,255,255,0.2)',
      paddingTop: 8,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: accent,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bodyGrid: {
      flexDirection: 'row',
      gap: 20,
    },
    leftCol: {
      flex: 1.8,
    },
    rightCol: {
      flex: 1,
      backgroundColor: '#f7fafc',
      padding: 12,
      borderRadius: 6,
    },
    itemBlock: {
      marginBottom: 10,
      borderLeftWidth: 2,
      borderLeftColor: accent,
      paddingLeft: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemTitle: {
      fontFamily: 'Helvetica-Bold',
      color: '#1a202c',
    },
    itemDate: {
      fontSize: 7.5,
      color: '#718096',
    },
    itemSub: {
      fontSize: 7.5,
      color: '#4a5568',
      marginTop: 1,
    },
    skillBadge: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      marginBottom: 4,
      marginRight: 4,
      fontSize: 7.5,
      display: 'flex',
    },
  });

  return (
    <Document>
      <Page size="A4" style={creativeStyles.page}>
        <View style={creativeStyles.headerBg}>
          <Text style={creativeStyles.name}>{personal.fullName}</Text>
          <Text style={creativeStyles.title}>{personal.title}</Text>
          <View style={creativeStyles.contactRow}>
            {personal.email && <Text>✉ {personal.email}</Text>}
            {personal.phone && <Text>☎ {personal.phone}</Text>}
            {personal.location && <Text>📍 {personal.location}</Text>}
            {personal.website && <Text>🌐 {personal.website}</Text>}
          </View>
        </View>

        <View style={creativeStyles.bodyGrid}>
          {/* Main content */}
          <View style={creativeStyles.leftCol}>
            {summary && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ lineHeight: 1.4, color: '#4a5568' }}>{summary}</Text>
              </View>
            )}

            {experience && experience.length > 0 && (
              <View>
                <Text style={creativeStyles.sectionTitle}>Work Experience</Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={creativeStyles.itemBlock}>
                    <View style={creativeStyles.itemHeader}>
                      <Text style={creativeStyles.itemTitle}>{exp.role}</Text>
                      <Text style={creativeStyles.itemDate}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </Text>
                    </View>
                    <Text style={creativeStyles.itemSub}>
                      {exp.company} | {exp.location}
                    </Text>
                    <DescriptionText text={exp.description} color="#4a5568" />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right sidebar */}
          <View style={creativeStyles.rightCol}>
            {skills && skills.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={creativeStyles.sectionTitle}>Skills</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {skills.map((skill) => (
                    <View key={skill.id} style={creativeStyles.skillBadge}>
                      <Text style={{ fontWeight: 'bold' }}>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {education && education.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={creativeStyles.sectionTitle}>Education</Text>
                {education.map((edu) => (
                  <View key={edu.id} style={{ marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>
                      {edu.degree}
                    </Text>
                    <Text style={{ fontSize: 7.5, color: '#4a5568' }}>
                      {edu.institution} ({edu.startDate.slice(0, 4)})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {certifications && certifications.length > 0 && (
              <View>
                <Text style={creativeStyles.sectionTitle}>Certifications</Text>
                {certifications.map((cert) => (
                  <View key={cert.id} style={{ marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>
                      {cert.name}
                    </Text>
                    <Text style={{ fontSize: 7, color: '#718096' }}>
                      {cert.issuer}
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
