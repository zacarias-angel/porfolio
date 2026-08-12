import { useMemo, useState } from 'react'
import { projects, type Project } from './data/projects'
import { useSettings } from './settings'
import { monthsFull } from './i18n'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import ProjectDetail from './components/ProjectDetail'
import Timeline from './components/Timeline'
import { CalendarDays, FolderOpen } from 'lucide-react'

export default function App() {
  const { t, lang } = useSettings()

  const [year, setYear] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projectId],
  )

  const monthProjects = useMemo<Project[]>(() => {
    if (year === null || month === null) return []
    return projects.filter((p) => p.year === year && p.month === month)
  }, [year, month])

  const handleSelectProject = (p: Project) => {
    setProjectId(p.id)
    setYear(p.year)
    setMonth(p.month)
  }

  const handleTimelineChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    const list = projects.filter((p) => p.year === y && p.month === m)
    setProjectId(list.length === 1 ? list[0].id : null)
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          projects={projects}
          selectedId={projectId}
          year={year}
          month={month}
          onSelect={handleSelectProject}
        />

        <main className="min-w-0 flex-1">
          {selectedProject ? (
            <ProjectDetail project={selectedProject} />
          ) : monthProjects.length > 0 ? (
            <MonthList projects={monthProjects} year={year!} month={month!} onSelect={handleSelectProject} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      <Timeline projects={projects} year={year} month={month} onChange={handleTimelineChange} />
    </div>
  )
}

function MonthList({
  projects,
  year,
  month,
  onSelect,
}: {
  projects: Project[]
  year: number
  month: number
  onSelect: (p: Project) => void
}) {
  const { t, lang } = useSettings()

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      <div>
        <h1 className="text-lg font-bold">
          {monthsFull[lang][month - 1]} {year}
        </h1>
        <p className="text-sm text-zinc-500">
          {projects.length} {t('multipleProjects')}
        </p>
      </div>

      <div className="grid flex-1 auto-rows-min grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="group flex items-center gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <img src={p.image} alt="" className="h-16 w-20 shrink-0 object-cover" />
            <div className="min-w-0 flex-1 p-2">
              <p className="truncate text-sm font-semibold group-hover:text-amber-500 dark:group-hover:text-amber-300">
                {p.title}
              </p>
              <p className="truncate text-[11px] text-zinc-400">{p.tags.join(' · ')}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  const { t } = useSettings()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <FolderOpen className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">{t('emptyTitle')}</p>
        <p className="mt-1 max-w-xs text-xs text-zinc-500">{t('emptyHint')}</p>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
        <CalendarDays className="h-3.5 w-3.5" />
        {t('timeline')}
      </div>
    </div>
  )
}
