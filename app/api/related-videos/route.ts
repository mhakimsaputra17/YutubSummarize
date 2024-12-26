import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 })
  }

  // In a real application, you would fetch related videos from YouTube API
  // For this example, we'll return mock data
  const mockRelatedVideos = [
    { id: 'abc123', title: 'Related Video 1', thumbnail: 'https://via.placeholder.com/120x90.png?text=Video+1' },
    { id: 'def456', title: 'Related Video 2', thumbnail: 'https://via.placeholder.com/120x90.png?text=Video+2' },
    { id: 'ghi789', title: 'Related Video 3', thumbnail: 'https://via.placeholder.com/120x90.png?text=Video+3' },
  ]

  return NextResponse.json({ items: mockRelatedVideos })
}

