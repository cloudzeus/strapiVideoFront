import { NextResponse } from 'next/server'

export async function middleware(request) {
  const token = request.cookies.get('token')?.value
  const userData = request.cookies.get('user')?.value
  const path = request.nextUrl.pathname

  console.log('Middleware - Path:', path)
  console.log('Middleware - Token exists:', !!token)
  console.log('Middleware - UserData exists:', !!userData)

  // Allow access to login page and public assets
  if (path === '/login' || path.startsWith('/_next') || path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // For all other routes, require authentication
  if (!token || !userData) {
    console.log('Middleware - Missing token or user data, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For protected routes, check role
  if (path.startsWith('/admin-')) {
    try {
      const user = JSON.parse(userData)
      if (user.role !== 'Administrator') {
        console.log('Middleware - Non-admin user accessing admin route, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Middleware - Error checking admin access:', error)
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }
  }

  // Add token to API requests
  if (path.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${token}`)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

// Configure the paths that should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 