import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { industry, headline, location, workAuthorization, experience, education, skillCategories } = body

    await connectDB()

    // Upsert profile
    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        fullName: session.user.name,
        email: session.user.email,
        headline,
        location,
        workAuthorization,
        ...(skillCategories?.length > 0 && { skillCategories }),
        ...(experience && { experience: [experience] }),
        ...(education && { education: [education] }),
      },
      { upsert: true, new: true }
    )

    // Mark onboarding complete and save industry
    await User.findByIdAndUpdate(session.user.id, {
      onboardingComplete: true,
      industry,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ONBOARDING]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
