import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './ThemeContext'
import { getStoredTheme, persistTheme } from './themeStorage'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    persistTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
