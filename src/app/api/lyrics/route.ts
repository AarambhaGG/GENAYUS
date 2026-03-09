import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ lines: [] })

  const apiKey = process.env.GENIUS_API_KEY
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    return NextResponse.json({ lines: [], error: 'API key not configured' })
  }

  try {
    const res = await fetch(
      `https://genius-song-lyrics1.p.rapidapi.com/song/lyrics/?id=${encodeURIComponent(id)}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com',
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ lines: [], error: `API error: ${res.status}` })
    }

    const data = await res.json()
    const html: string = data?.lyrics?.lyrics?.body?.html ?? ''

    // Parse HTML to plain text lines
    const text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    return NextResponse.json({ lines })
  } catch (err) {
    console.error('Lyrics fetch failed:', err)
    return NextResponse.json({ lines: [], error: 'Failed to fetch lyrics' })
  }
}
