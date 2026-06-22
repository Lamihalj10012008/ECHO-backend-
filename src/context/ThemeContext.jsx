import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      const dark = savedTheme === 'dark'
      setIsDark(dark)
      updateTheme(dark)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      updateTheme(prefersDark)
    }
  }, [])

  const updateTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-dark-900')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('bg-dark-900')
    }
  }

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev
      updateTheme(newValue)
      localStorage.setItem('theme', newValue ? 'dark' : 'light')
      return newValue
    })
  }

  const value = {
    isDark,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
