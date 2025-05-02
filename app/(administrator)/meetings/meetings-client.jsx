"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingModal } from "@/components/meetings/meeting-modal"
import { AddParticipantModal } from "@/components/meetings/add-participant-modal"
import { toast } from "sonner"
import { getToken } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function MeetingsClient({ meetings = [], users = [] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const filterMeetings = (meetings, type) => {
    if (!meetings || !Array.isArray(meetings)) return []
    
    return meetings.filter(meeting => {
      if (!meeting?.startTime) return false
      const startTime = new Date(meeting.startTime)
      const now = new Date()
      
      switch (type) {
        case 'scheduled':
          return startTime > now
        case 'past':
          return startTime <= now
        default:
          return true
      }
    })
  }

  const handleAddParticipants = async (participants) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication required')
        return
      }

      console.log('Adding participants:', participants)

      // Create participants one by one
      for (const participant of participants) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/participants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              user: participant.data.user,
              meeting: participant.data.meeting,
              participantRole: participant.data.participantRole,
              department: participant.data.department
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to add participant:', errorData)
          throw new Error(`Failed to add participant: ${errorData.error?.message || response.statusText}`)
        }
      }

      // Refresh the page to update the meetings list
      router.refresh()
      toast.success("Participants added successfully")
    } catch (error) {
      console.error('Error adding participants:', error)
      toast.error(error.message || 'Failed to add participants')
    }
  }

  const scheduledMeetings = filterMeetings(meetings, 'scheduled')
  const pastMeetings = filterMeetings(meetings, 'past')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Meeting</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!meetings || meetings.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No meetings found
              </div>
            ) : (
              meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={{
                    id: meeting.id,
                    name: meeting.name,
                    description: meeting.description,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                    participants: meeting.participants || []
                  }}
                  onEdit={() => {}}
                  onView={() => {}}
                  onAddParticipant={() => {
                    setSelectedMeeting(meeting)
                    setIsAddParticipantModalOpen(true)
                  }}
                  onDelete={() => {}}
                  onJoin={() => {}}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledMeetings.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No scheduled meetings found
              </div>
            ) : (
              scheduledMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={{
                    id: meeting.id,
                    name: meeting.name,
                    description: meeting.description,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                    participants: meeting.participants || []
                  }}
                  onEdit={() => {}}
                  onView={() => {}}
                  onAddParticipant={() => {
                    setSelectedMeeting(meeting)
                    setIsAddParticipantModalOpen(true)
                  }}
                  onDelete={() => {}}
                  onJoin={() => {}}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastMeetings.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No past meetings found
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={{
                    id: meeting.id,
                    name: meeting.name,
                    description: meeting.description,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                    participants: meeting.participants || []
                  }}
                  onEdit={() => {}}
                  onView={() => {}}
                  onAddParticipant={() => {
                    setSelectedMeeting(meeting)
                    setIsAddParticipantModalOpen(true)
                  }}
                  onDelete={() => {}}
                  onJoin={() => {}}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <MeetingModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        meeting={null}
        onSave={() => {}}
        users={users}
      />

      <AddParticipantModal
        open={isAddParticipantModalOpen}
        onOpenChange={setIsAddParticipantModalOpen}
        meeting={selectedMeeting}
        users={users}
        onSave={handleAddParticipants}
      />
    </div>
  )
} 