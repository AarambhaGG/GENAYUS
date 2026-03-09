'use client'

import { useState, useEffect, useCallback } from 'react'
import { SongInfo } from '@/types'

interface Props {
  song: SongInfo | null
  onLineClick: (text: string) => void
}

export default function LyricsPanel({ song, onLineClick }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!song) {
      setLines([])
      setSelected(new Set())
      return
    }
    let cancelled = false
    setLoading(true)
    setSelected(new Set())
    fetch(`/api/lyrics?id=${song.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setLines(data.lines ?? [])
      })
      .catch(() => {
        if (!cancelled) setLines([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [song])

  const toggle = useCallback(
    (i: number, text: string) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(i)) {
          next.delete(i)
        } else {
          next.add(i)
          onLineClick(text)
        }
        return next
      })
    },
    [onLineClick]
  )

  if (!song) {
    return (
      <div className="w-[320px] flex-shrink-0 border-l border-[#ebebeb] bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-[12px] text-[#bbb] leading-relaxed">
            Search for a song to<br />browse lyrics
          </div>
        </div>
      </div>
    )
  }

  const isSection = (line: string) => /^\[.*\]$/.test(line)

  return (
    <div className="w-[320px] flex-shrink-0 border-l border-[#ebebeb] bg-white flex flex-col h-full overflow-hidden">
      {/* Song header */}
      <div className="flex items-center gap-3 p-3 border-b border-[#ebebeb] flex-shrink-0">
        {song.thumbnail && (
          <img
            src={song.thumbnail}
            alt=""
            className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#111] truncate">
            {song.title}
          </div>
          <div className="text-[11px] text-[#888] truncate">{song.artist}</div>
        </div>
      </div>

      {/* Lyrics list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-[12px] text-[#bbb]">
            Loading lyrics...
          </div>
        )}
        {!loading && lines.length === 0 && (
          <div className="p-6 text-center text-[12px] text-[#bbb]">
            No lyrics available
          </div>
        )}
        {!loading &&
          lines.map((line, i) =>
            isSection(line) ? (
              <div
                key={i}
                className="px-3 pt-4 pb-1 text-[10px] tracking-[0.06em] text-[#aaa] uppercase select-none"
              >
                {line}
              </div>
            ) : (
              <div
                key={i}
                onClick={() => toggle(i, line)}
                className={`px-3 py-[6px] text-[13px] leading-[1.5] cursor-pointer border-l-2 transition-all ${
                  selected.has(i)
                    ? 'border-l-[#917BBF] bg-[#f6f3fa] text-[#111]'
                    : 'border-l-transparent hover:bg-[#fafafa] text-[#444]'
                }`}
              >
                {line}
              </div>
            )
          )}
      </div>
    </div>
  )
}
