import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ hits: [] })

  const apiKey = process.env.GENIUS_API_KEY
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    return NextResponse.json(
      { hits: [], error: 'API key not configured. Add your RapidAPI key to .env.local' },
      { status: 200 }
    )
  }

  try {
    const res = await fetch(
      `https://genius-song-lyrics1.p.rapidapi.com/search/?q=${encodeURIComponent(q)}&per_page=8`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com',
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      console.error('Genius API error:', res.status, res.statusText)
      return NextResponse.json({ hits: [], error: `API error: ${res.status}` })
    }

    const data = await res.json()

    // RapidAPI returns hits at top level, not nested under response
    const allHits = data?.hits ?? data?.response?.hits ?? []
    const hits = allHits.filter((h: Record<string, unknown>) => h.type === 'song')

    return NextResponse.json({ hits: hits.slice(0, 8) })
  } catch (err) {
    console.error('Search failed:', err)
    return NextResponse.json({ hits: [], error: 'Search request failed' })
  }
}
