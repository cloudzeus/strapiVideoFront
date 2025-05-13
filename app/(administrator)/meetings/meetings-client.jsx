"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingModal } from "@/components/meetings/meeting-modal"
import { toast } from "sonner"
import { getToken } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function MeetingsClient({ meetings = [], users = [], onMeetingUpdate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

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

  const scheduledMeetings = filterMeetings(meetings, 'scheduled')
  const pastMeetings = filterMeetings(meetings, 'past')

  console.log('Filtered meetings:', {
    all: meetings,
    scheduled: scheduledMeetings,
    past: pastMeetings
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button onClick={() => {
          setSelectedMeeting(null)
          setIsAddModalOpen(true)
        }}>Add New Meeting</Button>
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
                  meeting={meeting}
                  onEdit={() => handleEditMeeting(meeting)}
                  onView={() => {}}
                  onDelete={async () => {
                    try {
                      await onMeetingUpdate()
                      toast.success("Meeting deleted successfully")
                    } catch (error) {
                      console.error('Error deleting meeting:', error)
                      toast.error("Failed to delete meeting")
                    }
                  }}
                  onJoin={() => handleJoinMeeting(meeting)}
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
                  meeting={meeting}
                  onEdit={() => handleEditMeeting(meeting)}
                  onView={() => {}}
                  onDelete={() => {}}
                  onJoin={() => handleJoinMeeting(meeting)}
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
                  meeting={meeting}
                  onEdit={() => handleEditMeeting(meeting)}
                  onView={() => {}}
                  onDelete={() => {}}
                  onJoin={() => handleJoinMeeting(meeting)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <MeetingModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        meeting={selectedMeeting}
        onSave={handleSaveMeeting}
        users={users}
      />
    </div>
  )
} 