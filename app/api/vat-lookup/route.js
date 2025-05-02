import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const vatNumber = searchParams.get('vatNumber')

  if (!vatNumber) {
    return new Response(JSON.stringify({ error: 'VAT number is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('Looking up VAT number:', vatNumber)
    
    const requestBody = {
      afm: vatNumber
    }
    console.log('Request body:', requestBody)
    
    const response = await fetch('https://vat.wwa.gr/afm2info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`VAT lookup failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Raw VAT lookup response:', JSON.stringify(data, null, 2))

    if (!data.basic_rec) {
      console.log('No basic_rec found in response:', data)
      return new Response(
        JSON.stringify({ error: 'No VAT number matched' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the basic_rec data structure
    console.log('Basic record data:', JSON.stringify(data.basic_rec, null, 2))

    // Return the raw data as is, since we're handling the mapping in the frontend
    return new Response(JSON.stringify(data.basic_rec), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in VAT lookup:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request) {
  try {
    const { vatNumber } = await request.json()
    console.log('Received VAT lookup request for:', vatNumber)

    if (!vatNumber) {
      return NextResponse.json(
        { error: 'VAT number is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://vat.wwa.gr/afm2info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        afm: vatNumber
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch VAT information')
    }

    const data = await response.json()
    console.log('Raw VAT service response:', data)

    if (!data.basic_rec) {
      return NextResponse.json(
        { error: 'No VAT number matched' },
        { status: 404 }
      )
    }

    // Map the response to our expected format
    const mappedData = {
      name: data.basic_rec.commer_title || data.basic_rec.onomasia, // Use commercial title if available, fallback to full name
      address: `${data.basic_rec.postal_address} ${data.basic_rec.postal_address_no}`.trim(),
      zip: data.basic_rec.postal_zip_code,
      city: data.basic_rec.postal_area_description,
      vatNumber: data.basic_rec.afm,
      irsOffice: data.basic_rec.doy_descr,
      // Additional fields that might be useful
      legalStatus: data.basic_rec.legal_status_descr,
      registrationDate: data.basic_rec.regist_date,
      activities: data.firm_act_tab?.item?.map(activity => ({
        code: activity.firm_act_code,
        description: activity.firm_act_descr,
        type: activity.firm_act_kind_descr
      })) || []
    }
    console.log('Mapped response data:', mappedData)

    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('VAT lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VAT information' },
      { status: 500 }
    )
  }
} 