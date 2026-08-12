import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Project } from '../data/projects'
import { useSettings } from '../settings'
import { monthsFull } from '../i18n'

const MONTH_GAP = 52
const YEAR_GAP = 40
const YEAR_SPAN = 12 * MONTH_GAP + YEAR_GAP
const DOTS = 15

type Tick = { x: number; kind: 'month' | 'year'; year: number; month: number }

function buildTicks(years: number[]): Tick[] {
  const ticks: Tick[] = []
  years.forEach((year, i) => {
    const base = i * YEAR_SPAN
    for (let m = 1; m <= 12; m++) {
      ticks.push({ x: base + (m - 1) * MONTH_GAP, kind: 'month', year, month: m })
    }
    ticks.push({ x: base + 12 * MONTH_GAP, kind: 'year', year, month: 12 })
  })
  return ticks
}

type Props = {
  projects: Project[]
  year: number | null
  month: number | null
  onChange: (year: number, month: number) => void
}

export default function Timeline({ projects, year, month, onChange }: Props) {
  const { t, lang } = useSettings()

  const years = useMemo(() => [...new Set(projects.map((p) => p.year))].sort((a, b) => a - b), [projects])
  const ticks = useMemo(() => buildTicks(years), [years])
  const monthTicks = useMemo(() => ticks.filter((t) => t.kind === 'month'), [ticks])
  const totalWidth = years.length * YEAR_SPAN

  const projectMonths = useMemo(
    () => new Set(projects.map((p) => `${p.year}-${p.month}`)),
    [projects],
  )

  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewW, setViewW] = useState(0)
  const [offset, setOffset] = useState(0)
  const draggingRef = useRef(false)
  const startRef = useRef({ x: 0, offset: 0 })
  const initializedRef = useRef(false)
  const committedRef = useRef<string | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setViewW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clamp = (v: number) => Math.min(totalWidth, Math.max(0, v))

  const findTickX = (y: number, m: number) => {
    const idx = years.indexOf(y)
    if (idx === -1) return 0
    return idx * YEAR_SPAN + (m - 1) * MONTH_GAP
  }

  useLayoutEffect(() => {
    if (viewW === 0 || initializedRef.current) return
    initializedRef.current = true
    const latest = [...projects].sort((a, b) => b.year - a.year || b.month - a.month)[0]
    if (latest) setOffset(clamp(findTickX(latest.year, latest.month)))
  }, [viewW, years, projects])

  useEffect(() => {
    if (draggingRef.current) return
    if (year === null || month === null) return
    setOffset(clamp(findTickX(year, month)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const activeTick = useMemo(() => {
    if (monthTicks.length === 0) return null
    let best = monthTicks[0]
    let bd = Infinity
    for (const t of monthTicks) {
      const d = Math.abs(t.x - offset)
      if (d < bd) {
        bd = d
        best = t
      }
    }
    return best
  }, [monthTicks, offset])

  useEffect(() => {
    if (!activeTick) return
    const key = `${activeTick.year}-${activeTick.month}`
    if (committedRef.current === key) return
    committedRef.current = key
    onChangeRef.current(activeTick.year, activeTick.month)
  }, [activeTick])

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    startRef.current = { x: e.clientX, offset }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const delta = e.clientX - startRef.current.x
    setOffset(clamp(startRef.current.offset - delta))
  }

  const onPointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (activeTick) setOffset(clamp(activeTick.x))
  }

  return (
    <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-5 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t('timeline')}</h2>
        <p className="text-[11px] text-zinc-400">{t('dragHint')}</p>
      </div>

      <div
        ref={viewportRef}
        className="relative mt-2 h-[72px] cursor-grab select-none overflow-hidden active:cursor-grabbing"
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

            {years.map((year, i) => {
              const base = i * YEAR_SPAN
              return (
                <div key={year}>
                  {Array.from({ length: 12 }, (_, k) => k + 1).map((m) => {
                    const x = base + (m - 1) * MONTH_GAP
                    const active = projectMonths.has(`${year}-${m}`)
                    return (
                      <div key={m}>
                        <div
                          className={`absolute w-[2px] rounded-full ${
                            active ? 'bg-zinc-500 dark:bg-zinc-300' : 'bg-zinc-300 dark:bg-zinc-600'
                          }`}
                          style={{ left: x, bottom: 12, height: 16 }}
                        />
                        {Array.from({ length: DOTS }, (_, d) => d + 1).map((d) => (
                          <div
                            key={d}
                            className="absolute h-[2px] w-[2px] rounded-full bg-zinc-300 dark:bg-zinc-700"
                            style={{ left: x + (d * MONTH_GAP) / (DOTS + 1), bottom: 11 }}
                          />
                        ))}
                      </div>
                    )
                  })}
                  <div
                    className="absolute w-[3px] rounded-full bg-zinc-500 dark:bg-zinc-300"
                    style={{ left: base + 12 * MONTH_GAP, bottom: 12, height: 30 }}
                  />
                  <span
                    className="absolute text-[10px] font-semibold text-zinc-400 dark:text-zinc-500"
                    style={{ left: base + 12 * MONTH_GAP - 10, top: 2 }}
                  >
                    {year}
                  </span>
                </div>
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
        {activeTick ? (
          <span>
            {monthsFull[lang][activeTick.month - 1]} {activeTick.year}
          </span>
        ) : (
          <span className="text-zinc-300 dark:text-zinc-600">&nbsp;</span>
        )}
      </div>
    </section>
  )
}
