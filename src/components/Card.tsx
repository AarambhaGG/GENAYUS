'use client'

import { forwardRef, useRef } from 'react'
import { CardState } from '@/types'

const cardSizes: Record<CardState['ratio'], string> = {
  sq: 'w-[480px] h-[480px]',
  story: 'w-[320px] h-[568px]',
  wide: 'w-[600px] h-[338px]',
}

interface DragHandlers {
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onWheel: (
    e: React.WheelEvent,
    containerRef: React.RefObject<HTMLDivElement | null>
  ) => void
}

const Card = forwardRef<
  HTMLDivElement,
  { state: CardState; dragHandlers: DragHandlers; onUploadClick?: () => void }
>(({ state, dragHandlers, onUploadClick }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden flex flex-col ${cardSizes[state.ratio]}`}
      style={{ background: '#1a1a1a' }}
    >
      {/* PHOTO AREA */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden min-h-0 cursor-grab active:cursor-grabbing"
        onMouseDown={dragHandlers.onMouseDown}
        onMouseMove={dragHandlers.onMouseMove}
        onMouseUp={dragHandlers.onMouseUp}
        onMouseLeave={dragHandlers.onMouseUp}
        onWheel={(e) => dragHandlers.onWheel(e, containerRef)}
      >
        {state.imgSrc && (
          <img
            src={state.imgSrc}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              transformOrigin: '0 0',
              transform: `translate(${state.imgX}px, ${state.imgY}px) scale(${state.imgScale})`,
              width: state.imgNatW,
              height: state.imgNatH,
              maxWidth: 'none',
              maxHeight: 'none',
              pointerEvents: 'none',
            }}
          />
        )}

        {!state.imgSrc && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
            onClick={onUploadClick}
          >
            <div className="flex flex-col items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span className="text-[13px] text-[#666] select-none tracking-wide">
                Click to upload photo
              </span>
            </div>
          </div>
        )}

        {/* overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `rgba(0,0,0,${state.overlayOpacity / 100})`,
          }}
        />

        {/* gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.42))',
          }}
        />

        {/* LYRICS */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-[18px] pb-[14px] pointer-events-none">
          <div
            className="flex flex-col"
            style={{
              alignItems:
                state.align === 'center'
                  ? 'center'
                  : state.align === 'right'
                    ? 'flex-end'
                    : 'flex-start',
            }}
          >
            {state.lines
              .filter((l) => l.text.trim())
              .map((line) => (
                <div
                  key={line.id}
                  className="inline-block mb-[3px]"
                  style={{
                    background: state.highlightColor,
                    color: state.textColor,
                    fontSize: state.fontSize,
                    fontWeight: 400,
                    padding: '3px 8px',
                    lineHeight: 1.45,
                    letterSpacing: '0.01em',
                  }}
                >
                  {line.text}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        className="h-[50px] flex-shrink-0 flex items-center justify-between px-4 z-40"
        style={{ background: state.barColor }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.92)',
            textTransform: 'uppercase',
          }}
        >
          {state.artist}, &ldquo;{state.song}&rdquo;
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.8)',
            fontStyle: 'italic',
            textTransform: 'uppercase',
          }}
        >
          GENIUS
        </span>
      </div>
    </div>
  )
})

Card.displayName = 'Card'
export default Card
