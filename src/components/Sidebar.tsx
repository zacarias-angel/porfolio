import type { Project } from '../data/projects'
import { useSettings } from '../settings'
import { monthsShort } from '../i18n'

type Props = {
  projects: Project[]
  selectedId: string | null
  year: number | null
  month: number | null
  onSelect: (p: Project) => void
}

const statusDot: Record<string, string> = {
  completed: 'bg-emerald-500',
  active: 'bg-sky-500',
  planned: 'bg-zinc-400',
}

export default function Sidebar({ projects, selectedId, year, month, onSelect }: Props) {
  const { t, lang } = useSettings()
  const orderedProjects = [...projects].reverse()

  return (
    <aside className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:w-72 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t('projects')}</h2>
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {projects.length}
        </span>
      </div>

      <ul className="hidden flex-1 space-y-1 overflow-y-auto p-2 md:block">
        {orderedProjects.map((p) => {
          const active = p.id === selectedId
          const dimmed = (year !== null && p.year !== year) || (month !== null && p.month !== month)
          return (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${statusDot[p.status]} ${
                    dimmed && !active ? 'opacity-30' : ''
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-medium ${dimmed && !active ? 'opacity-40' : ''}`}>
                    {p.title}
                  </span>
                  <span className={`block text-[11px] text-zinc-400 ${dimmed && !active ? 'opacity-30' : ''}`}>
                    {monthsShort[lang][p.month - 1]} {p.year}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
