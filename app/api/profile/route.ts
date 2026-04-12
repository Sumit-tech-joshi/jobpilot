import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const profile = await Profile.findOne({ userId: session.user.id }).lean()

    if (!profile) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[PROFILE_GET]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    // Use $set so partial section saves don't wipe other fields
    const profile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[PROFILE_PUT]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
