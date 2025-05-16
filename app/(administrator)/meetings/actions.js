'use server'

export async function createMeeting(formData, token) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const response = await fetch(`${apiUrl}/api/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: formData }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create meeting')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error creating meeting:', error)
    throw error
  }
}

export async function updateMeeting(id, formData, token) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const response = await fetch(`${apiUrl}/api/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: formData }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update meeting')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error updating meeting:', error)
    throw error
  }
}

export async function deleteMeeting(id, token) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const response = await fetch(`${apiUrl}/api/meetings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to delete meeting')
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting meeting:', error)
    throw error
  }
} 