import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 Authorize function called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password 
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log('🔍 Looking for user in database...')
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              status: true,
              image: true
            }
          })

          console.log('🔍 User found:', { 
            exists: !!user, 
            email: user?.email, 
            hasPassword: !!user?.password,
            status: user?.status 
          })

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            return null
          }

          console.log('🔍 Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔍 Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          if (user.status !== 'ACTIVE') {
            console.log('❌ User not active, status:', user.status)
            return null
          }

          console.log('✅ Login successful for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          }
        } catch (error) {
          console.error('❌ Database error during authorization:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔍 JWT callback called:', { hasUser: !!user, tokenSub: token.sub })
      if (user) {
        token.role = user.role
        console.log('✅ JWT token updated with role:', user.role)
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔍 Session callback called:', { 
        hasSession: !!session, 
        hasToken: !!token, 
        tokenSub: token.sub 
      })
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        console.log('✅ Session updated:', { 
          userId: session.user.id, 
          userRole: session.user.role 
        })
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
}
