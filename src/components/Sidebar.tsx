'use client'

import { useCallback } from 'react'
import { CardState, LyricLine } from '@/types'
import LyricLines from './LyricLines'

interface Props {
  state: CardState
  onChange: (patch: Partial<CardState>) => void
  onDownload: () => void
  onUploadClick: () => void
}

const ratios: { key: CardState['ratio']; label: string }[] = [
  { key: 'sq', label: '1:1' },
  { key: 'story', label: 'Story' },
  { key: 'wide', label: 'Wide' },
]

const aligns: { key: CardState['align']; label: string }[] = [
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-2 select-none" style={{ color: 'var(--fg-muted)' }}>
      {children}
    </div>
  )
}

export default function Sidebar({ state, onChange, onDownload, onUploadClick }: Props) {

  const removeImage = useCallback(() => {
    onChange({
      imgSrc: null,
      imgX: 0,
      imgY: 0,
      imgScale: 1,
      imgNatW: 0,
      imgNatH: 0,
    })
  }, [onChange])

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col h-full overflow-y-auto" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 flex flex-col gap-5">
        {/* RATIO */}
        <div>
          <SectionLabel>Ratio</SectionLabel>
          <div className="flex gap-1">
            {ratios.map((r) => (
              <button
                key={r.key}
                onClick={() => onChange({ ratio: r.key })}
                className={`flex-1 h-[30px] text-[11px] tracking-wide border transition-all ${
                  state.ratio === r.key
                    ? ''
                    : ''
                }`}
                style={{
                  fontWeight: state.ratio === r.key ? 500 : 400,
                  background: state.ratio === r.key ? 'var(--active-bg)' : 'var(--input-bg)',
                  color: state.ratio === r.key ? 'var(--active-fg)' : 'var(--fg-secondary)',
                  borderColor: state.ratio === r.key ? 'var(--active-bg)' : 'var(--border)',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* LYRICS */}
        <div>
          <SectionLabel>Lyrics</SectionLabel>
          <LyricLines
            lines={state.lines}
            onChange={(lines: LyricLine[]) => onChange({ lines })}
          />
        </div>

        {/* ALIGNMENT */}
        <div>
          <SectionLabel>Alignment</SectionLabel>
          <div className="flex gap-1">
            {aligns.map((a) => (
              <button
                key={a.key}
                onClick={() => onChange({ align: a.key })}
                className={`flex-1 h-[30px] text-[11px] tracking-wide border transition-all ${
                  state.align === a.key
                    ? ''
                    : ''
                }`}
                style={{
                  fontWeight: state.align === a.key ? 500 : 400,
                  background: state.align === a.key ? 'var(--active-bg)' : 'var(--input-bg)',
                  color: state.align === a.key ? 'var(--active-fg)' : 'var(--fg-secondary)',
                  borderColor: state.align === a.key ? 'var(--active-bg)' : 'var(--border)',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* SONG INFO */}
        <div>
          <SectionLabel>Song Info</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <input
              value={state.artist}
              onChange={(e) => onChange({ artist: e.target.value })}
              className="h-[28px] px-2 text-[12px] rounded-sm outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              placeholder="Artist name"
            />
            <input
              value={state.song}
              onChange={(e) => onChange({ song: e.target.value })}
              className="h-[28px] px-2 text-[12px] rounded-sm outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              placeholder="Song title"
            />
          </div>
        </div>

        {/* PHOTO */}
        <div>
          <SectionLabel>Photo</SectionLabel>
          <div className="flex gap-2 items-start">
            <button
              onClick={onUploadClick}
              className="h-[30px] px-3 text-[11px] tracking-wide transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--fg-secondary)' }}
            >
              Upload
            </button>
            {state.imgSrc && (
              <>
                <img
                  src={state.imgSrc}
                  alt=""
                  className="w-[30px] h-[30px] object-cover rounded-sm"
                  style={{ border: '1px solid var(--border)' }}
                />
                <button
                  onClick={removeImage}
                  className="h-[30px] px-2 text-[11px] hover:opacity-80 transition-colors"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  Remove
                </button>
              </>
            )}
          </div>

          {/* Darken */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>Darken</span>
              <span className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>
                {state.overlayOpacity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={state.overlayOpacity}
              onChange={(e) =>
                onChange({ overlayOpacity: Number(e.target.value) })
              }
              className="w-full h-1 appearance-none rounded-sm cursor-pointer"
              style={{ background: 'var(--slider-track)' }}
            />
          </div>

          {/* Radial Blur */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>Radial Blur</span>
              <span className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>
                {state.blurAmount}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={state.blurAmount}
              onChange={(e) =>
                onChange({ blurAmount: Number(e.target.value) })
              }
              className="w-full h-1 appearance-none rounded-sm cursor-pointer"
              style={{ background: 'var(--slider-track)' }}
            />
          </div>
        </div>

        {/* COLORS */}
        <div>
          <SectionLabel>Colors</SectionLabel>
          <div className="flex flex-col gap-2">
            <ColorRow
              label="Bar"
              value={state.barColor}
              onChange={(v) => onChange({ barColor: v })}
            />
            <ColorRow
              label="Highlight"
              value={state.highlightColor}
              onChange={(v) => onChange({ highlightColor: v })}
            />
            <ColorRow
              label="Text"
              value={state.textColor}
              onChange={(v) => onChange({ textColor: v })}
            />
          </div>
        </div>

        {/* FONT SIZE */}
        <div>
          <SectionLabel>Font Size</SectionLabel>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={11}
              max={28}
              value={state.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="flex-1 h-1 appearance-none rounded-sm cursor-pointer"
              style={{ background: 'var(--slider-track)' }}
            />
            <span className="text-[11px] w-6 text-right" style={{ color: 'var(--fg-muted)' }}>
              {state.fontSize}
            </span>
          </div>
        </div>

        {/* DOWNLOAD */}
        <button
          onClick={onDownload}
          className="h-[38px] w-full text-[12px] tracking-[0.06em] transition-colors"
          style={{ fontWeight: 500, background: 'var(--active-bg)', color: 'var(--active-fg)' }}
        >
          Download PNG
        </button>
      </div>
    </div>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-14" style={{ color: 'var(--fg-secondary)' }}>{label}</span>
      <label className="relative w-6 h-6 rounded-sm cursor-pointer overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute inset-0"
          style={{ background: value }}
        />
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[24px] w-[72px] px-1.5 text-[11px] rounded-sm outline-none font-mono"
        style={{ color: 'var(--fg-secondary)', background: 'var(--input-bg)', border: '1px solid var(--border)' }}
      />
    </div>
  )
}
