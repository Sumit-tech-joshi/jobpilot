import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  type DocumentProps,
} from '@react-pdf/renderer'
import { UniversalGeneratedResume } from '@/lib/anthropic'

const blue = '#1F4E79'
const gray = '#555555'
const lightGray = '#888888'
const black = '#111111'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: black,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    lineHeight: 1.4,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: blue,
    textAlign: 'center',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: gray,
    textAlign: 'center',
    marginBottom: 2,
  },
  workPermit: {
    fontSize: 8.5,
    color: lightGray,
    textAlign: 'center',
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: blue,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: blue,
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 10,
    color: black,
    marginBottom: 4,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  skillLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  skillValue: {
    fontSize: 10,
    color: gray,
    flex: 1,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
    marginTop: 8,
  },
  expTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: black,
  },
  expDates: {
    fontSize: 9,
    color: gray,
  },
  expMeta: {
    fontSize: 9,
    color: blue,
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: blue,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: black,
    lineHeight: 1.35,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 1,
  },
  eduDegree: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  eduDates: {
    fontSize: 9,
    color: gray,
  },
  eduInstitution: {
    fontSize: 9,
    color: gray,
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 2,
  },
  projectName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#333333',
    marginTop: 4,
    marginBottom: 2,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
})

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UniversalResumeDocument({ profile, resume }: { profile: Record<string, any>; resume: UniversalGeneratedResume }) {
  const contact = [profile.email, profile.phone, profile.location].filter(Boolean).join('  ·  ')
  const links = [profile.portfolio, profile.linkedin, profile.github].filter(Boolean).join('  ·  ')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{profile.fullName || 'Resume'}</Text>
        {contact && <Text style={styles.contactLine}>{contact}</Text>}
        {links && <Text style={styles.contactLine}>{links}</Text>}
        {profile.workAuthorization && (
          <Text style={styles.workPermit}>{profile.workAuthorization}</Text>
        )}

        {/* Summary */}
        {resume.summary && (
          <>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.body}>{resume.summary}</Text>
          </>
        )}

        {/* Skills */}
        {resume.skillSections?.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Skills</Text>
            {resume.skillSections.map((s, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{s.categoryName}: </Text>
                <Text style={styles.skillValue}>{s.skills.join(', ')}</Text>
              </View>
            ))}
          </>
        )}

        {/* Experience */}
        {resume.experience?.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.expDates}>{exp.dates}</Text>
                </View>
                <Text style={styles.expMeta}>
                  {exp.employer}{exp.location ? `  ·  ${exp.location}` : ''}
                </Text>
                {exp.bullets.map((b, j) => <BulletItem key={j} text={b} />)}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {resume.education?.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Education</Text>
            {resume.education.map((e, i) => (
              <View key={i}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>{e.credential}</Text>
                  <Text style={styles.eduDates}>{e.dates}</Text>
                </View>
                <Text style={styles.eduInstitution}>
                  {e.institution}{e.location ? `, ${e.location}` : ''}
                </Text>
                {e.notes && <Text style={{ fontSize: 9, color: gray, marginBottom: 4 }}>{e.notes}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Certifications */}
        {resume.certifications?.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Certifications</Text>
            {resume.certifications.map((c, i) => (
              <View key={i} style={styles.certRow}>
                <Text style={{ fontSize: 10 }}>{c.name}  ·  <Text style={{ color: gray }}>{c.issuingBody}</Text></Text>
                <Text style={{ fontSize: 9, color: gray }}>{c.dates}</Text>
              </View>
            ))}
          </>
        )}

        {/* Projects */}
        {resume.projects?.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Projects</Text>
            {resume.projects.map((p, i) => (
              <View key={i}>
                <Text style={styles.projectName}>{p.name}</Text>
                {p.description && <Text style={{ fontSize: 9, color: gray, marginBottom: 2 }}>{p.description}</Text>}
                {p.bullets.map((b, j) => <BulletItem key={j} text={b} />)}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}

export async function generateUniversalResumePdf(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>,
  resume: UniversalGeneratedResume
): Promise<Buffer> {
  const element = React.createElement(UniversalResumeDocument, { profile, resume }) as React.ReactElement<DocumentProps>
  return Buffer.from(await renderToBuffer(element))
}
