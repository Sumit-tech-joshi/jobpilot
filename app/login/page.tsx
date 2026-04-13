'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const verified = searchParams.get('verified') === 'true'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error === 'EMAIL_NOT_VERIFIED') {
      setError('Please verify your email first. Check your inbox for the verification link.')
      return
    }

    if (result?.error) {
      setError('Invalid email or password.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex bg-[#080C14]">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-[#080C14] via-[#0D1020] to-[#080C14]">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-[#06B6D4]/8 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-1.5">
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">Job</span>
          <span className="text-white font-bold text-2xl tracking-tight">Pilot</span>
          <span className="ml-1 text-xs bg-[#6366F1]/10 text-[#8B5CF6] px-2 py-0.5 rounded-full border border-[#6366F1]/30">AI</span>
        </div>

        {/* Hero text + features */}
        <div className="relative z-10 space-y-10">
          <div>
            <h1 className="text-[42px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              Your career,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4]">
                on autopilot.
              </span>
            </h1>
            <p className="text-[#94A3B8] text-lg leading-relaxed max-w-sm">
              AI-powered resumes and cover letters tailored for any job, anywhere in the world.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: '✦', label: 'Tailored resume in under 30 seconds' },
              { icon: '✦', label: 'Cover letters that sound like you' },
              { icon: '✦', label: 'Works for any industry, any country' },
              { icon: '✦', label: 'Track every application in one place' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-[#8B5CF6] text-xs mt-0.5 shrink-0">{f.icon}</span>
                <span className="text-[#CBD5E1] text-sm">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial / trust */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-[#CBD5E1] text-sm leading-relaxed italic">
              &ldquo;Generated a tailored resume for a nursing role in 20 seconds. Landed the interview the next day.&rdquo;
            </p>
            <p className="text-[#475569] text-xs mt-3">— JobPilot user</p>
          </div>
        </div>

        <p className="relative z-10 text-[#1e293b] text-xs">© 2026 JobPilot</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 md:p-12 bg-[#0D1020]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-1.5 mb-10 lg:hidden">
            <span className="font-bold text-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">Job</span>
            <span className="text-white font-bold text-xl">Pilot</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">Welcome back</h2>
            <p className="text-[#94A3B8] text-sm">Sign in to your account to continue</p>
          </div>

          {/* Email verified success */}
          {verified && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <span className="text-emerald-400 mt-0.5 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-emerald-400 text-sm leading-relaxed">
                Email verified! You can now sign in and set up your profile.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl">
              <span className="text-red-400 mt-0.5 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="text-red-400 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[#475569] text-xs shrink-0">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#080C14] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 rounded-xl text-white placeholder-[#475569] outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-[#080C14] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 rounded-xl text-white placeholder-[#475569] outline-none transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 active:opacity-80 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-[#6366F1]/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-[#94A3B8] text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

/* ── Icons ── */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  )
}
