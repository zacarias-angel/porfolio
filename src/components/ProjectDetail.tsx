import { useEffect, useRef, useState } from 'react'
import type { Project } from '../data/projects'
import { useSettings } from '../settings'
import { monthsFull } from '../i18n'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Layers, FileText } from 'lucide-react'

const statusKey = {
  completed: 'statusCompleted',
  active: 'statusActive',
  planned: 'statusPlanned',
} as const

const statusStyle: Record<string, string> = {
  completed: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  active: 'border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-400',
  planned: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-500 dark:text-zinc-400',
}

const statusDot: Record<string, string> = {
  completed: 'bg-emerald-500',
  active: 'bg-sky-500',
  planned: 'bg-zinc-400',
}

export default function ProjectDetail({ project }: { project: Project }) {
  const { t, lang } = useSettings()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const images = project.images ?? [project.image]

  useEffect(() => {
    if (!project.video) return
    setVideoReady(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    video.load()
  }, [project.id, project.video])

  useEffect(() => setImageIndex(0), [project.id])

  const changeImage = (direction: -1 | 1) => {
    setImageIndex((index) => (index + direction + images.length) % images.length)
  }

  return (
    <div className="flex min-h-full flex-col gap-4 p-6 md:h-full md:overflow-hidden">
      <div className="grid gap-6 lg:h-full lg:grid-cols-[1.1fr_1fr] lg:overflow-hidden">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800 lg:flex lg:h-full lg:items-center lg:justify-center lg:aspect-auto">
          {project.video ? (
            <video
              key={project.video}
              ref={videoRef}
              src={project.video}
              controls
              preload="metadata"
              playsInline
              onLoadedData={() => setVideoReady(true)}
              className={`h-full w-full object-contain object-center transition-opacity ${
                videoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="relative h-full w-full">
              <img
                key={images[imageIndex]}
                src={images[imageIndex]}
                alt={project.title}
                loading="eager"
                className="h-full w-full object-contain object-center"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Imagen anterior"
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Imagen siguiente"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setImageIndex(index)}
                        aria-label={`Ver imagen ${index + 1}`}
                        className={`h-2 w-2 rounded-full ${index === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{project.title}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays className="h-4 w-4" />
                {monthsFull[lang][project.month - 1]} {project.year}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle[project.status]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[project.status]}`} />
              {t(statusKey[project.status])}
            </span>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <FileText className="h-3.5 w-3.5" /> {t('description')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{project.description[lang]}</p>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <Layers className="h-3.5 w-3.5" /> {t('stack')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {(project.url || project.homepage) && (
            <div className="mt-auto flex flex-wrap gap-2">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <ExternalLink className="h-4 w-4" /> {t('github')}
                </a>
              )}
              {project.homepage && (
                <a
                  href={project.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <ExternalLink className="h-4 w-4" /> {t('demo')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
