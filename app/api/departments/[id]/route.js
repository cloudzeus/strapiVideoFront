import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const token = process.env.STRAPI_API_TOKEN
    const { id } = params
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    })

    if (!response.ok) {
      throw new Error('Failed to update department')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = process.env.STRAPI_API_TOKEN
    const { id } = params

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete department')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 