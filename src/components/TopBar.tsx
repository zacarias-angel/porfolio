import { useSettings } from '../settings'
import { Moon, Sun, Languages, Boxes } from 'lucide-react'

export default function TopBar() {
  const { t, theme, lang, toggleTheme, toggleLang } = useSettings()

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none">{t('title')}</h1>
          <p className="mt-0.5 text-[11px] text-zinc-400">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLang}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label={t('language')}
        >
          <Languages className="h-4 w-4" />
          {lang.toUpperCase()}
        </button>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label={t('theme')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {t('theme')}
        </button>
      </div>
    </header>
  )
}
