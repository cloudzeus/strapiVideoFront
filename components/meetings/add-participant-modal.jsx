"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleSelector } from "@/components/ui/multiple-selector"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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
      fetchExistingParticipants()
    }
  }, [open, meeting])

  const fetchExistingParticipants = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/participants?filters[meeting][id][$eq]=${meeting.id}&populate=user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      setExistingParticipants(data.data || [])
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast.error('Failed to fetch existing participants')
    }
  }

  // Filter out users who are already participants
  const availableUsers = users.filter(user => 
    !existingParticipants.some(participant => 
      participant.attributes?.user?.data?.id === user.id
    )
  )

  const userOptions = availableUsers.map(user => {
    const displayName = user.attributes?.username || user.username || 'Unknown User'
    const departmentName = user.attributes?.department?.name || 'No Department'
    return {
      label: (
        <div className="text-[10px]">
          <div>{displayName}</div>
          <div>{user.attributes?.email || user.email}</div>
          <div>{departmentName}</div>
        </div>
      ),
      value: user.id.toString(),
      email: user.attributes?.email || user.email,
      department: departmentName,
      role: user.attributes?.role || user.role,
      searchText: `${displayName} ${user.attributes?.email || user.email} ${departmentName}`.toLowerCase()
    }
  })

  const handleUserSelect = async (selectedOption) => {
    try {
      setIsLoading(true)
      const selectedUser = users.find(u => u.id.toString() === selectedOption.value)
      const participant = {
        data: {
          user: selectedUser.id,
          meeting: meeting.id,
          participantRole: role,
          ...(selectedUser.attributes?.department?.id && { department: selectedUser.attributes.department.id })
        }
      }

      await onSave([participant])
      
      // Add to selected users
      setSelectedUsers(prev => [...prev, selectedOption])
      
      // Refresh existing participants
      await fetchExistingParticipants()
      
      toast.success("Participant added successfully")
    } catch (error) {
      console.error('Error adding participant:', error)
      toast.error(error.message || "Failed to add participant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserUnselect = async (unselectedOption) => {
    try {
      setIsLoading(true)
      // Remove from selected users
      setSelectedUsers(prev => prev.filter(user => user.value !== unselectedOption.value))
      
      // TODO: Add API call to remove participant
      toast.success("Participant removed")
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error(error.message || "Failed to remove participant")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Participants</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {existingParticipants.length > 0 && (
            <div className="space-y-2">
              <Label>Current Participants</Label>
              <div className="flex flex-wrap gap-2">
                {existingParticipants.map((participant) => (
                  <Badge key={participant.id} variant="secondary">
                    {participant.attributes?.user?.data?.attributes?.username || 'Anonymous'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select User</Label>
            <MultipleSelector
              value={selectedUsers}
              onChange={handleUserSelect}
              defaultOptions={userOptions}
              placeholder="Search users..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={setRole}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PARTICIPANT_ROLES.MODERATOR}>Moderator</SelectItem>
                <SelectItem value={PARTICIPANT_ROLES.ATTENDEE}>Attendee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 