import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
  type DocumentProps,
} from '@react-pdf/renderer';
import { GeneratedResume } from '@/types';
import { masterProfile } from '@/data/master-profile';

Font.register({
  family: 'Helvetica',
  fonts: [],
});

const blue = '#1F4E79';
const gray = '#555555';
const lightGray = '#888888';
const black = '#111111';

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
  // Header
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
  contactSep: {
    color: lightGray,
  },
  workPermit: {
    fontSize: 8.5,
    color: lightGray,
    textAlign: 'center',
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 10,
  },
  // Section heading
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
  // Body text
  body: {
    fontSize: 10,
    color: black,
    marginBottom: 4,
  },
  // Skills
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
  // Experience
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
  // Project
  projectName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#333333',
    marginTop: 4,
    marginBottom: 2,
  },
  // Bullet
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
  // Education
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
  // Cover letter
  clName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: blue,
    marginBottom: 3,
  },
  clContact: {
    fontSize: 9.5,
    color: gray,
    marginBottom: 2,
  },
  clDate: {
    fontSize: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  clSubject: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 18,
  },
  clBody: {
    fontSize: 10.5,
    lineHeight: 1.6,
    marginBottom: 14,
    color: black,
  },
  clClosing: {
    fontSize: 10.5,
    marginTop: 18,
    marginBottom: 4,
  },
  clSignature: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
  },
});

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ResumeDocument({ resume }: { resume: GeneratedResume }) {
  const skillGroups: Array<[string, string[]]> = [
    ['Languages', resume.skills.languages],
    ['Frameworks', resume.skills.frameworks],
    ['Databases', resume.skills.databases],
    ['Tools', resume.skills.tools],
    ['Cloud', resume.skills.cloud],
    ['Platforms', resume.skills.platforms],
    ['Practices', resume.skills.practices],
  ];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{masterProfile.name}</Text>
        <Text style={styles.contactLine}>
          {masterProfile.phone}  ·  {masterProfile.email}  ·  {masterProfile.location}
        </Text>
        <Text style={styles.contactLine}>
          {masterProfile.portfolio}  ·  {masterProfile.linkedin}  ·  {masterProfile.github}
        </Text>
        <Text style={styles.workPermit}>{masterProfile.workPermit}</Text>

        {/* Summary */}
        <Text style={styles.sectionHeading}>Professional Summary</Text>
        <Text style={styles.body}>{resume.summary}</Text>

        {/* Skills */}
        <Text style={styles.sectionHeading}>Technical Skills</Text>
        {skillGroups.map(([label, items]) =>
          items && items.length > 0 ? (
            <View key={label} style={styles.skillRow}>
              <Text style={styles.skillLabel}>{label}: </Text>
              <Text style={styles.skillValue}>{items.join(', ')}</Text>
            </View>
          ) : null
        )}

        {/* Experience */}
        <Text style={styles.sectionHeading}>Professional Experience</Text>
        {resume.experience.map((exp, i) => (
          <View key={i}>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>{exp.title}</Text>
              <Text style={styles.expDates}>{exp.startDate} – {exp.endDate}</Text>
            </View>
            <Text style={styles.expMeta}>
              {exp.company}  ·  {exp.location}
            </Text>
            {exp.projects?.map((proj, j) => (
              <View key={j}>
                <Text style={styles.projectName}>{proj.name}</Text>
                {proj.bullets.map((b, k) => <BulletItem key={k} text={b} />)}
              </View>
            ))}
            {exp.bullets?.map((b, j) => <BulletItem key={j} text={b} />)}
            {exp.general?.map((b, j) => <BulletItem key={j} text={b} />)}
          </View>
        ))}

        {/* Education */}
        <Text style={styles.sectionHeading}>Education</Text>
        {resume.education.map((edu, i) => (
          <View key={i}>
            <View style={styles.eduHeader}>
              <Text style={styles.eduDegree}>{edu.degree}</Text>
              <Text style={styles.eduDates}>
                {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate}
              </Text>
            </View>
            <Text style={styles.eduInstitution}>{edu.institution}</Text>
            {edu.notes && <Text style={{ fontSize: 9, color: gray, marginBottom: 4 }}>{edu.notes}</Text>}
          </View>
        ))}
      </Page>
    </Document>
  );
}

function CoverLetterDocument({
  text,
  jobTitle,
  companyName,
}: {
  text: string;
  jobTitle: string;
  companyName: string;
}) {
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <Document>
      <Page size="LETTER" style={{ ...styles.page, paddingHorizontal: 60 }}>
        <Text style={styles.clName}>{masterProfile.name}</Text>
        <Text style={styles.clContact}>
          {masterProfile.email}  ·  {masterProfile.phone}  ·  {masterProfile.location}
        </Text>
        <Text style={styles.clDate}>{today}</Text>
        <Text style={styles.clSubject}>Re: {jobTitle} at {companyName}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.clBody}>{p.trim()}</Text>
        ))}
        <Text style={styles.clClosing}>Sincerely,</Text>
        <Text style={styles.clSignature}>{masterProfile.name}</Text>
      </Page>
    </Document>
  );
}

export async function generateResumePdf(resume: GeneratedResume): Promise<Buffer> {
  const element = React.createElement(ResumeDocument, { resume }) as React.ReactElement<DocumentProps>;
  return Buffer.from(await renderToBuffer(element));
}

export async function generateCoverLetterPdf(
  text: string,
  jobTitle: string,
  companyName: string
): Promise<Buffer> {
  const element = React.createElement(CoverLetterDocument, { text, jobTitle, companyName }) as React.ReactElement<DocumentProps>;
  return Buffer.from(await renderToBuffer(element));
}
