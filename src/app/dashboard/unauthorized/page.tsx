'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Shield, ArrowLeft } from 'lucide-react'
import { getRoleDisplayName } from '@/lib/permissions'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-yellow-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
                  <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this area of the dashboard.
        </p>
          {session?.user?.role && (
            <p className="mt-1 text-xs text-gray-500">
              Your role: {getRoleDisplayName(session.user.role as any)}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in with different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}