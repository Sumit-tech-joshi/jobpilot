'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/generate', label: 'Generate' },
  { href: '/applications', label: 'Applications' },
]

const hideNavOn = ['/login', '/signup', '/verify-email', '/onboarding']

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside — must be before early return
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Hide navbar on auth and onboarding pages
  if (hideNavOn.some((p) => pathname.startsWith(p))) return null

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080C14]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">Job</span>
          <span className="text-white font-bold text-xl tracking-tight">Pilot</span>
          <span className="ml-1 text-xs bg-[#6366F1]/10 text-[#8B5CF6] px-2 py-0.5 rounded-full border border-[#6366F1]/30">
            AI
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#6366F1]/10 text-[#8B5CF6] border border-[#6366F1]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-xl hover:bg-white/[0.04] transition-colors group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#6366F1]/30 group-hover:ring-[#6366F1]/60 transition-all overflow-hidden">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {/* Name (desktop) */}
            <span className="hidden md:block text-sm text-gray-300 max-w-[120px] truncate">
              {session?.user?.name?.split(' ')[0] ?? 'Account'}
            </span>
            {/* Chevron */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D1424] border border-white/[0.07] rounded-xl shadow-xl shadow-black/60 overflow-hidden z-[100]">
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                <p className="text-xs text-[#94A3B8] truncate mt-0.5">{session?.user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link
                  href="/generate"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Documents
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-white/[0.05] py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
