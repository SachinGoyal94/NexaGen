import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://persona-flow-zqxz.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Try to forward the request to the external backend
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${BACKEND_URL}/set_character/`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Backend error')
      }
    } catch (backendError) {
      console.log('Backend unavailable, using fallback response')
      
      // Fallback: Create a mock persona with better summary
      const characterName = formData.get('character_name') as string || 'Unknown Character'
      const mode = formData.get('mode') as string || 'auto'
      const tone = formData.get('tone') as string || 'neutral'
      const customPrompt = formData.get('custom_prompt') as string || ''
      
      // Generate a better summary based on mode and custom prompt
      let summary = ''
      if (mode === 'custom' && customPrompt) {
        summary = `${customPrompt}. A ${tone} character.`
      } else {
        summary = `A ${tone} ${characterName} character with engaging personality.`
      }
      
      const mockPersona = {
        persona_id: Date.now(),
        character_name: characterName,
        summary: summary,
        created_at: new Date().toISOString()
      }
      
      return NextResponse.json(mockPersona)
    }
  } catch (error) {
    console.error('Error creating persona:', error)
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    )
  }
}