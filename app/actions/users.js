import { cookies } from 'next/headers'

export async function getUsers() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      console.error('No token found in cookies')
      return []
    }

    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    const response = await fetch(`${apiUrl}/api/users?populate=department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      throw new Error(errorData.error?.message || 'Failed to fetch users')
    }

    const data = await response.json()
    console.log('Raw users response:', data)
    return data
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
} 