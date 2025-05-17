"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
        retry: 1
      }
    }
  }))
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip session check for login page and public routes
    if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
      return
    }

    // Check for session on client-side
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error('No valid session')
        }
        
        const data = await response.json()
        if (!data.user || !data.token) {
          throw new Error('Invalid session data')
        }

        // For admin routes, check if user is an administrator
        if ((pathname.startsWith('/admin-dashboard') || pathname.startsWith('/api/admin')) && 
            data.user.role?.type !== 'administrator') {
          router.push('/dashboard')
          return
        }

        // If we're on the login page but have a valid session, redirect to appropriate dashboard
        if (pathname === '/login') {
          if (data.user.role?.type === 'administrator') {
            router.push('/admin-dashboard')
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
        // Clear any invalid session data
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        // Only redirect if not already on login page
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
    }

    checkSession()
  }, [router, pathname])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 