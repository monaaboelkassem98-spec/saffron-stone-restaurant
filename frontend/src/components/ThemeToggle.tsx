import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="flex size-9 shrink-0 items-center justify-center border border-[#e6e6ec] bg-[#fbfbfe] text-[#555563] transition duration-200 hover:border-[#d6a36a] hover:bg-[#f0f1fc] hover:text-[#a94f0b] dark:border-[#414755] dark:bg-[#252b38] dark:text-[#e8b47d] dark:hover:bg-[#343b49]"
    >
      {isDark ? (
        <Sun size={16} aria-hidden="true" />
      ) : (
        <Moon size={16} aria-hidden="true" />
      )}
    </button>
  )
}
