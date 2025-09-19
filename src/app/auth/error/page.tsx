'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Suspense } from 'react'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid. It may have been used already or it may have expired.',
  Default: 'An error occurred during authentication.',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = errorMessages[error as string] || errorMessages.Default

  return (
    <>
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      </div>
      
      <div className="mt-8">
        <Link
          href="/auth/signin"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </Link>
      </div>
      
      <div className="text-center">
        <Link
          href="/"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Go back to home
        </Link>
      </div>
    </>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Loading...
            </p>
          </div>
        }>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  )
}