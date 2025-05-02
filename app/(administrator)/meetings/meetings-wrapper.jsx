"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MeetingsClient } from "./meetings-client"

export function MeetingsWrapper({ session, initialUsers }) {
  const [searchQuery, setSearchQuery] = useState("")

  console.log('MeetingsWrapper - initialUsers:', initialUsers)

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

  // Transform users data if needed
  const transformedUsers = initialUsers?.map(user => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role
  })) || []

  console.log('Transformed users:', transformedUsers)

  return <MeetingsClient meetings={meetings} users={transformedUsers} />
} 