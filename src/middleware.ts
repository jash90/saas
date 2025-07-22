import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase credentials are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          )
        },
      },
    }
  )

  try {
    // Refresh session if needed
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // If auth fails, continue without redirects
    if (authError) {
      console.error('Auth error in middleware:', authError)
      return NextResponse.next()
    }

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
    const isSuperUserPage = request.nextUrl.pathname.startsWith('/dashboard/super')
    const isAdminPage = request.nextUrl.pathname.startsWith('/dashboard/admin')
    const isEmployeePage = request.nextUrl.pathname.startsWith('/dashboard/employee')

    // Redirect unauthenticated users to login
    if (!user && isDashboardPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (user && isAuthPage) {
      // Get user role to determine redirect destination
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('User data error in middleware:', userError)
        // Fallback to employee role if database query fails
        return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      }

      const role = userData?.role || 'employee'
      
      switch (role) {
        case 'super_user':
          return NextResponse.redirect(new URL('/dashboard/super', request.url))
        case 'admin':
          return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        default:
          return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      }
    }

    // Role-based access control for dashboard pages
    if (user && isDashboardPage) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('User data error in middleware:', userError)
        // Allow access to employee pages if database query fails
        if (isEmployeePage) {
          return NextResponse.next()
        }
        // Redirect to employee dashboard as fallback
        return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      }

      const role = userData?.role || 'employee'

      // Super user pages
      if (isSuperUserPage && role !== 'super_user') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
      }

      // Admin pages
      if (isAdminPage && !['super_user', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
      }

      // Employee pages - allow if role is employee or if database query failed
      if (isEmployeePage && role !== 'employee' && !['super_user', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
      }

      // Redirect to appropriate dashboard based on role (only for exact /dashboard path)
      if (request.nextUrl.pathname === '/dashboard') {
        switch (role) {
          case 'super_user':
            return NextResponse.redirect(new URL('/dashboard/super', request.url))
          case 'admin':
            return NextResponse.redirect(new URL('/dashboard/admin', request.url))
          default:
            return NextResponse.redirect(new URL('/dashboard/employee', request.url))
        }
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Continue without redirects if there are any unexpected errors
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 