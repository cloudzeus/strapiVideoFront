"use client"

import { useState, useEffect } from "react"
import { MeetingsClient } from "./meetings-client"
import { toast } from "sonner"

export function MeetingsWrapper({ initialMeetings = [], initialUsers = [] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [meetings, setMeetings] = useState(initialMeetings)
  const [users, setUsers] = useState(initialUsers)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchMeetings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${apiUrl}/api/meetings?populate=*`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error?.message || `Failed to fetch meetings: ${response.status}`)
      }

      const data = await response.json()
      console.log('Fetched meetings:', data)

      if (!data.data) {
        throw new Error('Invalid meetings data received')
      }

      setMeetings(data.data)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <MeetingsClient 
      meetings={meetings} 
      users={users} 
      onMeetingUpdate={fetchMeetings}
    />
  )
} 