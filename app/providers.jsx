"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())
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
        const response = await fetch('/api/auth/session')
        if (!response.ok) {
          throw new Error('No valid session')
        }
      } catch (error) {
        console.error('Session check failed:', error)
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