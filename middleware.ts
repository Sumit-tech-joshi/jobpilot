import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect authenticated users with incomplete onboarding to /onboarding
    if (token && !token.onboardingComplete && !pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token
      },
    },
  }
)

export const config = {
  // Protect all routes except auth pages, api/auth, and static files
  matcher: [
    '/((?!login|signup|verify-email|api/auth|_next/static|_next/image|favicon\\.ico).*)',
  ],
}
