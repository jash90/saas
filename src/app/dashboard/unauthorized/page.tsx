import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Shield className="mx-auto h-24 w-24 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
} 