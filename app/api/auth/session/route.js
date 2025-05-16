import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = await cookieStore.get('token')?.value
    const userData = await cookieStore.get('user')?.value

    if (!token || !userData) {
      return new NextResponse(null, { status: 401 })
    }

    try {
      const user = JSON.parse(userData)
      return NextResponse.json({ user, token })
    } catch (error) {
      console.error('Error parsing user data:', error)
      return new NextResponse(null, { status: 401 })
    }
  } catch (error) {
    console.error('Session check error:', error)
    return new NextResponse(null, { status: 500 })
  }
} 