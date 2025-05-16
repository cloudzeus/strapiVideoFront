"use client"

import { useState, useEffect } from "react"
import { MultipleSelector } from "@/components/ui/multiple-selector"
import { Label } from "@/components/ui/label"

export function MeetingUsersSelector({ 
  meeting, 
  onUsersChange,
  disabled = false 
}) {
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${apiUrl}/api/users?populate=*`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const users = await response.json()
        
        if (!Array.isArray(users)) {
          console.error('Invalid response format:', users)
          throw new Error('Invalid response format from API')
        }

        // Filter out users that are already in the meeting
        const meetingUserIds = meeting?.users?.map(user => user.id) || []
        const filteredUsers = users.filter(user => !meetingUserIds.includes(user.id))

        // Map users to the format expected by MultipleSelector
        const userOptions = filteredUsers.map(user => ({
          value: user.id.toString(),
          label: user.email || user.username || 'Anonymous',
          email: user.email || '',
          id: user.id
        }))

        setAvailableUsers(userOptions)
      } catch (error) {
        console.error('Error fetching users:', error)
        setAvailableUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [meeting])

  // Set initial selected users from meeting data
  useEffect(() => {
    if (meeting?.users && Array.isArray(meeting.users)) {
      const initialUsers = meeting.users.map(user => ({
        value: user.id.toString(),
        label: user.email || user.username || 'Anonymous',
        email: user.email || '',
        id: user.id
      }))
      setSelectedUsers(initialUsers)
    } else {
      setSelectedUsers([])
    }
  }, [meeting])

  const handleUsersChange = (newUsers) => {
    setSelectedUsers(newUsers)
    onUsersChange?.(newUsers.map(user => user.id))
  }

  return (
    <div className="space-y-2">
      <Label>Meeting Participants</Label>
      <MultipleSelector
        value={selectedUsers}
        onChange={handleUsersChange}
        defaultOptions={availableUsers}
        placeholder="Select users..."
        disabled={disabled || isLoading}
        emptyIndicator={
          <p className="text-center text-sm text-muted-foreground">
            {isLoading ? "Loading users..." : "No users available."}
          </p>
        }
      />
    </div>
  )
} 