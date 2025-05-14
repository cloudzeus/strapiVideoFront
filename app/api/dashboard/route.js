import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Fetch users
    const usersResponse = await fetch(`${apiUrl}/api/users?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users')
    }

    const usersData = await usersResponse.json()

    // Fetch meetings
    const meetingsResponse = await fetch(`${apiUrl}/api/meetings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!meetingsResponse.ok) {
      throw new Error('Failed to fetch meetings')
    }

    const meetingsData = await meetingsResponse.json()

    // Fetch organizations
    const orgsResponse = await fetch(`${apiUrl}/api/organizations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!orgsResponse.ok) {
      throw new Error('Failed to fetch organizations')
    }

    const orgsData = await orgsResponse.json()

    return NextResponse.json({
      users: usersData,
      meetings: meetingsData.data || [],
      organizations: orgsData.data || []
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 