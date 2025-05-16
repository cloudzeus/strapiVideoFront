import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                      path === '/api/auth/login' || 
                      path === '/api/auth/session' ||
                      path.startsWith('/_next') ||
                      path.startsWith('/static') ||
                      path.startsWith('/api/jitsi') ||
                      path.includes('.')

  // Get the token and user data from cookies
  const token = request.cookies.get('token')?.value
  const userData = request.cookies.get('user')?.value

  // Add CORS headers to all responses
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response
  }

  // If it's a public path, allow access
  if (isPublicPath) {
    return response
  }

  // If there's no token or user data, redirect to login
  if (!token || !userData) {
    // Clear any invalid cookies
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    redirectResponse.cookies.delete('token')
    redirectResponse.cookies.delete('user')
    return redirectResponse
  }

  // For admin routes, check if user is an administrator
  if (path.startsWith('/admin-dashboard') || path.startsWith('/api/admin')) {
    try {
      const user = JSON.parse(userData)
      if (user.role?.type !== 'administrator') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Add token to API requests
  if (path.startsWith('/api/')) {
    response.headers.set('Authorization', `Bearer ${token}`)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 