'use client'

import NextDynamic from 'next/dynamic'
import { Suspense } from 'react'

const LoginForm = NextDynamic(() => import('@/components/auth/login-form').then(mod => ({ default: mod.LoginForm })), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your RBAC dashboard
          </p>
        </div>
        <Suspense fallback={
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
} 