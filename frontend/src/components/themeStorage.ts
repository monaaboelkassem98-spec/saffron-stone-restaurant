export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'saffron-stone-theme'

export function getStoredTheme(): Theme {
  return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

export function applyStoredTheme() {
  const theme = getStoredTheme()
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function persistTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme)
}
