import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';
import { GeneratedResume } from '@/types';
import { masterProfile } from '@/data/master-profile';

// Shared bullet numbering config
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
              indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
      ],
    },
  ],
};

function bullet(text: string): Paragraph {
  return new Paragraph({
    text,
    numbering: { reference: 'bullet-list', level: 0 },
    spacing: { after: 60 },
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F4E79' },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: '1F4E79',
        size: 22,
      }),
    ],
  });
}

function divider(): Paragraph {
  return new Paragraph({
    text: '',
    spacing: { after: 60 },
  });
}

export async function generateResumeDocx(
  resume: GeneratedResume,
  jobTitle: string,
  companyName: string
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Name header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: masterProfile.name,
          bold: true,
          size: 36,
          color: '1F4E79',
        }),
      ],
    })
  );

  // Contact line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.phone, size: 20 }),
        new TextRun({ text: '  |  ', size: 20, color: '888888' }),
        new TextRun({ text: masterProfile.email, size: 20 }),
        new TextRun({ text: '  |  ', size: 20, color: '888888' }),
        new TextRun({ text: masterProfile.location, size: 20 }),
      ],
    })
  );

  // Links line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: masterProfile.portfolio, size: 18, color: '1F4E79' }),
        new TextRun({ text: '  |  ', size: 18, color: '888888' }),
        new TextRun({ text: masterProfile.linkedin, size: 18, color: '1F4E79' }),
        new TextRun({ text: '  |  ', size: 18, color: '888888' }),
        new TextRun({ text: masterProfile.github, size: 18, color: '1F4E79' }),
      ],
    })
  );

  // Work Permit note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: masterProfile.workPermit, size: 18, italics: true, color: '555555' }),
      ],
    })
  );

  // Summary
  children.push(sectionHeading('Summary'));
  children.push(
    new Paragraph({
      text: resume.summary,
      spacing: { after: 120 },
    })
  );

  // Skills
  children.push(sectionHeading('Skills'));
  const skillGroups: Array<[string, string[]]> = [
    ['Languages', resume.skills.languages],
    ['Frameworks', resume.skills.frameworks],
    ['Databases', resume.skills.databases],
    ['Tools', resume.skills.tools],
    ['Cloud', resume.skills.cloud],
    ['Platforms', resume.skills.platforms],
    ['Practices', resume.skills.practices],
  ];
  for (const [label, items] of skillGroups) {
    if (items && items.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: 20 }),
            new TextRun({ text: items.join(', '), size: 20 }),
          ],
        })
      );
    }
  }

  // Experience
  children.push(sectionHeading('Experience'));
  for (const exp of resume.experience) {
    // Job title + dates
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: exp.title, bold: true, size: 22 }),
          new TextRun({ text: `  |  ${exp.company}`, size: 22, color: '1F4E79' }),
        ],
      })
    );
    // Location + dates
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${exp.location}  |  ${exp.startDate} - ${exp.endDate}`,
            italics: true,
            size: 18,
            color: '666666',
          }),
        ],
      })
    );

    // Projects with bullets
    if (exp.projects) {
      for (const project of exp.projects) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: project.name, bold: true, size: 20, color: '333333' }),
            ],
          })
        );
        for (const b of project.bullets) {
          children.push(bullet(b));
        }
      }
    }

    // General bullets
    if (exp.general) {
      for (const b of exp.general) {
        children.push(bullet(b));
      }
    }

    // Simple bullets
    if (exp.bullets) {
      for (const b of exp.bullets) {
        children.push(bullet(b));
      }
    }

    children.push(divider());
  }

  // Education
  children.push(sectionHeading('Education'));
  for (const edu of resume.education) {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: edu.degree, bold: true, size: 20 }),
        ],
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${edu.institution}  |  ${edu.startDate ? edu.startDate + ' - ' : ''}${edu.endDate}`,
            italics: true,
            size: 18,
            color: '666666',
          }),
        ],
      })
    );
    if (edu.notes) {
      children.push(
        new Paragraph({
          text: edu.notes,
          spacing: { after: 80 },
        })
      );
    }
  }

  const doc = new Document({
    numbering: BULLET_NUMBERING,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function generateCoverLetterDocx(
  coverLetterText: string,
  jobTitle: string,
  companyName: string
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Name header
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.name, bold: true, size: 28, color: '1F4E79' }),
      ],
    })
  );

  // Contact
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.email, size: 20 }),
        new TextRun({ text: '  |  ', size: 20, color: '888888' }),
        new TextRun({ text: masterProfile.phone, size: 20 }),
        new TextRun({ text: '  |  ', size: 20, color: '888888' }),
        new TextRun({ text: masterProfile.location, size: 20 }),
      ],
    })
  );

  // Date
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: today, size: 20 })],
    })
  );

  // Subject line
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: `Re: ${jobTitle} at ${companyName}`, bold: true, size: 22 }),
      ],
    })
  );

  // Body paragraphs — split on double newline
  const paragraphs = coverLetterText.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  for (const para of paragraphs) {
    children.push(
      new Paragraph({
        text: para.trim(),
        spacing: { after: 200 },
      })
    );
  }

  // Closing
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [new TextRun({ text: 'Sincerely,', size: 20 })],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: masterProfile.name, bold: true, size: 20 })],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
