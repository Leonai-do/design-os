
import React, { useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { useAppStore } from '../store/useAppStore'

export function ThemeToggle() {
  const { theme, setTheme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    if (theme === 'system') {
        setTheme('light');
    } else if (theme === 'light') {
        setTheme('dark');
    } else {
        setTheme('system');
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-full"
      title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
    >
      {theme === 'dark' ? <Moon className="w-4 h-4" /> : 
       theme === 'light' ? <Sun className="w-4 h-4" /> : 
       <Monitor className="w-4 h-4" />}
    </Button>
  )
}
