import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authOptions } from './lib/auth'

/**
 * Middleware to protect dashboard pages and API routes.
 * - Page requests under /dashboard/* will be redirected to /auth/signin when unauthenticated
 * - API requests under /api/* will return 401 JSON when unauthenticated
 *
 * The middleware runs on the Edge (if configured). We use `getToken` which is
 * compatible with Next.js Edge runtime when NEXTAUTH_SECRET is available.
 */
export async function middleware(request: NextRequest) {
  try {
    const { nextUrl, url } = request
    const pathname = nextUrl.pathname

    // Allow static files, _next and public assets through
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public/')
    ) {
      return NextResponse.next()
    }

    // Protect /dashboard pages
    if (pathname.startsWith('/dashboard')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (!token) {
        // Redirect to sign-in preserving the return URL
        const signInUrl = new URL('/auth/signin', url)
        signInUrl.searchParams.set('callbackUrl', url)
        return NextResponse.redirect(signInUrl)
      }
      // Allow authenticated user through
      return NextResponse.next()
    }

    // Allow NextAuth endpoints to flow through (so sign-in/sign-out work)
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    // Protect other API routes
    if (pathname.startsWith('/api')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 })
      }
      return NextResponse.next()
    }

    // All other routes are allowed
    return NextResponse.next()
  } catch (err) {
    console.error('Middleware error:', err)
    return NextResponse.next()
  }
}

export const config = {
  // Run middleware only for dashboard pages and api routes (plus some exclusions handled above)
  matcher: ['/dashboard/:path*', '/api/:path*'],
}