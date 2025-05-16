import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const userData = request.cookies.get('userData')?.value

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // If the user is not logged in and trying to access a protected route
  if (!token && !path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user is logged in and trying to access the login page
  if (token && path === '/login') {
    try {
      const user = userData ? JSON.parse(userData) : null
      const userRole = user?.role?.name

      // If user is an admin, redirect to admin dashboard
      if (userRole === 'Administrator') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url))
      }

      // For non-admin users, redirect to their dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      // If there's an error parsing userData, clear the cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('userData')
      return response
    }
  }

  return NextResponse.next()
}

// Configure the paths that should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 