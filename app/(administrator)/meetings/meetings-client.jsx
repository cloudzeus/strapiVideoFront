"use client"

import { useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingModal } from "@/components/meetings/meeting-modal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createMeeting, updateMeeting, deleteMeeting } from "./actions"
import { MeetingUsersSelector } from "@/components/meetings/meeting-users-selector"

export function MeetingsClient({ session, initialMeetings = [] }) {
  const [meetings, setMeetings] = useState(initialMeetings)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateMeeting = useCallback(async (formData) => {
    try {
      setIsLoading(true)
      const newMeeting = await createMeeting(formData, session.token)
      setMeetings(prev => [...prev, newMeeting])
      toast.success("Meeting created successfully")
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message || "Failed to create meeting")
    } finally {
      setIsLoading(false)
    }
  }, [session.token])

  const handleUpdateMeeting = useCallback(async (id, formData) => {
    try {
      setIsLoading(true)
      const updatedMeeting = await updateMeeting(id, formData, session.token)
      setMeetings(prev => prev.map(meeting => 
        meeting.id === id ? updatedMeeting : meeting
      ))
      toast.success("Meeting updated successfully")
      setIsModalOpen(false)
      setSelectedMeeting(null)
    } catch (error) {
      toast.error(error.message || "Failed to update meeting")
    } finally {
      setIsLoading(false)
    }
  }, [session.token])

  const handleDeleteMeeting = useCallback(async (id) => {
    try {
      setIsLoading(true)
      await deleteMeeting(id, session.token)
      setMeetings(prev => prev.filter(meeting => meeting.id !== id))
      toast.success("Meeting deleted successfully")
    } catch (error) {
      toast.error(error.message || "Failed to delete meeting")
    } finally {
      setIsLoading(false)
    }
  }, [session.token])

  const handleEdit = useCallback((meeting) => {
    setSelectedMeeting(meeting)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMeeting(null)
  }, [])

  const handleJoinMeeting = (meeting) => {
    router.push(`/room-meet/${meeting.id}`)
  }

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const searchLower = searchQuery.toLowerCase()
      return (
        meeting.attributes?.name?.toLowerCase().includes(searchLower) ||
        meeting.attributes?.description?.toLowerCase().includes(searchLower) ||
        meeting.attributes?.roomName?.toLowerCase().includes(searchLower)
      )
    })
  }, [meetings, searchQuery])

  const scheduledMeetings = useMemo(() => {
    return filteredMeetings.filter(meeting => {
      const startTime = new Date(meeting.attributes?.startTime)
      return startTime > new Date()
    })
  }, [filteredMeetings])

  const pastMeetings = useMemo(() => {
    return filteredMeetings.filter(meeting => {
      const endTime = new Date(meeting.attributes?.endTime)
      return endTime < new Date()
    })
  }, [filteredMeetings])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => handleEdit(meeting)}
              onDelete={() => handleDeleteMeeting(meeting.id)}
              disabled={isLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => handleEdit(meeting)}
              onDelete={() => handleDeleteMeeting(meeting.id)}
              disabled={isLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => handleEdit(meeting)}
              onDelete={() => handleDeleteMeeting(meeting.id)}
              disabled={isLoading}
            />
          ))}
        </TabsContent>
      </Tabs>

      <MeetingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        meeting={selectedMeeting}
        onSave={selectedMeeting ? 
          (formData) => handleUpdateMeeting(selectedMeeting.id, formData) :
          handleCreateMeeting
        }
        isLoading={isLoading}
      />
    </div>
  )
} 