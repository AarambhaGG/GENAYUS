import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ lyrics: '' })

  const res = await fetch(
    `https://genius-song-lyrics1.p.rapidapi.com/song/lyrics/?id=${encodeURIComponent(id)}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.GENIUS_API_KEY!,
        'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com',
      },
      next: { revalidate: 60 },
    }
  )

  const data = await res.json()
  const plain =
    data?.response?.lyrics?.lyrics?.body?.plain ?? ''

  return NextResponse.json({ lyrics: plain })
}
