import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
} from '@react-pdf/renderer';
import { CVData } from './types';

// Register fonts if needed, or use default standard PDF fonts: Helvetica, Helvetica-Bold, Helvetica-Oblique, Times-Roman, Times-Bold, Courier
// Default fonts: Helvetica (sans-serif), Times-Roman (serif), Courier (monospace).

const styles = StyleSheet.create({
  // Shared / Utility styles
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 6,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
  },
});

// Description parser for Markdown bullet points
const DescriptionText = ({ text, color = '#333333' }: { text: string; color?: string }) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 4 }}>
      {lines.map((line, idx) => {
        const isBullet = line.startsWith('-') || line.startsWith('*');
        const cleanLine = isBullet ? line.replace(/^[-*]\s*/, '') : line;
        
        if (isBullet) {
          return (
            <View key={idx} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color }]}>•</Text>
              <Text style={[styles.bulletText, { color }]}>{cleanLine}</Text>
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

// ----------------------------------------------------
// 1. CLASSIC TEMPLATE (Free)
// Header top center, two-column layout below.
// ----------------------------------------------------
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

// ----------------------------------------------------
// 2. MODERN TEMPLATE (Free)
// Sidebar on the left (colored/accent), content on the right.
// ----------------------------------------------------
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

// ----------------------------------------------------
// 3. MINIMAL TEMPLATE (Free)
// Pure typography, elegant layout.
// ----------------------------------------------------
export const MinimalTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
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

// ----------------------------------------------------
// 4. ATS-OPTIMIZED TEMPLATE (Pro-gated)
// Single column, zero columns, standard margins, maximum readability for ATS.
// ----------------------------------------------------
export const AtsOptimizedTemplate = ({ data, accent }: { data: CVData; accent: string }) => {
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

// ----------------------------------------------------
// 5. EXECUTIVE TEMPLATE (Pro-gated)
// Centered bold style with border frames, highly elegant.
// ----------------------------------------------------
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

// ----------------------------------------------------
// 6. CREATIVE TEMPLATE (Pro-gated)
// Bold headers, split layout, playful accents.
// ----------------------------------------------------
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
