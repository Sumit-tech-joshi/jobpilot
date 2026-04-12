'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'error'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token found. Please use the link from your email.')
      return
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMsg(data.error || 'Verification failed. Please request a new link.')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Something went wrong. Please try again.')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-12">
          <span className="text-[#1F4E79] font-bold text-2xl tracking-tight">Job</span>
          <span className="text-white font-bold text-2xl tracking-tight">Pilot</span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1F4E79]/10 border border-[#1F4E79]/20 flex items-center justify-center mx-auto">
              <span className="w-7 h-7 border-2 border-[#1F4E79]/30 border-t-[#4a9eda] rounded-full animate-spin block" />
            </div>
            <h1 className="text-xl font-bold text-white">Verifying your email…</h1>
            <p className="text-[#8b949e] text-sm">This will only take a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            {/* Checkmark */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Email verified!</h1>
              <p className="text-[#8b949e] leading-relaxed">
                Your account is active. Sign in to set up your profile and start generating job-winning documents.
              </p>
            </div>

            <Link
              href="/login?verified=true"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#1F4E79] hover:bg-[#2563a8] text-white font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Continue to Sign In
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            {/* X icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification failed</h1>
              <p className="text-[#8b949e] leading-relaxed text-sm">{errorMsg}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-[#1F4E79] hover:bg-[#2563a8] text-white font-semibold rounded-xl transition-all duration-200 text-sm"
              >
                Back to Sign Up
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-[#c9d1d9] font-medium rounded-xl transition-all duration-200 text-sm"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
