import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const body = await request.json()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    console.log('Received request body:', body)

    // Format the users array to be just IDs
    const formattedUsers = body.data.users.map(user => user.value || user)

    const requestBody = {
      data: {
        name: body.data.name,
        description: body.data.description,
        startTime: body.data.startTime,
        endTime: body.data.endTime,
        roomName: body.data.roomName,
        isRecurring: body.data.isRecurring,
        jitsiStatus: body.data.jitsiStatus,
        users: formattedUsers
      }
    }

    console.log('Sending to Strapi:', requestBody)

    const response = await fetch(`${apiUrl}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()
    console.log('Strapi response:', data)

    if (!response.ok) {
      console.error('Strapi error:', data)
      return NextResponse.json(
        { error: data.error || 'Failed to create meeting' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const body = await request.json()
    
    console.log('Received update request body:', body)

    // Format the users array to be just IDs
    const formattedUsers = body.data.users.map(user => user.value || user)

    const requestBody = {
      data: {
        name: body.data.name,
        description: body.data.description,
        startTime: body.data.startTime,
        endTime: body.data.endTime,
        roomName: body.data.roomName,
        isRecurring: body.data.isRecurring,
        jitsiStatus: body.data.jitsiStatus,
        users: formattedUsers
      }
    }

    console.log('Sending to Strapi:', requestBody)

    const response = await fetch(`${apiUrl}/api/meetings/${body.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${body.token}`
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()
    console.log('Strapi update response:', data)

    if (!response.ok) {
      console.error('Strapi update error:', data)
      return NextResponse.json(
        { error: data.error || 'Failed to update meeting' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 