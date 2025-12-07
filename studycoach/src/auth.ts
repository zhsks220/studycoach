import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword, toSessionUser } from '@/lib/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        try {
          console.log('[Auth] Looking up user:', credentials.email)
          const user = await getUserByEmail(credentials.email as string)

          if (!user) {
            console.log('[Auth] User not found')
            return null
          }

          console.log('[Auth] User found, verifying password')
          const isValid = await verifyPassword(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            console.log('[Auth] Invalid password')
            return null
          }

          console.log('[Auth] Login successful for:', user.email)
          return toSessionUser(user)
        } catch (error) {
          console.error('[Auth] Error during authentication:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.academyId = user.academyId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.academyId = token.academyId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
