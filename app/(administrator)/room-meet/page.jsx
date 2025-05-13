"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Users, Clock, Video, Plus, Pencil } from "lucide-react"
import { MeetingFormModal } from "@/components/meetings/meeting-form-modal"
import { AddParticipantModal } from "@/components/meetings/add-participant-modal"
import { toast } from "sonner"

export default function RoomMeet() {
  const router = useRouter()
  const [meetings, setMeetings] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchMeetings()
    fetchUsers()
  }, [router])

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/meetings?populate=participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setMeetings(data.data || [])
    } catch (error) {
      console.error("Error fetching meetings:", error)
      toast.error("Failed to fetch meetings")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users?populate=department`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    }
  }

  const handleJoinMeeting = (meeting) => {
    setSelectedMeeting(meeting)
  }

  const closeMeetingDetails = () => {
    setSelectedMeeting(null)
  }

  const handleSaveMeeting = (meetingData) => {
    if (meetingData.id) {
      // Update existing meeting
      setMeetings(prev => prev.map(m => m.id === meetingData.id ? meetingData : m))
    } else {
      // Add new meeting
      setMeetings(prev => [...prev, meetingData])
    }
  }

  const handleSaveParticipant = async (participants) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(participants[0])
      })

      if (!response.ok) {
        throw new Error('Failed to add participant')
      }

      // Refresh meetings to get updated participant list
      fetchMeetings()
      toast.success("Participant added successfully")
    } catch (error) {
      console.error('Error adding participant:', error)
      toast.error(error.message || "Failed to add participant")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meeting Rooms</h1>
        <button 
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="rounded-lg border bg-card p-4 shadow-2xl hover:bg-gray-300">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{meeting.attributes.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(meeting.attributes.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{meeting.attributes.participants?.data?.length || 0} Participants</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMeeting(meeting)
                    setIsAddParticipantModalOpen(true)
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Users size={16} />
                  Add Participants
                </button>
                <button
                  onClick={() => {
                    setSelectedMeeting(meeting)
                    setIsFormModalOpen(true)
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleJoinMeeting(meeting)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Video size={16} />
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedMeeting.attributes.title}</h2>
              <button
                onClick={closeMeetingDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-500" />
                <span>{new Date(selectedMeeting.attributes.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-500" />
                <span>{selectedMeeting.attributes.participants?.data?.length || 0} Participants</span>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Participants</h3>
                <div className="space-y-2">
                  {selectedMeeting.attributes.participants?.data?.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {participant.attributes.displayName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span>{participant.attributes.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={closeMeetingDetails}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Link
                  href={`/room-meet/${selectedMeeting.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Video size={16} />
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Form Modal */}
      <MeetingFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        meeting={selectedMeeting}
        onSave={handleSaveMeeting}
      />

      {/* Add Participant Modal */}
      <AddParticipantModal
        open={isAddParticipantModalOpen}
        onOpenChange={setIsAddParticipantModalOpen}
        meeting={selectedMeeting}
        users={users}
        onSave={handleSaveParticipant}
      />
    </div>
  )
} 