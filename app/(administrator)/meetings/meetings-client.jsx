"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingModal } from "@/components/meetings/meeting-modal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MeetingsClient({ meetings = [], users = [], onMeetingUpdate, session }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const router = useRouter()

  useEffect(() => {
    console.log('MeetingsClient - Received meetings:', meetings)
  }, [meetings])

  const handleJoinMeeting = (meeting) => {
    router.push(`/room-meet/${meeting.id}`)
  }

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting)
    setIsAddModalOpen(true)
  }

  const handleSaveMeeting = async (meeting) => {
    try {
      // Call the update function from parent
      await onMeetingUpdate()
      toast.success("Meeting saved successfully")
    } catch (error) {
      console.error('Error updating meetings list:', error)
      toast.error("Failed to update meetings list")
    }
  }

  const filterMeetings = (meetings, status) => {
    const now = new Date()
    return meetings.filter(meeting => {
      const startTime = new Date(meeting.startTime)
      const endTime = new Date(meeting.endTime)
      
      if (status === 'scheduled') {
        return startTime > now
      } else if (status === 'past') {
        return endTime < now
      }
      return true
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterMeetings(meetings, 'all').map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => handleJoinMeeting(meeting)}
                onEdit={() => handleEditMeeting(meeting)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterMeetings(meetings, 'scheduled').map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => handleJoinMeeting(meeting)}
                onEdit={() => handleEditMeeting(meeting)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterMeetings(meetings, 'past').map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => handleJoinMeeting(meeting)}
                onEdit={() => handleEditMeeting(meeting)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <MeetingModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        meeting={selectedMeeting}
        users={users}
        onSave={handleSaveMeeting}
        session={session}
      />
    </div>
  )
} 