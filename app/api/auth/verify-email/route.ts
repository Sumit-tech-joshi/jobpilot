import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// GET /api/auth/verify-email?token=xxx — verify token
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token.' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiry')

    if (!user) {
      return NextResponse.json(
        { error: 'This link is invalid or has expired. Request a new one.' },
        { status: 400 }
      )
    }

    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
    })

    return NextResponse.json({ success: true, email: user.email })
  } catch (err) {
    console.error('[VERIFY_EMAIL]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// POST /api/auth/verify-email — resend verification email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerified +verificationToken +verificationTokenExpiry'
    )

    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ success: true })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'This email is already verified.' }, { status: 400 })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await User.findByIdAndUpdate(user._id, { verificationToken, verificationTokenExpiry })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/confirm?token=${verificationToken}`
    await sendVerificationEmail(user.email, user.name, verificationUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[RESEND_VERIFICATION]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
