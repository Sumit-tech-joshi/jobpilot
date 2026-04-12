import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
} from 'docx'
import { UniversalGeneratedResume } from '@/lib/anthropic'

const BULLET_NUMBERING = {
  config: [
    {
      reference: 'bullet-list',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.15) },
            },
          },
        },
      ],
    },
  ],
}

const BODY_SIZE = 22
const SMALL_SIZE = 20
const NAME_SIZE = 52
const CONTACT_SIZE = 19
const SECTION_SIZE = 22

function bullet(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'bullet-list', level: 0 },
    spacing: { after: 40, before: 0 },
    children: [new TextRun({ text, size: BODY_SIZE, font: 'Calibri' })],
  })
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F4E79' } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: '1F4E79', size: SECTION_SIZE, font: 'Calibri' })],
  })
}

export async function generateUniversalResumeDocx(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>,
  resume: UniversalGeneratedResume
): Promise<Buffer> {
  const children: Paragraph[] = []

  // Name
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: profile.fullName || 'Resume', bold: true, size: NAME_SIZE, color: '1F4E79', font: 'Calibri' })],
  }))

  // Contact line
  const contactParts: TextRun[] = []
  const contactItems = [profile.phone, profile.email, profile.location].filter(Boolean)
  contactItems.forEach((item, i) => {
    if (i > 0) contactParts.push(new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }))
    contactParts.push(new TextRun({ text: item, size: CONTACT_SIZE, font: 'Calibri' }))
  })
  if (contactParts.length) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: contactParts }))
  }

  // Links line
  const linkItems = [profile.portfolio, profile.linkedin, profile.github, profile.website].filter(Boolean)
  if (linkItems.length) {
    const linkParts: TextRun[] = []
    linkItems.forEach((item, i) => {
      if (i > 0) linkParts.push(new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }))
      linkParts.push(new TextRun({ text: item, size: CONTACT_SIZE, color: '1F4E79', font: 'Calibri' }))
    })
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: linkParts }))
  }

  // Work authorization
  if (profile.workAuthorization) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: profile.workAuthorization, size: SMALL_SIZE, color: '888888', italics: true, font: 'Calibri' })],
    }))
  }

  // Summary
  if (resume.summary) {
    children.push(sectionHeading('Professional Summary'))
    children.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: resume.summary, size: BODY_SIZE, font: 'Calibri' })],
    }))
  }

  // Skills
  if (resume.skillSections?.length) {
    children.push(sectionHeading('Skills'))
    for (const sec of resume.skillSections) {
      if (!sec.skills?.length) continue
      children.push(new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: `${sec.categoryName}: `, bold: true, size: BODY_SIZE, font: 'Calibri' }),
          new TextRun({ text: sec.skills.join(', '), size: BODY_SIZE, color: '444444', font: 'Calibri' }),
        ],
      }))
    }
  }

  // Experience
  if (resume.experience?.length) {
    children.push(sectionHeading('Experience'))
    for (const exp of resume.experience) {
      // Title + dates
      children.push(new Paragraph({
        spacing: { before: 120, after: 20 },
        children: [
          new TextRun({ text: exp.jobTitle, bold: true, size: BODY_SIZE + 2, font: 'Calibri' }),
          new TextRun({ text: `  ·  ${exp.employer}`, size: BODY_SIZE, color: '1F4E79', font: 'Calibri' }),
          ...(exp.location ? [new TextRun({ text: `, ${exp.location}`, size: SMALL_SIZE, color: '555555', font: 'Calibri' })] : []),
        ],
      }))
      children.push(new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: exp.dates, size: SMALL_SIZE, color: '888888', italics: true, font: 'Calibri' })],
      }))
      for (const b of exp.bullets) children.push(bullet(b))
    }
  }

  // Education
  if (resume.education?.length) {
    children.push(sectionHeading('Education'))
    for (const e of resume.education) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 20 },
        children: [
          new TextRun({ text: e.credential, bold: true, size: BODY_SIZE, font: 'Calibri' }),
          new TextRun({ text: `  ·  ${e.institution}`, size: BODY_SIZE, color: '555555', font: 'Calibri' }),
          ...(e.location ? [new TextRun({ text: `, ${e.location}`, size: SMALL_SIZE, color: '888888', font: 'Calibri' })] : []),
        ],
      }))
      children.push(new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: e.dates, size: SMALL_SIZE, color: '888888', italics: true, font: 'Calibri' })],
      }))
      if (e.notes) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: e.notes, size: SMALL_SIZE, color: '666666', font: 'Calibri' })],
        }))
      }
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    children.push(sectionHeading('Certifications'))
    for (const c of resume.certifications) {
      children.push(new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: c.name, bold: true, size: BODY_SIZE, font: 'Calibri' }),
          new TextRun({ text: `  ·  ${c.issuingBody}`, size: BODY_SIZE, color: '555555', font: 'Calibri' }),
          ...(c.dates ? [new TextRun({ text: `  (${c.dates})`, size: SMALL_SIZE, color: '888888', font: 'Calibri' })] : []),
        ],
      }))
    }
  }

  // Projects
  if (resume.projects?.length) {
    children.push(sectionHeading('Projects'))
    for (const p of resume.projects) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 20 },
        children: [new TextRun({ text: p.name, bold: true, size: BODY_SIZE, font: 'Calibri' })],
      }))
      if (p.description) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: p.description, size: SMALL_SIZE, color: '555555', italics: true, font: 'Calibri' })],
        }))
      }
      for (const b of p.bullets) children.push(bullet(b))
    }
  }

  const doc = new Document({
    numbering: BULLET_NUMBERING,
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 900, right: 900 },
        },
      },
      children,
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
