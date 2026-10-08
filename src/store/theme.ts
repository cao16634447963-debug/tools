import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggleTheme: () => void
}

/** 同步 html[data-theme]，供全局 CSS 适配深色模式 */
const applyDomTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = (localStorage.getItem('theme') as ThemeMode) || 'light'
  applyDomTheme(initial)

  return {
    mode: initial,
    toggleTheme: () => {
      const next: ThemeMode = get().mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      applyDomTheme(next)
      set({ mode: next })
    },
  }
})
