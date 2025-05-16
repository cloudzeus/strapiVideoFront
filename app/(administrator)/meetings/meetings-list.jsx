"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, Users, Video, Pencil, Trash2, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { format, isPast, isFuture } from "date-fns"
import { MeetingModal } from "./meeting-modal"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

export function MeetingsList({ searchQuery, isAddModalOpen, setIsAddModalOpen, activeTab }) {
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [modalMode, setModalMode] = useState("add") // "add" | "edit" | "delete"

  const fetchMeetings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("Fetching meetings from:", `${STRAPI_URL}/api/meetings?populate=*`)
      
      const response = await fetch(
        `${STRAPI_URL}/api/meetings?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received meetings data:", data)
      setMeetings(data.data || [])
    } catch (error) {
      console.error("Error fetching meetings:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleModalClose = () => {
    setIsAddModalOpen(false)
    setSelectedMeeting(null)
    setModalMode("add")
  }

  const handleEdit = (meeting) => {
    setSelectedMeeting(meeting)
    setModalMode("edit")
    setIsAddModalOpen(true)
  }

  const handleDelete = (meeting) => {
    setSelectedMeeting(meeting)
    setModalMode("delete")
    setIsAddModalOpen(true)
  }

  // Filter meetings based on search query and active tab
  const filteredMeetings = meetings?.filter((meeting) => {
    if (!meeting) return false
    
    // First filter by search query
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      meeting.name?.toLowerCase().includes(searchLower) ||
      meeting.description?.toLowerCase().includes(searchLower) ||
      meeting.roomName?.toLowerCase().includes(searchLower)
    )

    if (!matchesSearch) return false

    // Then filter by tab
    const startTime = new Date(meeting.startTime)
    const endTime = new Date(meeting.endTime)
    const now = new Date()

    switch (activeTab) {
      case 'scheduled':
        return isFuture(startTime)
      case 'live':
        return now >= startTime && now <= endTime
      case 'past':
        return isPast(endTime)
      default:
        return true
    }
  }) || []

  console.log("Filtered meetings:", filteredMeetings)

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error loading meetings: {error}
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4"
          onClick={fetchMeetings}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-xs">Loading meetings...</div>
  }

  if (!filteredMeetings.length) {
    return (
      <div className="text-xs text-muted-foreground">
        No {activeTab} meetings found.
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4"
          onClick={fetchMeetings}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100%-3rem)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="h-[300px] w-full min-w-0 shadow-2xl hover:bg-gray-50">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0 text-xs">
                      <p className="text-xs font-medium truncate">
                        {meeting.name || 'No name'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {meeting.roomName || 'No room'}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-[10px] ${
                        meeting.jitsiStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        meeting.jitsiStatus === 'in-progress' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meeting.jitsiStatus || 'scheduled'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(meeting.startTime), 'PPp')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {meeting.users?.length || 0} Participants
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => {
                              window.location.href = `/room-meet/${meeting.id}`
                            }}
                          >
                            <Video className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Join Meeting
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => handleEdit(meeting)}
                          >
                            <Pencil className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Edit Meeting
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => handleDelete(meeting)}
                          >
                            <Trash2 className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Delete Meeting
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MeetingModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        meeting={selectedMeeting}
        onSuccess={fetchMeetings}
      />
    </>
  )
} 