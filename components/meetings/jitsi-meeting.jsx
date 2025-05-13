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
  const [isLoading, setIsLoading] = useState(true)
  const [api, setApi] = useState(null)

  useEffect(() => {
    // Load Jitsi Meet External API script
    const script = document.createElement('script')
    script.src = `https://${domain}/external_api.js`
    script.async = true
    script.onload = initializeJitsi
    document.body.appendChild(script)

    return () => {
      // Cleanup
      if (api) {
        api.dispose()
      }
      document.body.removeChild(script)
    }
  }, [])

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current) return

    const defaultConfig = {
      startWithAudioMuted: true,
      startWithVideoMuted: true,
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
      subject: roomName,
      disable1On1Mode: false,
      defaultLanguage: "en",
      disableRemoteMute: false,
      enableUserRolesBasedOnToken: true,
      websocket: `wss://${domain}/xmpp-websocket`,
      clientNode: `https://${domain}`
    }

    const defaultInterfaceConfig = {
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
    }

    const jitsiApi = new window.JitsiMeetExternalAPI(domain, {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: { ...defaultConfig, ...configOverwrite },
      interfaceConfigOverwrite: { ...defaultInterfaceConfig, ...interfaceConfigOverwrite },
      userInfo: {
        displayName
      }
    })

    jitsiApi.addEventListeners({
      videoConferenceJoined: () => {
        setIsLoading(false)
        onApiReady?.(jitsiApi)
      },
      readyToClose: () => {
        onReadyToClose?.()
      }
    })

    setApi(jitsiApi)
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  )
} 