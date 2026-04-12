import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Job from '@/models/Job'
import Application from '@/models/Application'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobTitle, company, resumeContent, coverLetterContent } = await req.json()

    if (!jobTitle?.trim() || !company?.trim()) {
      return NextResponse.json({ error: 'Job title and company are required' }, { status: 400 })
    }

    await connectDB()

    // Create a synthetic job record (source = 'manual')
    const jobId = `manual_${session.user.id}_${Date.now()}`
    const job = await Job.create({
      jobId,
      title: jobTitle,
      company,
      location: 'Unknown',
      description: '',
      source: 'adzuna', // use allowed enum value as placeholder
      sourceUrl: '',
      savedAt: new Date(),
    })

    // Create application linked to the job
    const application = await Application.create({
      jobId: job._id,
      status: 'saved',
      generatedResume: resumeContent || undefined,
      generatedCoverLetter: coverLetterContent || undefined,
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (err) {
    console.error('[GENERATE_SAVE]', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
