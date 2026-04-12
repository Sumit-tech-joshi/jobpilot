import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import connectDB from './mongodb'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
          '+password +emailVerified'
        )

        if (!user || !user.password) return null

        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image || null,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB()
        const existing = await User.findOne({ email: user.email })

        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: true,
            provider: 'google',
            onboardingComplete: false,
          })
        } else {
          // Keep image in sync for Google users
          await User.findByIdAndUpdate(existing._id, { image: user.image })
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Called on sign-in: hydrate token from DB
        await connectDB()
        const dbUser = await User.findOne({ email: user.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.onboardingComplete = dbUser.onboardingComplete
        }
      }

      if (trigger === 'update' && session) {
        // Client passed data directly via update({ ... }) — no DB call needed
        if (session.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.onboardingComplete = token.onboardingComplete
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}
