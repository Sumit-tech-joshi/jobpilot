import { NextRequest, NextResponse } from 'next/server';
import { generateResumeDocx, generateCoverLetterDocx } from '@/lib/docx-generator';
import { generateResumePdf, generateCoverLetterPdf } from '@/lib/pdf-generator';
import { DownloadPayload, GeneratedResume } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: DownloadPayload = await request.json();
    const { type, format = 'docx', content, jobTitle, companyName } = body;

    if (!type || !content || !jobTitle || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (format === 'pdf') {
      contentType = 'application/pdf';
      if (type === 'resume') {
        const resume: GeneratedResume = typeof content === 'string' ? JSON.parse(content) : content;
        buffer = await generateResumePdf(resume);
        filename = `Sumit_Joshi_Resume_${safeName}.pdf`;
      } else {
        buffer = await generateCoverLetterPdf(content, jobTitle, companyName);
        filename = `Sumit_Joshi_CoverLetter_${safeName}.pdf`;
      }
    } else {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (type === 'resume') {
        const resume: GeneratedResume = typeof content === 'string' ? JSON.parse(content) : content;
        buffer = await generateResumeDocx(resume, jobTitle, companyName);
        filename = `Sumit_Joshi_Resume_${safeName}.docx`;
      } else {
        buffer = await generateCoverLetterDocx(content, jobTitle, companyName);
        filename = `Sumit_Joshi_CoverLetter_${safeName}.docx`;
      }
    }

    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('POST /api/generate/download error:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
