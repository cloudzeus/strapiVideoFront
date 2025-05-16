"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getSession } from "@/app/actions/auth"

export default async function MeetingRoom({ params }) {
  const session = await getSession()
  const router = useRouter()
  const [meeting, setMeeting] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
        const meetingId = params?.id
        
        console.log('Environment:', {
          apiUrl,
          meetingId,
          hasToken: !!session.token,
          nodeEnv: process.env.NODE_ENV
        })
        
        if (!meetingId) {
          throw new Error('Meeting ID is required')
        }

        // First, let's check if we can get all meetings
        console.log('Fetching all meetings...')
        const allMeetingsResponse = await fetch(
          `${apiUrl}/api/meetings?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        )

        if (!allMeetingsResponse.ok) {
          const errorData = await allMeetingsResponse.text()
          console.error('All Meetings API Error:', {
            status: allMeetingsResponse.status,
            statusText: allMeetingsResponse.statusText,
            error: errorData
          })
          throw new Error(`Failed to fetch meetings: ${allMeetingsResponse.status}`)
        }

        const allMeetingsData = await allMeetingsResponse.json()
        console.log('All Available Meetings:', allMeetingsData)

        // Find the meeting in the list
        const meetingData = allMeetingsData.data?.find(m => m.id === parseInt(meetingId))
        if (!meetingData) {
          throw new Error(`Meeting with ID ${meetingId} not found`)
        }

        setMeeting(meetingData)
        setCurrentUser(session.user)

      } catch (error) {
        console.error("Error fetching meeting data:", error)
        toast.error(error.message || "Failed to load meeting data")
        router.push('/meetings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetingData()
  }, [params?.id, router, session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Meeting not found</h2>
          <p className="text-gray-600 mt-2">The meeting you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push("/meetings")}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Return to Meetings
          </button>
        </div>
      </div>
    )
  }

  const meetingName = meeting.attributes?.name || 'Untitled Meeting'
  const roomName = meeting.attributes?.roomName || `meeting-${params?.id}`

  console.log('Rendering meeting with:', {
    meetingName,
    roomName,
    currentUser: currentUser?.username
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Your meeting room UI */}
    </div>
  )
}
