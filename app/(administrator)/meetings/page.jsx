export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { MeetingsWrapper } from '@/components/meetings/meetings-wrapper'

async function getMeetings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      console.log('No token found')
      return { meetings: [], users: [] }
    }

    // Fetch meetings
    const meetingsResponse = await fetch(`${apiUrl}/api/meetings?populate=users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!meetingsResponse.ok) {
      console.error('Failed to fetch meetings:', meetingsResponse.status)
      return { meetings: [], users: [] }
    }

    const meetingsData = await meetingsResponse.json()
    const meetings = meetingsData.data || []

    // Fetch users
    const usersResponse = await fetch(`${apiUrl}/api/users?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!usersResponse.ok) {
      console.error('Failed to fetch users:', usersResponse.status)
      return { meetings, users: [] }
    }

    const usersData = await usersResponse.json()
    const users = usersData || []

    return { meetings, users }
  } catch (error) {
    console.error('Error fetching data:', error)
    return { meetings: [], users: [] }
  }
}

export default async function MeetingsPage() {
  const { meetings, users } = await getMeetings()

  return (
    <div className="container mx-auto py-6">
      <MeetingsWrapper initialMeetings={meetings} initialUsers={users} />
    </div>
  )
} 