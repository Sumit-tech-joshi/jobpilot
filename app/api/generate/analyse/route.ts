import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { analyseJobDescription } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobDescription } = await req.json()
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    await connectDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await Profile.findOne({ userId: session.user.id }).lean() as Record<string, any> | null

    const analysis = await analyseJobDescription(jobDescription)

    // Build a flat set of candidate skills for matching
    const profileSkillSet = new Set<string>()

    if (profile?.skillCategories?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const cat of profile.skillCategories as any[]) {
        if (cat.skills?.length) {
          for (const s of cat.skills) profileSkillSet.add(s.toLowerCase().trim())
        }
      }
    }

    // Also pull skills from experience descriptions/achievements
    const profileText = [
      profile?.summary ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(profile?.experience ?? []).map((e: any) => `${e.description ?? ''} ${(e.achievements ?? []).join(' ')}`),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(profile?.projects ?? []).map((p: any) => `${p.description ?? ''} ${(p.techOrTools ?? []).join(' ')}`),
    ].join(' ').toLowerCase()

    const skillsYouHave: string[] = []
    const skillsYouMiss: string[] = []

    for (const skill of analysis.requiredSkills) {
      const lower = skill.toLowerCase().trim()
      const inSet = profileSkillSet.has(lower)
      const inText = profileText.includes(lower)
      // Also check partial word matches (e.g. "react" matches "reactjs")
      const partialMatch = [...profileSkillSet].some(s => s.includes(lower) || lower.includes(s))
      if (inSet || inText || partialMatch) {
        skillsYouHave.push(skill)
      } else {
        skillsYouMiss.push(skill)
      }
    }

    const matchScore = analysis.requiredSkills.length > 0
      ? Math.round((skillsYouHave.length / analysis.requiredSkills.length) * 100)
      : 0

    return NextResponse.json({
      ...analysis,
      matchScore,
      skillsYouHave,
      skillsYouMiss,
    })
  } catch (err) {
    console.error('[ANALYSE_JD]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
