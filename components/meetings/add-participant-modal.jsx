"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleSelector } from "@/components/ui/multiple-selector"
import { toast } from "sonner"

// Participant role enum
const PARTICIPANT_ROLES = {
  MODERATOR: "moderator",
  ATTENDEE: "attendee"
}

export function AddParticipantModal({ 
  open, 
  onOpenChange, 
  meeting,
  users = [],
  onSave 
}) {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [role, setRole] = useState(PARTICIPANT_ROLES.ATTENDEE)
  const [existingParticipants, setExistingParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && meeting) {
      console.log('Modal opened with meeting:', meeting)
      console.log('Raw users data:', users)
      fetchExistingParticipants()
    }
  }, [open, meeting, users])

  const fetchExistingParticipants = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        toast.error('Authentication required')
        return
      }

      console.log('Fetching participants for meeting:', meeting.id)
      console.log('Using token:', token)

      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/participants?filters[meeting][id][$eq]=${meeting.id}&populate=user`
      console.log('Fetching from URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to fetch participants: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched existing participants:', data)
      setExistingParticipants(data.data || [])
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast.error(error.message || 'Failed to fetch existing participants')
    } finally {
      setIsLoading(false)
    }
  }

  // Get IDs of users who are already participants
  const existingParticipantIds = existingParticipants.map(
    participant => participant.attributes?.user?.data?.id
  ).filter(Boolean)

  console.log('Existing participant IDs:', existingParticipantIds)

  // Filter out users who are already participants
  const availableUsers = users.filter(user => !existingParticipantIds.includes(user.id))
  console.log('Available users after filtering:', availableUsers)

  // Format users for the multiple selector
  const userOptions = availableUsers.map(user => {
    const displayName = user.name || user.username || 'Unknown User'
    const departmentName = user.department?.name || 'No Department'
    const option = {
      label: (
        <div className="text-[10px]">
          <div>{displayName}</div>
          <div>{user.email}</div>
          <div>{departmentName}</div>
        </div>
      ),
      value: user.id.toString(),
      email: user.email,
      department: departmentName,
      role: user.role,
      searchText: `${displayName} ${user.email} ${departmentName}`.toLowerCase()
    }
    console.log('Created option:', option)
    return option
  })

  const handleUserSelect = async (selectedOption) => {
    try {
      const selectedUser = users.find(u => u.id.toString() === selectedOption.value)
      const participant = {
        data: {
          user: selectedUser.id,
          meeting: meeting.id,
          participantRole: role,
          ...(selectedUser.department?.id && { department: selectedUser.department.id })
        }
      }

      console.log('Adding participant:', participant)
      await onSave([participant])
      
      // Add to selected users
      setSelectedUsers(prev => [...prev, selectedOption])
      
      toast.success("Participant added successfully")
    } catch (error) {
      console.error('Error adding participant:', error)
      toast.error(error.message || "Failed to add participant")
    }
  }

  const handleUserUnselect = async (unselectedOption) => {
    try {
      // Remove from selected users
      setSelectedUsers(prev => prev.filter(user => user.value !== unselectedOption.value))
      
      // TODO: Add API call to remove participant
      toast.success("Participant removed")
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error(error.message || "Failed to remove participant")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Participants</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="users">Select Users</Label>
            <MultipleSelector
              value={selectedUsers}
              onChange={setSelectedUsers}
              defaultOptions={userOptions}
              placeholder="Select users..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  {isLoading ? "Loading users..." : "No users available"}
                </p>
              }
              onSelect={handleUserSelect}
              onUnselect={handleUserUnselect}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PARTICIPANT_ROLES.MODERATOR}>Moderator</SelectItem>
                <SelectItem value={PARTICIPANT_ROLES.ATTENDEE}>Attendee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 