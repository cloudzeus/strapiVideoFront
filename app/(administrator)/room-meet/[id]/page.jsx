"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { JitsiMeeting } from "@jitsi/react-sdk"
import { Loader2, Users, Mic, Video, MicOff, VideoOff, Share, Settings, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function MeetingRoom() {
  const router = useRouter()
  const params = useParams()
  const [meeting, setMeeting] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(true)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
        const meetingId = params?.id
        const token = localStorage.getItem("token")
        
        console.log('Environment:', {
          apiUrl,
          meetingId,
          hasToken: !!token,
          nodeEnv: process.env.NODE_ENV
        })
        
        if (!meetingId) {
          throw new Error('Meeting ID is required')
        }

        if (!token) {
          throw new Error('Authentication token is required')
        }

        // First, let's check if we can get all meetings
        console.log('Fetching all meetings...')
        const allMeetingsResponse = await fetch(
          `${apiUrl}/api/meetings?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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

        // Get current user from localStorage
        const userId = localStorage.getItem("userId")
        console.log('Current User ID:', userId)
        
        // Since this is an admin view, we'll set the current user as administrator
        setCurrentUser({
          attributes: {
            username: 'Administrator'
          }
        })

      } catch (error) {
        console.error("Error fetching meeting data:", error)
        toast.error(error.message || "Failed to load meeting data")
        router.push('/meetings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetingData()
  }, [params?.id, router])

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
    currentUser: currentUser?.attributes?.username
  })

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <JitsiMeeting
          domain="jitsi.i4ria.com"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: isAudioMuted,
            startWithVideoMuted: isVideoMuted,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            disablePolls: false,
            disableReactions: false,
            disableSelfView: false,
            enableClosePage: true,
            enableWelcomePage: false,
            enableLobby: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            enableInsecureRoomNameWarning: true,
            enableAutomaticUrlCopy: true,
            enableLayerSuspension: true,
            enableForcedReload: true,
            enableIceRestart: true,
            enableIceUdpMux: true,
            enableIceTcp: true,
            enableIPv6: true,
            enableP2P: true,
            p2pEnabled: true,
            p2pPreferH264: true,
            p2pDisableH264: false,
            p2pStunServers: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302"
            ],
            resolution: 720,
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 720,
                  min: 240
                }
              }
            },
            maxChromiumVersion: 94,
            maxFullResolutionParticipants: 2,
            minParticipants: 1,
            maxParticipants: 100,
            startAudioOnly: false,
            startAudioMuted: isAudioMuted,
            startWithAudioMuted: isAudioMuted,
            startWithVideoMuted: isVideoMuted,
            subject: meetingName,
            disable1On1Mode: false,
            defaultLanguage: "en",
            disableRemoteMute: false,
            enableUserRolesBasedOnToken: true,
            websocket: 'wss://jitsi.i4ria.com/xmpp-websocket',
            clientNode: 'https://jitsi.i4ria.com'
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'shortcuts', 'tileview', 'select-background', 'download', 'help',
              'mute-everyone', 'security'
            ],
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
            DEFAULT_LOCAL_DISPLAY_NAME: 'You',
            TOOLBAR_ALWAYS_VISIBLE: true
          }}
          userInfo={{
            displayName: currentUser?.attributes?.username || 'Administrator'
          }}
          getIFrameRef={(iframeRef) => { 
            if (iframeRef) {
              iframeRef.style.height = 'calc(100vh - 8rem)'
              iframeRef.style.width = '100%'
            }
          }}
        />
      </div>
    </div>
  )
}
