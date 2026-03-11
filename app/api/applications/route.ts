import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function GET() {
  try {
    await connectDB();

    const applications = await Application.find()
      .populate('jobId')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status, appliedDate, notes, generatedResume, generatedCoverLetter } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    await connectDB();

    // Resolve to MongoDB _id if jobId is the API string id
    let mongoJobId = jobId;
    if (typeof jobId === 'string' && !jobId.match(/^[0-9a-fA-F]{24}$/)) {
      const job = await Job.findOne({ jobId }).lean();
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      mongoJobId = (job as { _id: unknown })._id;
    }

    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (appliedDate) update.appliedDate = new Date(appliedDate);
    if (notes !== undefined) update.notes = notes;
    if (generatedResume) update.generatedResume = generatedResume;
    if (generatedCoverLetter) update.generatedCoverLetter = generatedCoverLetter;

    const application = await Application.findOneAndUpdate(
      { jobId: mongoJobId },
      { $set: update, $setOnInsert: { status: status || 'saved' } },
      { upsert: true, new: true }
    ).populate('jobId');

    return NextResponse.json({ application });
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await connectDB();
    await Application.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/applications error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
