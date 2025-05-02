"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MeetingsClient } from "./meetings-client"

export function MeetingsWrapper({ session }) {
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch meetings
  const {
    data: meetings,
    error: meetingsError,
    status: meetingsStatus
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      console.log('Fetching meetings...')
      const response = await fetch('http://localhost:1337/api/meetings/?populate=*', { 
        credentials: 'include',
        cache: 'no-store'
      })
      if (!response.ok) {
        console.error('Meetings fetch failed:', response.status, response.statusText)
        throw new Error('Failed to fetch meetings')
      }
      const data = await response.json()
      console.log('Meetings fetched:', data)
      return data.data || []
    }
  })

  if (meetingsStatus === "loading") {
    return <div className="text-xs">Loading meetings...</div>
  }

  if (meetingsError) {
    return (
      <div className="text-xs text-red-500">
        Error: {meetingsError.message}
      </div>
    )
  }

  // Use session user data
  const users = session?.user ? [session.user] : []
  return <MeetingsClient meetings={meetings} users={users} />
} 