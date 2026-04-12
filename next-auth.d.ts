import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      onboardingComplete: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    onboardingComplete: boolean
    // Data passed via update({ ... }) from the client
    onboardingComplete?: boolean
  }
}
