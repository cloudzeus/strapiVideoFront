import { getSession } from "@/app/actions/auth"
import { MeetingsClient } from "./meetings-client"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { MeetingsWrapper } from "./meetings-wrapper"

async function getMeetings(token) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const response = await fetch(`${apiUrl}/api/meetings?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch meetings')
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return []
  }
}

export default async function MeetingsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  try {
    const meetings = await getMeetings(session.token)
    
    return (
      <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
        <Suspense fallback={<div className="text-xs">Loading meetings...</div>}>
          <MeetingsWrapper />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error in MeetingsPage:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Error Loading Meetings</h2>
          <p className="text-gray-600 mt-2">There was a problem loading the meetings. Please try again later.</p>
        </div>
      </div>
    )
  }
} 