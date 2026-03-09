'use client'

import { useState, useRef, useEffect } from 'react'

import { SongInfo } from '@/types'

interface SearchResult {
  type: string
  result: {
    id: number
    title: string
    primary_artist: { name: string }
    song_art_image_thumbnail_url: string
  }
}

export default function SearchBar({
  onSelect,
}: {
  onSelect: (song: SongInfo) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const [error, setError] = useState('')

  const search = async (q: string) => {
    if (q.length < 2) {
      setOpen(false)
      return
    }
    setLoading(true)
    setOpen(true)
    setError('')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(data.hits || [])
      }
    } catch {
      setError('Search failed')
      setResults([])
    }
    setLoading(false)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => search(v), 400)
  }

  const pick = (hit: SearchResult) => {
    const artist = hit.result?.primary_artist?.name || ''
    const song = hit.result?.title || ''
    onSelect({
      id: hit.result?.id,
      title: song,
      artist,
      thumbnail: hit.result?.song_art_image_thumbnail_url || '',
    })
    setQuery(`${artist} – ${song}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <input
        value={query}
        onChange={handleInput}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="Search for any song..."
        className="w-full h-[34px] rounded-sm pl-8 pr-3 text-[13px] outline-none transition-all"
        style={{ background: 'var(--search-bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
      />
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--fg-faint)' }}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 rounded-sm shadow-lg max-h-80 overflow-y-auto z-50" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {loading && (
            <div className="p-4 text-center text-[12px]" style={{ color: 'var(--fg-faint)' }}>
              Searching...
            </div>
          )}
          {!loading && error && (
            <div className="p-4 text-center text-[12px] text-[#c44]">
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="p-4 text-center text-[12px]" style={{ color: 'var(--fg-faint)' }}>
              No songs found
            </div>
          )}
          {!loading &&
            results.map((hit, i) => (
              <div
                key={i}
                onClick={() => pick(hit)}
                className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <img
                  src={hit.result?.song_art_image_thumbnail_url}
                  alt=""
                  className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                  style={{ background: 'var(--input-bg)' }}
                  onError={(e) =>
                    (e.currentTarget.style.display = 'none')
                  }
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--fg)' }}>
                    {hit.result?.title}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--fg-muted)' }}>
                    {hit.result?.primary_artist?.name}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
