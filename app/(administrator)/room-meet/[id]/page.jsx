"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { JitsiMeeting } from "@/components/meetings/jitsi-meeting"

export default function MeetingRoom() {
  const router = useRouter()
  const params = useParams()
  const [meeting, setMeeting] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roomCreated, setRoomCreated] = useState(false)
  const jitsiContainerRef = useRef(null)

  useEffect(() => {
    const createAndJoinMeeting = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
        const meetingId = params?.id
        
        if (!meetingId) {
          throw new Error('Meeting ID is required')
        }

        console.log('Fetching meeting data for ID:', meetingId)
        console.log('API URL:', apiUrl)

        // First, get meeting data
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(
          `${apiUrl}/api/meetings/${meetingId}?populate=users`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Meeting API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          throw new Error(`Failed to fetch meeting data: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Meeting data received:', data)
        
        if (!data.data) {
          throw new Error('Invalid meeting data received')
        }

        setMeeting(data.data)
        const userData = JSON.parse(localStorage.getItem('userData'))
        console.log('User data:', userData)
        setCurrentUser(userData)

        // Create Jitsi meeting room
        const roomName = data.data.attributes?.roomName || `meeting-${meetingId}`
        console.log('Creating Jitsi room:', roomName)

        try {
          console.log('Making API call to create Jitsi room...')
          const jitsiResponse = await fetch(`${apiUrl}/api/jitsi/create-room`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              roomName,
              meetingId,
              participants: data.data.attributes?.users?.data || []
            })
          })

          if (!jitsiResponse.ok) {
            const jitsiError = await jitsiResponse.json().catch(() => ({}))
            console.error('Jitsi API Error:', {
              status: jitsiResponse.status,
              statusText: jitsiResponse.statusText,
              error: jitsiError,
              headers: Object.fromEntries(jitsiResponse.headers.entries())
            })
            throw new Error(`Failed to create Jitsi room: ${jitsiResponse.statusText}`)
          }

          const jitsiData = await jitsiResponse.json()
          console.log('Jitsi room created successfully:', jitsiData)
          setRoomCreated(true)
        } catch (jitsiError) {
          console.error('Jitsi room creation failed:', jitsiError)
          // Continue even if Jitsi room creation fails - we'll try to join anyway
          console.log('Continuing with room creation despite error...')
          setRoomCreated(true)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error in createAndJoinMeeting:", error)
        toast.error(error.message || "Failed to setup meeting")
        router.push('/meetings')
      }
    }

    if (params?.id) {
      createAndJoinMeeting()
    }
  }, [params?.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!meeting || !roomCreated) {
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

  // Get meeting details
  const meetingName = meeting.attributes?.name || 'Untitled Meeting'
  const roomName = meeting.attributes?.roomName || `meeting-${params?.id}`
  const displayName = currentUser?.name || currentUser?.username || 'Anonymous'
  const participants = meeting.attributes?.users?.data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen" ref={jitsiContainerRef}>
        <JitsiMeeting
          domain="jitsi.i4ria.com"
          roomName={roomName}
          displayName={displayName}
          containerStyles={{ width: '100%', height: '100%' }}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableClosePage: true,
            enableWelcomePage: false,
            enableLobby: false,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            enableP2P: true,
            p2p: {
              enabled: true,
              preferH264: true,
              disableH264: false,
              useStunTurn: true
            },
            startParticipants: participants.map(user => ({
              id: user.id,
              name: user.attributes?.name || user.attributes?.username || 'Anonymous',
              email: user.attributes?.email
            }))
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'shortcuts', 'tileview', 'select-background', 'download', 'help',
              'mute-everyone', 'security'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#27272A'
          }}
          onApiReady={(api) => {
            api.addEventListeners({
              videoConferenceJoined: () => {
                toast.success("Successfully joined the meeting")
              },
              videoConferenceLeft: () => {
                toast.info("You left the meeting")
                router.push('/meetings')
              },
              participantJoined: () => {
                toast.info("A new participant joined")
              },
              participantLeft: () => {
                toast.info("A participant left")
              }
            })
          }}
          onReadyToClose={() => {
            router.push('/meetings')
          }}
        />
      </div>
    </div>
  )
}
