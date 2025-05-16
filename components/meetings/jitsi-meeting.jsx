"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function JitsiMeeting({ 
  domain = 'jitsi.i4ria.com',
  roomName,
  displayName,
  onApiReady,
  onReadyToClose,
  configOverwrite = {},
  interfaceConfigOverwrite = {}
}) {
  const jitsiContainerRef = useRef(null)
  const apiRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !jitsiContainerRef.current) return

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = `https://${domain}/external_api.js`
        script.async = true
        script.onload = resolve
        script.onerror = (e) => reject(new Error(`Failed to load Jitsi API script: ${e.message}`))
        document.body.appendChild(script)
      })
    }

    const initializeJitsi = () => {
      try {
        console.log('Initializing Jitsi with container:', jitsiContainerRef.current)
        const options = {
          roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
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
            startParticipants: configOverwrite.startParticipants || [],
            ...configOverwrite
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'shortcuts', 'tileview', 'select-background', 'download', 'help',
              'mute-everyone', 'security'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#27272A',
            ...interfaceConfigOverwrite
          },
          userInfo: {
            displayName,
            email: configOverwrite.startParticipants?.find(p => p.name === displayName)?.email
          }
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options)
        setIsLoading(false)
        setError(null)

        // Add event listeners
        apiRef.current.addEventListeners({
          videoConferenceJoined: () => {
            console.log('Joined the conference')
          },
          videoConferenceLeft: () => {
            console.log('Left the conference')
            onReadyToClose?.()
          },
          participantJoined: () => {
            console.log('Participant joined')
          },
          participantLeft: () => {
            console.log('Participant left')
          },
          audioMuteStatusChanged: (data) => {
            console.log('Audio mute status changed:', data)
          },
          videoMuteStatusChanged: (data) => {
            console.log('Video mute status changed:', data)
          },
          screenSharingStatusChanged: (data) => {
            console.log('Screen sharing status changed:', data)
          },
          participantRoleChanged: (data) => {
            console.log('Participant role changed:', data)
          },
          chatUpdated: (data) => {
            console.log('Chat updated:', data)
          },
          error: (error) => {
            console.error('Jitsi error:', error)
            setError(error)
          }
        })

        // Call the onApiReady callback
        onApiReady?.(apiRef.current)
      } catch (error) {
        console.error('Error initializing Jitsi:', error)
        setError(error)
        setIsLoading(false)
      }
    }

    // Load Jitsi script then initialize the meeting
    loadJitsiScript()
      .then(initializeJitsi)
      .catch(error => {
        console.error('Error setting up Jitsi:', error)
        setError(error)
        setIsLoading(false)
      })

    // Cleanup
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [domain, roomName, displayName, configOverwrite, interfaceConfigOverwrite, onApiReady, onReadyToClose])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error.message || 'Failed to connect to the meeting'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: '600px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      )}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full" 
        style={{ 
          position: 'relative',
          zIndex: 1
        }} 
      />
    </div>
  )
} 