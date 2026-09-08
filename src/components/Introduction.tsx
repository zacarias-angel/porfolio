import { ArrowRight, Code2, Github, Mail, Server } from 'lucide-react'
import { useSettings } from '../settings'
import backgroundImage from '../fondo.png'

export default function Introduction({ onViewTimeline }: { onViewTimeline: () => void }) {
  const { t, theme } = useSettings()

  return (
    <main
      className="min-h-0 flex-1 overflow-y-auto bg-cover bg-center bg-no-repeat px-5 py-6 sm:px-8 lg:flex lg:items-center lg:px-12 lg:py-8"
      style={{
        backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgb(9 9 11 / 0.88)' : 'rgb(255 255 255 / 0.88)'}, ${theme === 'dark' ? 'rgb(9 9 11 / 0.88)' : 'rgb(255 255 255 / 0.88)'}), url(${backgroundImage})`,
      }}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">{t('presentationEyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Zacarias Angel</h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t('presentationIntro')}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t('presentationExperience')}
          </p>
          <button
            type="button"
            onClick={onViewTimeline}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t('viewTimeline')} <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="grid gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm font-semibold"><Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t('mainStack')}</div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{t('stackDescription')}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm font-semibold"><Server className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t('focus')}</div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{t('presentationFocus')}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <a href="https://wa.me/541136170214" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-zinc-700 hover:text-amber-600 dark:text-zinc-200 dark:hover:text-amber-400"><WhatsAppIcon /> 11 3617-0214</a>
            <a href="mailto:angel.zacarias966@gmail.com" className="inline-flex items-center gap-2 font-medium text-zinc-700 hover:text-amber-600 dark:text-zinc-200 dark:hover:text-amber-400"><Mail className="h-4 w-4" /> angel.zacarias966@gmail.com</a>
            <a href="https://github.com/zacarias-angel" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-zinc-700 hover:text-amber-600 dark:text-zinc-200 dark:hover:text-amber-400"><Github className="h-4 w-4" /> GitHub</a>
          </div>
        </section>
      </div>
    </main>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M20 11.5a8 8 0 0 1-11.82 7.04L4 20l1.52-4.01A8 8 0 1 1 20 11.5Z" />
      <path d="M9.2 8.4c.18-.18.37-.15.52.13l.53 1.02c.1.2.08.36-.07.51l-.32.32c.45.88 1.15 1.58 2.03 2.03l.32-.32c.15-.15.31-.17.51-.07l1.02.53c.28.15.31.34.13.52l-.48.48c-.31.31-.77.42-1.18.26-1.86-.7-3.31-2.15-4.01-4.01-.16-.41-.05-.87.26-1.18l.48-.48Z" />
    </svg>
  )
}
