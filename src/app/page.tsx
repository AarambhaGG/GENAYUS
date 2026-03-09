'use client'

import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { CardState, SongInfo, defaultState } from '@/types'
import { useDragZoom } from '@/hooks/useDragZoom'
import SearchBar from '@/components/SearchBar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import LyricsPanel from '@/components/LyricsPanel'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const [state, setState] = useState<CardState>({ ...defaultState })
  const [selectedSong, setSelectedSong] = useState<SongInfo | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dragZoom = useDragZoom(
    useCallback((x: number, y: number, scale: number) => {
      setState((prev) => ({ ...prev, imgX: x, imgY: y, imgScale: scale }))
    }, [])
  )

  const patch = useCallback(
    (p: Partial<CardState>) => {
      setState((prev) => {
        const next = { ...prev, ...p }

        // When a new image is uploaded, auto-fit it to cover the card
        if (p.imgSrc && p.imgNatW && p.imgNatH) {
          const cardW =
            prev.ratio === 'sq' ? 480 : prev.ratio === 'story' ? 320 : 600
          const cardH =
            prev.ratio === 'sq' ? 430 : prev.ratio === 'story' ? 518 : 288
          const scale = Math.max(cardW / p.imgNatW, cardH / p.imgNatH)
          const scaledW = p.imgNatW * scale
          const scaledH = p.imgNatH * scale
          next.imgScale = scale
          next.imgX = (cardW - scaledW) / 2
          next.imgY = (cardH - scaledH) / 2
          dragZoom.reset(next.imgX, next.imgY, next.imgScale)
        }

        // Re-fit on ratio change when image exists
        if (p.ratio && prev.imgSrc && prev.imgNatW > 0) {
          const cardW =
            p.ratio === 'sq' ? 480 : p.ratio === 'story' ? 320 : 600
          const cardH =
            p.ratio === 'sq' ? 430 : p.ratio === 'story' ? 518 : 288
          const scale = Math.max(
            cardW / prev.imgNatW,
            cardH / prev.imgNatH
          )
          const scaledW = prev.imgNatW * scale
          const scaledH = prev.imgNatH * scale
          next.imgScale = scale
          next.imgX = (cardW - scaledW) / 2
          next.imgY = (cardH - scaledH) / 2
          dragZoom.reset(next.imgX, next.imgY, next.imgScale)
        }

        return next
      })
    },
    [dragZoom]
  )

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          patch({
            imgSrc: reader.result as string,
            imgNatW: img.naturalWidth,
            imgNatH: img.naturalHeight,
            imgX: 0,
            imgY: 0,
            imgScale: 1,
          })
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    },
    [patch]
  )

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const download = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = 'genayus-card.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [])

  const handleSearchSelect = useCallback(
    (song: SongInfo) => {
      setSelectedSong(song)
      patch({ artist: song.artist, song: song.title })
    },
    [patch]
  )

  const handleLyricLineClick = useCallback(
    (text: string) => {
      setState((prev) => ({
        ...prev,
        lines: [
          ...prev.lines,
          { id: Date.now().toString(), text },
        ],
      }))
    },
    []
  )

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* SHARED FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* HEADER */}
      <header className="h-[48px] flex-shrink-0 flex items-center justify-between px-5 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <span
          className="text-[13px] tracking-[0.22em]"
          style={{ fontWeight: 500, color: 'var(--fg)' }}
        >
          GENAYUS
        </span>
        <SearchBar onSelect={handleSearchSelect} />
        <ThemeToggle />
      </header>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          state={state}
          onChange={patch}
          onDownload={download}
          onUploadClick={triggerUpload}
        />

        {/* CANVAS AREA */}
        <main className="flex-1 flex items-center justify-center overflow-auto" style={{ background: 'var(--bg-canvas)' }}>
          <Card
            ref={cardRef}
            state={state}
            dragHandlers={dragZoom}
            onUploadClick={triggerUpload}
          />
        </main>

        <LyricsPanel song={selectedSong} onLineClick={handleLyricLineClick} />
      </div>
    </div>
  )
}
