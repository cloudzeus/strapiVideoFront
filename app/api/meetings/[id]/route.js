import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    
    console.log('Meeting ID from params:', id)
    
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    // Get body from request
    const body = await request.json()
    
    // Step 1: Fetch current meeting data to get existing users
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337'
    const currentMeetingUrl = `${strapiUrl}/api/meetings/${id}?populate=users`
    
    const currentMeetingResponse = await fetch(currentMeetingUrl, {
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    })

    if (!currentMeetingResponse.ok) {
      throw new Error('Failed to fetch current meeting data')
    }

    const currentMeeting = await currentMeetingResponse.json()
    const currentUserIds = currentMeeting.data?.attributes?.users?.data?.map(user => user.id) || []
    
    // Step 2: Handle users relationship
    if (body.data && body.data.users) {
      // If users is an array of objects, extract just the IDs
      if (Array.isArray(body.data.users) && body.data.users.length > 0 && typeof body.data.users[0] === 'object') {
        body.data.users = body.data.users.map(user => user.id)
      }
      
      // Format the users array properly for Strapi relations
      if (Array.isArray(body.data.users)) {
        // Create the final users array by filtering out removed users
        const updatedUserIds = body.data.users.filter(id => currentUserIds.includes(id) || body.data.users.includes(id))
        
        body.data.users = {
          set: updatedUserIds.map(userId => ({ id: userId }))
        }
      }
    }

    console.log('Updating meeting with formatted data:', {
      id,
      currentUsers: currentUserIds,
      newUsers: body.data.users.set,
      body: JSON.stringify(body, null, 2)
    })

    // Step 3: Update the meeting
    const updateUrl = `${strapiUrl}/api/meetings/${id}/custom?populate=users`
    
    console.log('Using custom update URL:', updateUrl)
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify(body)
    })

    console.log('Update response status:', updateResponse.status)

    if (!updateResponse.ok) {
      let errorText
      try {
        const errorData = await updateResponse.json()
        console.log('Update error data:', errorData)
        errorText = JSON.stringify(errorData)
      } catch (e) {
        errorText = await updateResponse.text()
        console.log('Update error text:', errorText)
      }
      
      return Response.json(
        { error: 'Failed to update meeting', details: errorText },
        { status: updateResponse.status }
      )
    }

    const data = await updateResponse.json()
    console.log('Update successful with data:', JSON.stringify(data, null, 2))
    
    return Response.json(data)
  } catch (error) {
    console.error('Error in PUT handler:', error)
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    console.log('Deleting meeting:', id)

    const response = await fetch(`${apiUrl}/api/meetings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Delete error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to delete meeting' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE handler:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 