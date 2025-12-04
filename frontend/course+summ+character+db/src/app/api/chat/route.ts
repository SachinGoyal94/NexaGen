import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://persona-flow-zqxz.onrender.com'

// Generate intelligent local responses
function generateLocalResponse(userMessage: string, characterName: string): string {
  const message = userMessage.toLowerCase()
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `Hello there! I'm ${characterName}. It's wonderful to meet you! How can I help you today?`
  }
  
  // How are you responses
  if (message.includes('how are you')) {
    return `I'm doing wonderfully, thank you for asking! As ${characterName}, I'm always ready for an interesting conversation.`
  }
  
  // Question responses
  if (message.includes('?')) {
    return `That's a fascinating question! As ${characterName}, I find that quite intriguing. Let me share my thoughts on that...`
  }
  
  // Compliment responses
  if (message.includes('great') || message.includes('awesome') || message.includes('amazing')) {
    return `Oh, thank you so much! That's very kind of you to say!`
  }
  
  // Default response
  return `As ${characterName}, I find your message quite interesting! Tell me more about what's on your mind.`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Try to forward the request to the external backend
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${BACKEND_URL}/chat/`, {
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
      
      // Fallback: Generate a local response
      const userMessage = formData.get('user_message') as string || ''
      const personaId = formData.get('persona_id') as string || '1'
      
      // Mock character name based on persona ID - include user 20's characters
      const characterNames: { [key: string]: string } = {
        '1': 'Sherlock Holmes',
        '2': 'Wonder Woman', 
        '3': 'The Joker',
        '101': 'Dhoni',
        '102': 'Custom Character',
        '103': 'Wifey'
      }
      
      const characterName = characterNames[personaId] || 'Character'
      const localResponse = generateLocalResponse(userMessage, characterName)
      
      return NextResponse.json({
        response: localResponse,
        fallback: true
      })
    }
  } catch (error) {
    console.error('Error sending chat message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}