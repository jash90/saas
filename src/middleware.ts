import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/database.types'

// Define route access patterns
const authRoutes = ['/auth/login', '/auth/register']

// Role-based route mappings
const roleRoutes: Record<UserRole, string> = {
  super_user: '/dashboard/super',
  admin: '/dashboard/admin', 
  employee: '/dashboard/employee'
}

// Route protection patterns
const protectedRoutePatterns = [
  { pattern: /^\/dashboard\/super/, allowedRoles: ['super_user'] as UserRole[] },
  { pattern: /^\/dashboard\/admin/, allowedRoles: ['admin'] as UserRole[] },
  { pattern: /^\/dashboard\/employee/, allowedRoles: ['employee'] as UserRole[] },
] as const

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not available, skipping auth check')
      return NextResponse.next()
    }

    // Create Supabase client and get user
    const { supabase, response, user } = await createMiddlewareClient(request)
    
    // If no authenticated user
    if (!user) {
      // Allow access to auth pages
      if (authRoutes.includes(pathname)) {
        return response
      }
      
      // Redirect to login for protected routes
      if (pathname.startsWith('/dashboard') || pathname === '/') {
        const loginUrl = new URL('/auth/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      
      return response
    }

    // User is authenticated - get user profile data
    let userData = null
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, full_name, role, organization_id')
        .eq('id', user.id)
        .single()
      
      userData = data
    } catch (error) {
      console.error('User data error in middleware:', error)
      // If we can't get user data, redirect to login
      if (!authRoutes.includes(pathname)) {
        const loginUrl = new URL('/auth/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      return response
    }

    if (!userData) {
      // User exists in auth but not in public.users table
      if (!authRoutes.includes(pathname)) {
        const loginUrl = new URL('/auth/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      return response
    }

    // Authenticated user trying to access auth pages - redirect to dashboard
    if (authRoutes.includes(pathname)) {
      const dashboardUrl = new URL(roleRoutes[userData.role as UserRole], request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Root path - redirect to appropriate dashboard
    if (pathname === '/') {
      const dashboardUrl = new URL(roleRoutes[userData.role as UserRole], request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Check role-based access for protected routes
    for (const { pattern, allowedRoles } of protectedRoutePatterns) {
      if (pattern.test(pathname)) {
        if (!allowedRoles.includes(userData.role as UserRole)) {
          // User doesn't have permission - redirect to their dashboard
          const dashboardUrl = new URL(roleRoutes[userData.role as UserRole], request.url)
          return NextResponse.redirect(dashboardUrl)
        }
        break
      }
    }

    // Default dashboard redirect for /dashboard path
    if (pathname === '/dashboard') {
      const dashboardUrl = new URL(roleRoutes[userData.role as UserRole], request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On any error, allow access to auth routes, otherwise redirect to login
    if (authRoutes.includes(pathname)) {
      return NextResponse.next()
    }
    
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
} 