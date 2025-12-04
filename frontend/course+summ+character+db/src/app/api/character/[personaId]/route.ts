import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://persona-flow-zqxz.onrender.com'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const { personaId } = await params
    const formData = await request.formData()
    
    // Forward request to real backend
    try {
      const response = await fetch(`${BACKEND_URL}/character/${personaId}`, {
        method: 'DELETE',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Backend returned ${response.status}`)
      }
    } catch (backendError) {
      console.log('Backend unavailable:', backendError.message)
      return NextResponse.json(
        { error: 'Backend unavailable. Please try again later.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error deleting persona:', error)
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    )
  }
}