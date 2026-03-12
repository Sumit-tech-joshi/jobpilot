import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
} from 'docx';
import { GeneratedResume } from '@/types';
import { masterProfile } from '@/data/master-profile';

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
};

// 11pt = 22 half-points (standard resume body size)
const BODY_SIZE = 22;
const SMALL_SIZE = 20;
const NAME_SIZE = 52;
const CONTACT_SIZE = 19;
const SECTION_SIZE = 22;

function bullet(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'bullet-list', level: 0 },
    spacing: { after: 40, before: 0 },
    children: [new TextRun({ text, size: BODY_SIZE })],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F4E79' },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: '1F4E79',
        size: SECTION_SIZE,
        font: 'Calibri',
      }),
    ],
  });
}

export async function generateResumeDocx(
  resume: GeneratedResume,
  jobTitle: string,
  companyName: string
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ── Name ──────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: masterProfile.name,
          bold: true,
          size: NAME_SIZE,
          color: '1F4E79',
          font: 'Calibri',
        }),
      ],
    })
  );

  // ── Contact line ──────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.phone, size: CONTACT_SIZE, font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.email, size: CONTACT_SIZE, font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.location, size: CONTACT_SIZE, font: 'Calibri' }),
      ],
    })
  );

  // ── Links line ────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: masterProfile.portfolio, size: CONTACT_SIZE, color: '1F4E79', font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.linkedin, size: CONTACT_SIZE, color: '1F4E79', font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: CONTACT_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.github, size: CONTACT_SIZE, color: '1F4E79', font: 'Calibri' }),
      ],
    })
  );

  // ── Work permit ───────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: masterProfile.workPermit,
          size: CONTACT_SIZE,
          italics: true,
          color: '555555',
          font: 'Calibri',
        }),
      ],
    })
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  children.push(sectionHeading('Professional Summary'));
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: resume.summary, size: BODY_SIZE, font: 'Calibri' })],
    })
  );

  // ── Skills ────────────────────────────────────────────────────────────────
  children.push(sectionHeading('Technical Skills'));
  const skillGroups: Array<[string, string[]]> = [
    ['Languages', resume.skills.languages],
    ['Frameworks & Libraries', resume.skills.frameworks],
    ['Databases', resume.skills.databases],
    ['Tools & DevOps', resume.skills.tools],
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
            new TextRun({ text: `${label}: `, bold: true, size: BODY_SIZE, font: 'Calibri' }),
            new TextRun({ text: items.join(', '), size: BODY_SIZE, font: 'Calibri' }),
          ],
        })
      );
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────
  children.push(sectionHeading('Professional Experience'));
  for (const exp of resume.experience) {
    // Title left, dates right using tab stop
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: exp.title, bold: true, size: BODY_SIZE, font: 'Calibri' }),
          new TextRun({ text: '\t', size: BODY_SIZE }),
          new TextRun({
            text: `${exp.startDate} – ${exp.endDate}`,
            size: SMALL_SIZE,
            color: '555555',
            font: 'Calibri',
          }),
        ],
      })
    );
    // Company | Location
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: exp.company,
            size: SMALL_SIZE,
            italics: true,
            color: '1F4E79',
            font: 'Calibri',
          }),
          new TextRun({ text: '  ·  ', size: SMALL_SIZE, color: '888888', font: 'Calibri' }),
          new TextRun({
            text: exp.location,
            size: SMALL_SIZE,
            italics: true,
            color: '666666',
            font: 'Calibri',
          }),
        ],
      })
    );

    // Projects
    if (exp.projects) {
      for (const project of exp.projects) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: project.name,
                bold: true,
                size: SMALL_SIZE,
                color: '333333',
                font: 'Calibri',
              }),
            ],
          })
        );
        for (const b of project.bullets) {
          children.push(bullet(b));
        }
      }
    }

    if (exp.general) {
      for (const b of exp.general) children.push(bullet(b));
    }
    if (exp.bullets) {
      for (const b of exp.bullets) children.push(bullet(b));
    }

    // Small gap between jobs
    children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
  }

  // ── Education ─────────────────────────────────────────────────────────────
  children.push(sectionHeading('Education'));
  for (const edu of resume.education) {
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: edu.degree, bold: true, size: BODY_SIZE, font: 'Calibri' }),
          new TextRun({ text: '\t', size: BODY_SIZE }),
          new TextRun({
            text: `${edu.startDate ? edu.startDate + ' – ' : ''}${edu.endDate}`,
            size: SMALL_SIZE,
            color: '555555',
            font: 'Calibri',
          }),
        ],
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: edu.institution,
            size: SMALL_SIZE,
            italics: true,
            color: '666666',
            font: 'Calibri',
          }),
        ],
      })
    );
    if (edu.notes) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: edu.notes, size: SMALL_SIZE, font: 'Calibri' })],
        })
      );
    }
  }

  const doc = new Document({
    numbering: BULLET_NUMBERING,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: BODY_SIZE },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.7),
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

  // ── Header ────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: masterProfile.name,
          bold: true,
          size: 36,
          color: '1F4E79',
          font: 'Calibri',
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.email, size: SMALL_SIZE, font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: SMALL_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.phone, size: SMALL_SIZE, font: 'Calibri' }),
        new TextRun({ text: '  ·  ', size: SMALL_SIZE, color: '888888', font: 'Calibri' }),
        new TextRun({ text: masterProfile.location, size: SMALL_SIZE, font: 'Calibri' }),
      ],
    })
  );

  // ── Date ──────────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  children.push(
    new Paragraph({
      spacing: { before: 240, after: 240 },
      children: [new TextRun({ text: today, size: BODY_SIZE, font: 'Calibri' })],
    })
  );

  // ── Subject ───────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Re: ${jobTitle} at ${companyName}`,
          bold: true,
          size: BODY_SIZE,
          font: 'Calibri',
        }),
      ],
    })
  );

  // ── Body ──────────────────────────────────────────────────────────────────
  const paragraphs = coverLetterText.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  for (const para of paragraphs) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: para.trim(), size: BODY_SIZE, font: 'Calibri' })],
      })
    );
  }

  // ── Closing ───────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: 'Sincerely,', size: BODY_SIZE, font: 'Calibri' })],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: masterProfile.name, bold: true, size: BODY_SIZE, font: 'Calibri' }),
      ],
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: BODY_SIZE },
        },
      },
    },
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
