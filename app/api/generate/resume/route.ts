import { NextRequest, NextResponse } from 'next/server';
import { generateResume } from '@/lib/anthropic';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { GenerateResumePayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateResumePayload = await request.json();
    const { jobId, jobTitle, jobDescription, companyName } = body;

    if (!jobTitle || !jobDescription || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resume = await generateResume(jobTitle, jobDescription, companyName);

    // Save generated resume to the application record if jobId provided
    if (jobId) {
      await connectDB();
      const savedJob = await Job.findOne({ jobId }).lean();
      if (savedJob) {
        const mongoId = (savedJob as { _id: unknown })._id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (Application as any).findOneAndUpdate(
          { jobId: mongoId },
          {
            $set: { generatedResume: JSON.stringify(resume) },
            $setOnInsert: { status: 'saved' },
          },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('POST /api/generate/resume error:', error);
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 });
  }
}
