import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'super_user':
        redirect('/dashboard/super')
      case 'admin':
        redirect('/dashboard/admin')
      default:
        redirect('/dashboard/employee')
    }
  } else {
    redirect('/auth/login')
  }
}
