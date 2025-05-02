import { cookies } from 'next/headers'

export async function getUsers() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      console.error('No token found in cookies')
      return []
    }

    console.log('Fetching users with token:', token)

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?populate=department`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch users:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log('Raw API response:', data)

    // Transform the data to ensure it has the correct structure
    const users = data.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name
      } : null,
      role: user.role?.name
    })) || []

    console.log('Transformed users:', users)
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
} 