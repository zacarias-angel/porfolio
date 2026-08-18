import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Project } from '../data/projects'
import { useSettings } from '../settings'
import { monthsFull } from '../i18n'

const ENTRY_GAP = 64

type Props = {
  projects: Project[]
  selectedId: string | null
  onChange: (project: Project) => void
}

export default function Timeline({ projects, selectedId, onChange }: Props) {
  const { t, lang } = useSettings()

  const entries = useMemo(
    () => [...projects].sort((a, b) => a.year - b.year || a.month - b.month),
    [projects],
  )

  const totalWidth = Math.max(0, (entries.length - 1) * ENTRY_GAP)

  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewW, setViewW] = useState(0)
  const [offset, setOffsetState] = useState(0)
  const offsetRef = useRef(0)
  const draggingRef = useRef(false)
  const startRef = useRef({ x: 0, offset: 0 })
  const initializedRef = useRef(false)
  const committedRef = useRef<string | null>(null)
  const wheelTimerRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  const setOffset = useCallback(
    (v: number) => {
      const next = Math.min(totalWidth, Math.max(0, v))
      offsetRef.current = next
      setOffsetState(next)
    },
    [totalWidth],
  )

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setViewW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (viewW === 0 || initializedRef.current) return
    initializedRef.current = true
    if (entries.length > 0) setOffset((entries.length - 1) * ENTRY_GAP)
  }, [viewW, entries, setOffset])

  const activeEntry = useMemo(() => {
    if (entries.length === 0) return null
    let best = entries[0]
    let bd = Infinity
    entries.forEach((e, i) => {
      const d = Math.abs(i * ENTRY_GAP - offset)
      if (d < bd) {
        bd = d
        best = e
      }
    })
    return best
  }, [entries, offset])

  useEffect(() => {
    if (!activeEntry) return
    if (committedRef.current === activeEntry.id) return
    committedRef.current = activeEntry.id
    onChangeRef.current(activeEntry)
  }, [activeEntry])

  useEffect(() => {
    if (!selectedId) return
    if (selectedId === committedRef.current) return
    if (draggingRef.current) return
    const idx = entries.findIndex((e) => e.id === selectedId)
    if (idx === -1) return
    committedRef.current = selectedId
    setOffset(idx * ENTRY_GAP)
  }, [selectedId, entries, setOffset])

  const snap = useCallback(() => {
    if (entries.length === 0) return
    let idx = 0
    let bd = Infinity
    entries.forEach((e, i) => {
      const d = Math.abs(i * ENTRY_GAP - offsetRef.current)
      if (d < bd) {
        bd = d
        idx = i
      }
    })
    setOffset(idx * ENTRY_GAP)
  }, [entries, setOffset])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = (e.deltaY || e.deltaX) * 0.5
      setOffset(offsetRef.current + delta)
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = window.setTimeout(snap, 140)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    }
  }, [setOffset, snap])

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    startRef.current = { x: e.clientX, offset: offsetRef.current }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const delta = e.clientX - startRef.current.x
    setOffset(startRef.current.offset - delta)
  }

  const onPointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    snap()
  }

  const activeId = activeEntry?.id ?? null

  return (
    <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-5 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t('timeline')}</h2>
        <p className="text-[11px] text-zinc-400">{t('dragHint')}</p>
      </div>

      <div
        ref={viewportRef}
        className="relative mt-2 h-[84px] cursor-grab select-none overflow-hidden active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute top-0 h-full" style={{ transform: `translateX(${-offset}px)`, willChange: 'transform' }}>
          <div className="absolute top-0 h-full" style={{ width: viewW / 2 }} />

          <div className="absolute top-0 h-full" style={{ left: viewW / 2, width: totalWidth }}>
            <div className="absolute bottom-[12px] left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-700" />

            {entries.map((p, i) => {
              const x = i * ENTRY_GAP
              const isActive = p.id === activeId
              const newYear = i === 0 || entries[i - 1].year !== p.year
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOffset(x)}
                  className="absolute top-0 h-full w-8 -translate-x-1/2 cursor-pointer"
                  style={{ left: x }}
                  aria-label={`${p.title} · ${monthsFull[lang][p.month - 1]} ${p.year}`}
                >
                  {newYear && (
                    <span
                      className={`absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold ${
                        isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {p.year}
                    </span>
                  )}
                  <span
                    className={`absolute top-[20px] left-1/2 -translate-x-1/2 text-[9px] leading-none whitespace-nowrap ${
                      isActive ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {monthsFull[lang][p.month - 1]}
                  </span>
                  <span
                    className={`absolute bottom-[12px] left-1/2 h-4 w-[3px] -translate-x-1/2 rounded-full ${
                      isActive ? 'bg-amber-500' : 'bg-zinc-500 dark:bg-zinc-300'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          <div className="absolute top-0 h-full" style={{ left: viewW / 2 + totalWidth, width: viewW / 2 }} />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 top-0 left-1/2 w-[2px] bg-red-500"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="pb-3 text-center text-sm font-semibold tabular-nums">
        {activeEntry ? (
          <span>
            {activeEntry.title} · {monthsFull[lang][activeEntry.month - 1]} {activeEntry.year}
          </span>
        ) : (
          <span className="text-zinc-300 dark:text-zinc-600">&nbsp;</span>
        )}
      </div>
    </section>
  )
}
