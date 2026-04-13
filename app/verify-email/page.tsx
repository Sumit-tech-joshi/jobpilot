'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState('')

  async function handleResend() {
    setResending(true)
    setResendError('')

    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setResending(false)

    if (!res.ok) {
      setResendError(data.error || 'Failed to resend. Please try again.')
      return
    }

    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-12">
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">Job</span>
          <span className="text-white font-bold text-2xl tracking-tight">Pilot</span>
        </div>

        {/* Animated envelope icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-[#6366F1]/10 animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
            <svg className="w-9 h-9 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
        <p className="text-[#94A3B8] leading-relaxed mb-2">
          We sent a verification link to
        </p>
        <p className="text-[#8B5CF6] font-medium mb-8 text-sm">{email}</p>

        {/* Info card */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            'Open the email from JobPilot',
            'Click the "Verify My Email" button',
            'You\'ll be redirected to sign in',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#8B5CF6] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-[#CBD5E1] text-sm">{step}</span>
            </div>
          ))}
        </div>

        {/* Resend */}
        <div className="space-y-3">
          {resent && (
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-emerald-400 text-sm">Verification email sent!</p>
            </div>
          )}

          {resendError && (
            <p className="text-red-400 text-sm">{resendError}</p>
          )}

          <p className="text-[#94A3B8] text-sm">
            Didn&apos;t receive it?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending…' : 'Resend email'}
            </button>
          </p>

          <p className="text-[#475569] text-sm">
            Wrong email?{' '}
            <Link href="/signup" className="text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
              Go back to sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
