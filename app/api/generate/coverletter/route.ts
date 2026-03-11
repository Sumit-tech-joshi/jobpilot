import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/anthropic';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { GenerateCoverLetterPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverLetterPayload = await request.json();
    const { jobId, jobTitle, jobDescription, companyName } = body;

    if (!jobTitle || !jobDescription || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const coverLetter = await generateCoverLetter(jobTitle, jobDescription, companyName);

    // Save to application record if jobId provided
    if (jobId) {
      await connectDB();
      const savedJob = await Job.findOne({ jobId }).lean();
      if (savedJob) {
        const mongoId = (savedJob as { _id: unknown })._id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (Application as any).findOneAndUpdate(
          { jobId: mongoId },
          {
            $set: { generatedCoverLetter: coverLetter },
            $setOnInsert: { status: 'saved' },
          },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('POST /api/generate/coverletter error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
