'use client'

import { useRef, useEffect, useCallback } from 'react'
import { LyricLine } from '@/types'

interface Props {
  lines: LyricLine[]
  onChange: (lines: LyricLine[]) => void
}

export default function LyricLines({ lines, onChange }: Props) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const focusId = useRef<string | null>(null)

  useEffect(() => {
    if (focusId.current) {
      const el = inputRefs.current.get(focusId.current)
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
      focusId.current = null
    }
  }, [lines])

  const updateLine = useCallback(
    (id: string, text: string) => {
      onChange(lines.map((l) => (l.id === id ? { ...l, text } : l)))
    },
    [lines, onChange]
  )

  const removeLine = useCallback(
    (id: string) => {
      if (lines.length <= 1) return
      onChange(lines.filter((l) => l.id !== id))
    },
    [lines, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const newId = Date.now().toString()
        const next = [...lines]
        next.splice(index + 1, 0, { id: newId, text: '' })
        focusId.current = newId
        onChange(next)
      }
      if (e.key === 'Backspace' && lines[index].text === '' && lines.length > 1) {
        e.preventDefault()
        const prev = lines[index - 1]
        const next = lines.filter((_, i) => i !== index)
        if (prev) focusId.current = prev.id
        onChange(next)
      }
    },
    [lines, onChange]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      const text = e.clipboardData.getData('text')
      if (!text.includes('\n')) return
      e.preventDefault()
      const pasted = text
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
      if (pasted.length === 0) return
      const newLines = pasted.map((t, i) => ({
        id: `${Date.now()}-${i}`,
        text: t,
      }))
      const next = [...lines]
      next.splice(index, 1, ...newLines)
      focusId.current = newLines[newLines.length - 1].id
      onChange(next)
    },
    [lines, onChange]
  )

  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => (
        <div key={line.id} className="flex items-center gap-1.5 group">
          <span className="text-[10px] text-[#bbb] w-3.5 text-right flex-shrink-0 select-none">
            {i + 1}
          </span>
          <input
            ref={(el) => {
              if (el) inputRefs.current.set(line.id, el)
              else inputRefs.current.delete(line.id)
            }}
            value={line.text}
            onChange={(e) => updateLine(line.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            className="flex-1 h-[28px] px-2 text-[12px] bg-[#f8f8f8] border border-[#ebebeb] rounded-sm outline-none focus:border-[#ccc] focus:bg-white transition-all"
            placeholder="Type a lyric..."
          />
          {lines.length > 1 && (
            <button
              onClick={() => removeLine(line.id)}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-[#ccc] hover:text-[#888] transition-opacity flex-shrink-0"
              aria-label="Remove line"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
