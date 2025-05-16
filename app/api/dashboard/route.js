import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      console.error('No token found in cookies')
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    // Validate token with Strapi
    const validateResponse = await fetch(`${apiUrl}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })

    if (!validateResponse.ok) {
      console.error('Token validation failed:', validateResponse.status)
      return NextResponse.json(
        { error: 'Invalid token' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    // Fetch users
    const usersResponse = await fetch(`${apiUrl}/api/users?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store'
    })

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users')
    }

    const usersData = await usersResponse.json()

    // Fetch meetings
    const meetingsResponse = await fetch(`${apiUrl}/api/meetings?populate=users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store'
    })

    if (!meetingsResponse.ok) {
      throw new Error('Failed to fetch meetings')
    }

    const meetingsData = await meetingsResponse.json()

    // Fetch organizations
    const orgsResponse = await fetch(`${apiUrl}/api/organizations?populate=departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store'
    })

    if (!orgsResponse.ok) {
      throw new Error('Failed to fetch organizations')
    }

    const orgsData = await orgsResponse.json()

    return NextResponse.json({
      users: usersData.data || [],
      meetings: meetingsData.data || [],
      organizations: orgsData.data || []
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
} 