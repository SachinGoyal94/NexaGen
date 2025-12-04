import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://persona-flow-zqxz.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string, personaId: string }> }
) {
  try {
    const { userId, personaId } = await params
    
    // Try to forward the request to the external backend
    try {
      const response = await fetch(`${BACKEND_URL}/history/${userId}/${personaId}`)
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        throw new Error('Backend error')
      }
    } catch (backendError) {
      console.log('Backend unavailable, returning empty history')
      
      // Fallback: Return empty history
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error getting chat history:', error)
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    )
  }
}