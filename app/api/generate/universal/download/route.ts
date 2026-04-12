import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { generateUniversalResumePdf } from '@/lib/universal-pdf'
import { generateUniversalResumeDocx } from '@/lib/universal-docx'
import { UniversalGeneratedResume } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { format = 'pdf', resume, jobTitle, company } = await req.json()

    if (!resume) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 })
    }

    await connectDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await Profile.findOne({ userId: session.user.id }).lean() as Record<string, any> | null

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const universalResume = resume as UniversalGeneratedResume
    const safeName = ((profile.fullName as string) || 'Resume').replace(/[^a-zA-Z0-9]/g, '_')
    const safeCompany = ((company || jobTitle || 'Document') as string).replace(/[^a-zA-Z0-9]/g, '_')

    let buffer: Buffer
    let contentType: string
    let filename: string

    if (format === 'pdf') {
      buffer = await generateUniversalResumePdf(profile, universalResume)
      contentType = 'application/pdf'
      filename = `${safeName}_Resume_${safeCompany}.pdf`
    } else {
      buffer = await generateUniversalResumeDocx(profile, universalResume)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      filename = `${safeName}_Resume_${safeCompany}.docx`
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error('[UNIVERSAL_DOWNLOAD]', err)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
