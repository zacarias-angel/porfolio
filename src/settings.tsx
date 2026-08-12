import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from './i18n'

type Theme = 'dark' | 'light'

type SettingsContextType = {
  theme: Theme
  lang: Lang
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
  toggleTheme: () => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('porfolio.theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('porfolio.lang')
    return saved === 'en' ? 'en' : 'es'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('porfolio.theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('porfolio.lang', lang)
  }, [lang])

  const t = (key: TranslationKey) => translations[lang][key]

  const value: SettingsContextType = {
    theme,
    lang,
    setTheme,
    setLang,
    toggleTheme: () => setTheme((p) => (p === 'dark' ? 'light' : 'dark')),
    toggleLang: () => setLang((p) => (p === 'es' ? 'en' : 'es')),
    t,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
