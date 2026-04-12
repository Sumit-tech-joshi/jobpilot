'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Very weak', color: '#f85149' }
  if (score === 2) return { score, label: 'Weak', color: '#d29922' }
  if (score === 3) return { score, label: 'Fair', color: '#e3b341' }
  if (score === 4) return { score, label: 'Good', color: '#3fb950' }
  return { score, label: 'Strong', color: '#3fb950' }
}

function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      return
    }

    // Redirect to verify-email page with email param
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex bg-[#0d1117]">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-[#0d1117] via-[#0e1a2b] to-[#0d1117]">
        <div className="absolute top-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full bg-[#1F4E79]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-[#1F4E79]/8 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-1.5">
          <span className="text-[#1F4E79] font-bold text-2xl tracking-tight">Job</span>
          <span className="text-white font-bold text-2xl tracking-tight">Pilot</span>
          <span className="ml-1 text-xs bg-[#1F4E79]/20 text-[#4a9eda] px-2 py-0.5 rounded-full border border-[#1F4E79]/40">AI</span>
        </div>

        {/* Steps preview */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              Get started in<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a9eda] to-[#79b8ff]">
                minutes.
              </span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed max-w-sm">
              Create your account, build your profile, and start generating job-winning documents.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { step: '01', label: 'Create your free account' },
              { step: '02', label: 'Verify your email' },
              { step: '03', label: 'Set up your profile (2 minutes)' },
              { step: '04', label: 'Generate tailored resumes instantly' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <span className="text-[#1F4E79] font-mono text-xs font-bold opacity-60 shrink-0 w-6">
                  {item.step}
                </span>
                <span className="text-[#c9d1d9] text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#3fb950] text-sm">●</span>
              <span className="text-[#8b949e] text-xs">Free to use</span>
            </div>
            <p className="text-[#c9d1d9] text-sm">
              No credit card required. Start generating documents for free today.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-[#30363d] text-xs">© 2026 JobPilot</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-1.5 mb-10 lg:hidden">
            <span className="text-[#1F4E79] font-bold text-xl">Job</span>
            <span className="text-white font-bold text-xl">Pilot</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">Create your account</h2>
            <p className="text-[#8b949e] text-sm">Free forever. No credit card needed.</p>
          </div>

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
            <div className="flex-1 h-px bg-[#21262d]" />
            <span className="text-[#484f58] text-xs shrink-0">or sign up with email</span>
            <div className="flex-1 h-px bg-[#21262d]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-2">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 bg-[#161b22] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            i <= strength.score ? strength.color : '#21262d',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-2">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-[#161b22] border rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20'
                }`}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-[#1F4E79] hover:bg-[#2563a8] active:bg-[#1a4269] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-[#8b949e] text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4a9eda] hover:text-[#79b8ff] font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[#484f58] text-xs mt-4 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-[#6e7681]">Terms of Service</span> and{' '}
            <span className="text-[#6e7681]">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
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
