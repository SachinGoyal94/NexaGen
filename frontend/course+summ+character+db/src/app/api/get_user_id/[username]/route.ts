import { NextRequest, NextResponse } from 'next/server'

// Mock user database - in a real app, this would be in a database
const mockUsers = new Map([
  ['gogo', 1],
  ['test', 2],
  ['demo', 3],
  ['mera', 20]  // Update mera to match external backend user ID
])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }
    
    // Get user ID from mock database
    const userId = mockUsers.get(username)
    
    if (!userId) {
      // For specific usernames we know, return consistent IDs
      if (username === 'mera') {
        return NextResponse.json({ user_id: 20 })
      }
      // Create a new user ID for other unknown usernames
      const newUserId = Date.now()
      mockUsers.set(username, newUserId)
      return NextResponse.json({ user_id: newUserId })
    }
    
    return NextResponse.json({ user_id: userId })
  } catch (error) {
    console.error('Error getting user ID:', error)
    return NextResponse.json(
      { error: 'Failed to get user ID' },
      { status: 500 }
    )
  }
}