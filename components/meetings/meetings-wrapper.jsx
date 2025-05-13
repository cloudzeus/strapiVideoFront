"use client"

import { useState } from "react"
import { MeetingCard } from "./meeting-card"
import { Button } from "@/components/ui/button"
import { MeetingModal } from "./meeting-modal"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function MeetingsWrapper({ initialMeetings = [], initialUsers = [] }) {
  const [meetings, setMeetings] = useState(initialMeetings)
  const [users] = useState(initialUsers)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreate = async (newMeeting) => {
    try {
      setMeetings(prev => [...prev, newMeeting.data])
      toast.success("Meeting created successfully")
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error("Failed to create meeting")
    }
  }

  const handleUpdate = async (updatedMeeting) => {
    try {
      // Ensure we're working with the correct data structure
      const meetingData = updatedMeeting.data || updatedMeeting
      
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === meetingData.id ? meetingData : meeting
        )
      )
      toast.success("Meeting updated successfully")
    } catch (error) {
      console.error('Error updating meeting:', error)
      toast.error("Failed to update meeting")
    }
  }

  const handleDelete = async (meetingId) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete meeting')
      }

      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
      toast.success("Meeting deleted successfully")
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error("Failed to delete meeting")
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {meetings.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      <MeetingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreate}
      />
    </div>
  )
} 