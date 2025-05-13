import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = process.env.STRAPI_API_TOKEN
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments?populate=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch departments')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = process.env.STRAPI_API_TOKEN
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    })

    if (!response.ok) {
      throw new Error('Failed to create department')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 