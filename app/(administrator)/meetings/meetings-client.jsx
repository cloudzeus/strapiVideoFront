"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingModal } from "@/components/meetings/meeting-modal"
import { toast } from "sonner"

export function MeetingsClient({ meetings = [], users = [] }) {
  console.log('Meetings data:', meetings) // Debug log

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

  const scheduledMeetings = filterMeetings(meetings, 'scheduled')
  const pastMeetings = filterMeetings(meetings, 'past')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button>Add New Meeting</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          className="pl-8"
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
                  onAddParticipant={() => {}}
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
                  onAddParticipant={() => {}}
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
                  onAddParticipant={() => {}}
                  onDelete={() => {}}
                  onJoin={() => {}}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 