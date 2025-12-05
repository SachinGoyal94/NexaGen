import { NextRequest, NextResponse } from 'next/server'

// Persistent user database - maps usernames to their IDs
// New users will be assigned sequentially starting from 100
let userCounter = 100
const mockUsers = new Map([
  ['gogo', 1],
  ['test', 2],
  ['demo', 3],
  ['mera', 20]
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
    let userId = mockUsers.get(username)
    
    if (!userId) {
      // Create a consistent new user ID for unknown usernames
      userId = userCounter++
      mockUsers.set(username, userId)
      console.log(`Created new user: ${username} with ID: ${userId}`)
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