import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { generateUniversalResume, generateUniversalCoverLetter, TWEAK_PROMPTS } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobDescription, jobTitle, company, type, tone = 'professional', tweak } = await req.json()

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }
    if (!['resume', 'coverletter', 'both'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    await connectDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await Profile.findOne({ userId: session.user.id }).lean() as Record<string, any> | null

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Please complete your profile first.' }, { status: 404 })
    }

    const tweakPrompt = tweak ? TWEAK_PROMPTS[tweak] : undefined
    const resolvedTitle = jobTitle || 'the role'
    const resolvedCompany = company || 'the company'

    const result: { resume?: unknown; coverLetter?: string } = {}

    if (type === 'resume' || type === 'both') {
      result.resume = await generateUniversalResume(profile, jobDescription, resolvedTitle, resolvedCompany, tweakPrompt)
    }

    if (type === 'coverletter' || type === 'both') {
      result.coverLetter = await generateUniversalCoverLetter(profile, jobDescription, resolvedTitle, resolvedCompany, tone, tweakPrompt)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[GENERATE_UNIVERSAL]', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
